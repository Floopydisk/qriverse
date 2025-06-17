
import { supabase } from '@/integrations/supabase/client';
import { rbacManager, Permission } from './rbac-manager';
import { auditLogger } from './audit-logger';
import { apiMonitor } from './api-monitor';

interface ApiKeyValidationResult {
  isValid: boolean;
  userId?: string;
  permissions: Permission[];
  rateLimit: number;
  rateLimitRemaining: number;
  error?: string;
}

interface ApiKeyUsageMetrics {
  totalRequests: number;
  requestsToday: number;
  lastUsed: Date | null;
  errorRate: number;
}

class ApiKeySecurityManager {
  private keyCache: Map<string, { userId: string; permissions: Permission[]; rateLimit: number; expires: number }> = new Map();
  private rateLimitCache: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

  // Generate cryptographically secure API key
  generateSecureApiKey(): { key: string; prefix: string } {
    const prefix = 'qrl_'; // QR Labs prefix
    const keyLength = 32;
    
    // Generate secure random bytes
    const randomBytes = new Uint8Array(keyLength);
    crypto.getRandomValues(randomBytes);
    
    // Convert to base64url (URL safe)
    const keyBody = btoa(String.fromCharCode(...randomBytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    const key = prefix + keyBody;
    
    return { key, prefix };
  }

  // Hash API key for secure storage
  private async hashApiKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Validate API key and return permissions
  async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
    try {
      // Check cache first
      const cached = this.keyCache.get(apiKey);
      if (cached && Date.now() < cached.expires) {
        const rateLimitInfo = this.checkRateLimit(apiKey, cached.rateLimit);
        return {
          isValid: true,
          userId: cached.userId,
          permissions: cached.permissions,
          rateLimit: cached.rateLimit,
          rateLimitRemaining: rateLimitInfo.remaining,
        };
      }

      // Hash the key for database lookup
      const hashedKey = await this.hashApiKey(apiKey);

      // Validate against database
      const { data: keyData, error } = await supabase
        .from('api_keys')
        .select('id, user_id, permissions, rate_limit, active, expires_at, last_used_at')
        .eq('key_hash', hashedKey)
        .single();

      if (error || !keyData || !keyData.active) {
        auditLogger.log('api_unauthorized_access', {
          apiKey: apiKey.substring(0, 8) + '...',
          error: 'Invalid or inactive API key'
        }, 'medium');

        return {
          isValid: false,
          permissions: [],
          rateLimit: 0,
          rateLimitRemaining: 0,
          error: 'Invalid or inactive API key'
        };
      }

      // Check expiration
      if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
        auditLogger.log('api_unauthorized_access', {
          apiKey: apiKey.substring(0, 8) + '...',
          error: 'Expired API key'
        }, 'medium');

        return {
          isValid: false,
          permissions: [],
          rateLimit: 0,
          rateLimitRemaining: 0,
          error: 'API key has expired'
        };
      }

      // Update last used timestamp
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', keyData.id);

      // Get user permissions from RBAC
      const userPermissions = rbacManager.getUserPermissions(keyData.user_id);
      const apiKeyPermissions = keyData.permissions as Permission[];
      
      // API key permissions are intersection of user permissions and key permissions
      const effectivePermissions = apiKeyPermissions.filter(permission => 
        userPermissions.includes(permission)
      );

      // Cache the result
      this.keyCache.set(apiKey, {
        userId: keyData.user_id,
        permissions: effectivePermissions,
        rateLimit: keyData.rate_limit,
        expires: Date.now() + this.CACHE_TTL
      });

      // Check rate limiting
      const rateLimitInfo = this.checkRateLimit(apiKey, keyData.rate_limit);
      if (!rateLimitInfo.allowed) {
        auditLogger.log('api_rate_limit_exceeded', {
          apiKey: apiKey.substring(0, 8) + '...',
          userId: keyData.user_id,
          rateLimit: keyData.rate_limit
        }, 'medium');

        return {
          isValid: false,
          permissions: effectivePermissions,
          rateLimit: keyData.rate_limit,
          rateLimitRemaining: 0,
          error: 'Rate limit exceeded'
        };
      }

      return {
        isValid: true,
        userId: keyData.user_id,
        permissions: effectivePermissions,
        rateLimit: keyData.rate_limit,
        rateLimitRemaining: rateLimitInfo.remaining,
      };

    } catch (error: any) {
      auditLogger.log('api_unauthorized_access', {
        apiKey: apiKey.substring(0, 8) + '...',
        error: error.message
      }, 'high');

      return {
        isValid: false,
        permissions: [],
        rateLimit: 0,
        rateLimitRemaining: 0,
        error: 'API key validation failed'
      };
    }
  }

  // Check rate limiting for API key
  private checkRateLimit(apiKey: string, rateLimit: number): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const windowStart = now - this.RATE_LIMIT_WINDOW;
    
    let rateLimitData = this.rateLimitCache.get(apiKey);
    
    if (!rateLimitData || rateLimitData.resetTime < now) {
      // Reset or initialize rate limit window
      rateLimitData = { count: 0, resetTime: now + this.RATE_LIMIT_WINDOW };
    }

    if (rateLimitData.count >= rateLimit) {
      return { allowed: false, remaining: 0 };
    }

    // Increment count
    rateLimitData.count += 1;
    this.rateLimitCache.set(apiKey, rateLimitData);

    return { 
      allowed: true, 
      remaining: Math.max(0, rateLimit - rateLimitData.count) 
    };
  }

  // Get API key usage metrics
  async getApiKeyMetrics(apiKeyId: string): Promise<ApiKeyUsageMetrics> {
    try {
      const { data: usageData, error } = await supabase
        .from('api_usage')
        .select('created_at, status_code')
        .eq('api_key_id', apiKeyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalRequests = usageData?.length || 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const requestsToday = usageData?.filter(usage => 
        new Date(usage.created_at) >= today
      ).length || 0;

      const lastUsed = usageData?.[0] ? new Date(usageData[0].created_at) : null;
      
      const errorRequests = usageData?.filter(usage => 
        usage.status_code >= 400
      ).length || 0;

      const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;

      return {
        totalRequests,
        requestsToday,
        lastUsed,
        errorRate
      };

    } catch (error) {
      console.error('Failed to get API key metrics:', error);
      return {
        totalRequests: 0,
        requestsToday: 0,
        lastUsed: null,
        errorRate: 0
      };
    }
  }

  // Revoke API key
  async revokeApiKey(apiKeyId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ active: false })
        .eq('id', apiKeyId);

      if (error) throw error;

      // Clear from cache
      for (const [key, value] of this.keyCache.entries()) {
        if (value.userId === apiKeyId) {
          this.keyCache.delete(key);
        }
      }

      auditLogger.log('api_unauthorized_access', {
        apiKeyId,
        reason,
        action: 'api_key_revoked'
      }, 'medium');

      return true;
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      return false;
    }
  }

  // Clear caches (useful for testing or forced refresh)
  clearCaches(): void {
    this.keyCache.clear();
    this.rateLimitCache.clear();
  }

  // Get API key security recommendations
  getSecurityRecommendations(apiKeyMetrics: ApiKeyUsageMetrics): string[] {
    const recommendations: string[] = [];

    if (apiKeyMetrics.errorRate > 20) {
      recommendations.push('High error rate detected. Review API implementation.');
    }

    if (apiKeyMetrics.requestsToday > 1000) {
      recommendations.push('High API usage detected. Consider implementing caching.');
    }

    if (!apiKeyMetrics.lastUsed || Date.now() - apiKeyMetrics.lastUsed.getTime() > 30 * 24 * 60 * 60 * 1000) {
      recommendations.push('API key not used in 30+ days. Consider revoking if unused.');
    }

    return recommendations;
  }

  // Helper method to get hash for storing in database (async version)
  async getApiKeyHash(key: string): Promise<string> {
    return await this.hashApiKey(key);
  }
}

export const apiKeySecurityManager = new ApiKeySecurityManager();
