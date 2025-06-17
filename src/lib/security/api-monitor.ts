import { auditLogger } from './audit-logger';

interface APIRequest {
  id: string;
  timestamp: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userAgent: string;
  ipAddress: string;
  userId?: string;
  size: number;
  headers: Record<string, string>;
}

interface APIPattern {
  endpoint: string;
  requests: APIRequest[];
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  suspiciousScore: number;
  lastAccessed: Date;
}

interface APIAbuse {
  type: 'rate_limit_exceeded' | 'error_flooding' | 'resource_exhaustion' | 'scraping_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  endpoint: string;
  ipAddress: string;
  evidence: string[];
}

class APIMonitor {
  private requests: APIRequest[] = [];
  private patterns: Map<string, APIPattern> = new Map();
  private maxRequests = 5000; // Keep last 5000 requests
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  // Track API request
  trackRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    options: {
      userAgent?: string;
      ipAddress?: string;
      userId?: string;
      size?: number;
      headers?: Record<string, string>;
    } = {}
  ): void {
    const request: APIRequest = {
      id: this.generateRequestId(),
      timestamp: new Date(),
      endpoint: this.normalizeEndpoint(endpoint),
      method: method.toUpperCase(),
      statusCode,
      responseTime,
      userAgent: options.userAgent || navigator.userAgent,
      ipAddress: options.ipAddress || this.getClientIP(),
      userId: options.userId,
      size: options.size || 0,
      headers: options.headers || {}
    };

    this.requests.push(request);
    this.updatePattern(request);
    this.checkRateLimit(request);
    this.trimRequests();

    // Log the request
    auditLogger.logApiAccess(
      request.endpoint,
      request.method,
      request.statusCode,
      request.responseTime,
      {
        userId: request.userId,
        ipAddress: request.ipAddress,
        size: request.size
      }
    );

    // Check for suspicious activity
    this.detectAPIAbuse(request);
  }

  // Get API statistics
  getAPIStats(timeRange?: { start: Date; end: Date }): {
    totalRequests: number;
    uniqueEndpoints: number;
    uniqueIPs: number;
    avgResponseTime: number;
    errorRate: number;
    topEndpoints: Array<{ endpoint: string; count: number; errorRate: number }>;
    statusCodes: Record<number, number>;
    suspiciousIPs: string[];
  } {
    let requests = this.requests;
    
    if (timeRange) {
      requests = requests.filter(r => 
        r.timestamp >= timeRange.start && r.timestamp <= timeRange.end
      );
    }

    const uniqueEndpoints = new Set(requests.map(r => r.endpoint));
    const uniqueIPs = new Set(requests.map(r => r.ipAddress));
    const totalResponseTime = requests.reduce((sum, r) => sum + r.responseTime, 0);
    const errors = requests.filter(r => r.statusCode >= 400);

    // Count status codes
    const statusCodes: Record<number, number> = {};
    requests.forEach(r => {
      statusCodes[r.statusCode] = (statusCodes[r.statusCode] || 0) + 1;
    });

    // Top endpoints
    const endpointCounts = new Map<string, { count: number; errors: number }>();
    requests.forEach(r => {
      const current = endpointCounts.get(r.endpoint) || { count: 0, errors: 0 };
      current.count++;
      if (r.statusCode >= 400) current.errors++;
      endpointCounts.set(r.endpoint, current);
    });

    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        count: stats.count,
        errorRate: stats.count > 0 ? (stats.errors / stats.count) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Suspicious IPs
    const suspiciousIPs = Array.from(this.patterns.values())
      .filter(p => p.suspiciousScore > 70)
      .map(p => p.endpoint.split(':')[0]) // Extract IP if endpoint contains it
      .filter(ip => ip.match(/^\d+\.\d+\.\d+\.\d+$/));

    return {
      totalRequests: requests.length,
      uniqueEndpoints: uniqueEndpoints.size,
      uniqueIPs: uniqueIPs.size,
      avgResponseTime: requests.length > 0 ? totalResponseTime / requests.length : 0,
      errorRate: requests.length > 0 ? (errors.length / requests.length) * 100 : 0,
      topEndpoints,
      statusCodes,
      suspiciousIPs
    };
  }

  // Get abuse detection results
  getAbuseDetection(): {
    detectedAbuse: APIAbuse[];
    riskScore: number;
    recommendations: string[];
  } {
    const abuse: APIAbuse[] = [];
    let riskScore = 0;

    // Check each pattern for abuse
    this.patterns.forEach((pattern, key) => {
      const patternAbuse = this.analyzePatternForAbuse(pattern);
      abuse.push(...patternAbuse);
      riskScore += patternAbuse.reduce((sum, a) => sum + a.confidence, 0);
    });

    // Check for global patterns
    const globalAbuse = this.detectGlobalAbuse();
    abuse.push(...globalAbuse);
    riskScore += globalAbuse.reduce((sum, a) => sum + a.confidence, 0);

    // Normalize risk score
    riskScore = Math.min(100, riskScore / Math.max(1, abuse.length));

    const recommendations = this.generateAbuseRecommendations(abuse, riskScore);

    return {
      detectedAbuse: abuse,
      riskScore,
      recommendations
    };
  }

  // Get rate limit status
  getRateLimitStatus(identifier: string): {
    current: number;
    limit: number;
    resetTime: number;
    blocked: boolean;
  } {
    const limit = this.rateLimits.get(identifier);
    const defaultLimit = 100; // requests per hour
    
    if (!limit) {
      return {
        current: 0,
        limit: defaultLimit,
        resetTime: Date.now() + 60 * 60 * 1000,
        blocked: false
      };
    }

    return {
      current: limit.count,
      limit: defaultLimit,
      resetTime: limit.resetTime,
      blocked: limit.count >= defaultLimit
    };
  }

  // Get endpoint performance metrics
  getEndpointMetrics(endpoint?: string): Array<{
    endpoint: string;
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    p95ResponseTime: number;
    lastAccessed: Date;
    suspiciousScore: number;
  }> {
    const metrics: Array<{
      endpoint: string;
      totalRequests: number;
      avgResponseTime: number;
      errorRate: number;
      p95ResponseTime: number;
      lastAccessed: Date;
      suspiciousScore: number;
    }> = [];

    this.patterns.forEach((pattern, key) => {
      if (endpoint && pattern.endpoint !== endpoint) return;

      const responseTimes = pattern.requests.map(r => r.responseTime).sort((a, b) => a - b);
      const p95Index = Math.floor(responseTimes.length * 0.95);
      const p95ResponseTime = responseTimes[p95Index] || 0;

      metrics.push({
        endpoint: pattern.endpoint,
        totalRequests: pattern.totalRequests,
        avgResponseTime: pattern.avgResponseTime,
        errorRate: pattern.errorRate,
        p95ResponseTime,
        lastAccessed: pattern.lastAccessed,
        suspiciousScore: pattern.suspiciousScore
      });
    });

    return metrics.sort((a, b) => b.totalRequests - a.totalRequests);
  }

  // Export API logs
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.requestsToCSV();
    }
    return JSON.stringify(this.requests, null, 2);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIP(): string {
    // In production, this would come from the server
    return 'client-side';
  }

  private normalizeEndpoint(endpoint: string): string {
    // Remove query parameters and normalize
    try {
      const url = new URL(endpoint, window.location.origin);
      return url.pathname;
    } catch {
      return endpoint.split('?')[0];
    }
  }

  private updatePattern(request: APIRequest): void {
    const key = `${request.endpoint}:${request.ipAddress}`;
    let pattern = this.patterns.get(key);

    if (!pattern) {
      pattern = {
        endpoint: request.endpoint,
        requests: [],
        totalRequests: 0,
        errorRate: 0,
        avgResponseTime: 0,
        suspiciousScore: 0,
        lastAccessed: request.timestamp
      };
      this.patterns.set(key, pattern);
    }

    pattern.requests.push(request);
    pattern.totalRequests++;
    pattern.lastAccessed = request.timestamp;

    // Keep only last 100 requests per pattern
    if (pattern.requests.length > 100) {
      pattern.requests = pattern.requests.slice(-100);
    }

    // Update metrics
    const errors = pattern.requests.filter(r => r.statusCode >= 400);
    pattern.errorRate = (errors.length / pattern.requests.length) * 100;
    
    const totalResponseTime = pattern.requests.reduce((sum, r) => sum + r.responseTime, 0);
    pattern.avgResponseTime = totalResponseTime / pattern.requests.length;

    // Update suspicious score
    pattern.suspiciousScore = this.calculateSuspiciousScore(pattern);
  }

  private calculateSuspiciousScore(pattern: APIPattern): number {
    let score = 0;
    const recentRequests = pattern.requests.filter(
      r => r.timestamp >= new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    // High request frequency
    if (recentRequests.length > 100) {
      score += 40;
    } else if (recentRequests.length > 50) {
      score += 20;
    }

    // High error rate
    if (pattern.errorRate > 50) {
      score += 30;
    } else if (pattern.errorRate > 25) {
      score += 15;
    }

    // Consistent user agent (possible bot)
    const userAgents = new Set(pattern.requests.map(r => r.userAgent));
    if (userAgents.size === 1 && pattern.requests.length > 20) {
      score += 20;
    }

    // Very fast request intervals (inhuman)
    const intervals = [];
    for (let i = 1; i < recentRequests.length; i++) {
      const interval = recentRequests[i].timestamp.getTime() - recentRequests[i-1].timestamp.getTime();
      intervals.push(interval);
    }
    
    const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
    if (avgInterval < 100 && intervals.length > 10) { // Less than 100ms between requests
      score += 25;
    }

    return Math.min(100, score);
  }

  private checkRateLimit(request: APIRequest): void {
    const key = request.ipAddress;
    const now = Date.now();
    const hourWindow = 60 * 60 * 1000;
    
    let limit = this.rateLimits.get(key);
    
    if (!limit || limit.resetTime <= now) {
      limit = {
        count: 0,
        resetTime: now + hourWindow
      };
    }
    
    limit.count++;
    this.rateLimits.set(key, limit);
    
    // Check if rate limit exceeded
    if (limit.count > 100) { // 100 requests per hour
      auditLogger.log('api_rate_limit_exceeded', {
        ipAddress: request.ipAddress,
        endpoint: request.endpoint,
        requestCount: limit.count,
        timeWindow: 'hour'
      }, 'high');
    }
  }

  private detectAPIAbuse(request: APIRequest): void {
    const pattern = this.patterns.get(`${request.endpoint}:${request.ipAddress}`);
    if (!pattern) return;

    // Check for scraping behavior
    if (pattern.requests.length > 50 && pattern.avgResponseTime < 200) {
      auditLogger.logSecurityViolation('api_scraping_detected', {
        endpoint: request.endpoint,
        ipAddress: request.ipAddress,
        requestCount: pattern.requests.length,
        avgResponseTime: pattern.avgResponseTime
      }, 'high');
    }

    // Check for error flooding
    const recentErrors = pattern.requests.filter(
      r => r.statusCode >= 400 && r.timestamp >= new Date(Date.now() - 10 * 60 * 1000)
    );
    
    if (recentErrors.length > 20) {
      auditLogger.logSecurityViolation('api_error_flooding', {
        endpoint: request.endpoint,
        ipAddress: request.ipAddress,
        errorCount: recentErrors.length,
        timeWindow: '10 minutes'
      }, 'medium');
    }
  }

  private analyzePatternForAbuse(pattern: APIPattern): APIAbuse[] {
    const abuse: APIAbuse[] = [];
    const recentRequests = pattern.requests.filter(
      r => r.timestamp >= new Date(Date.now() - 60 * 60 * 1000)
    );

    // Rate limit abuse
    if (recentRequests.length > 200) {
      abuse.push({
        type: 'rate_limit_exceeded',
        severity: 'high',
        confidence: 90,
        description: 'Excessive API requests detected',
        endpoint: pattern.endpoint,
        ipAddress: recentRequests[0]?.ipAddress || 'unknown',
        evidence: [
          `${recentRequests.length} requests in last hour`,
          `Average ${Math.round(pattern.avgResponseTime)}ms response time`
        ]
      });
    }

    // Scraping detection
    if (pattern.suspiciousScore > 80) {
      abuse.push({
        type: 'scraping_detected',
        severity: 'medium',
        confidence: pattern.suspiciousScore,
        description: 'Automated scraping behavior detected',
        endpoint: pattern.endpoint,
        ipAddress: recentRequests[0]?.ipAddress || 'unknown',
        evidence: [
          `Suspicious score: ${pattern.suspiciousScore}`,
          'Consistent request patterns indicate automation'
        ]
      });
    }

    return abuse;
  }

  private detectGlobalAbuse(): APIAbuse[] {
    const abuse: APIAbuse[] = [];
    const recentRequests = this.requests.filter(
      r => r.timestamp >= new Date(Date.now() - 60 * 60 * 1000)
    );

    // Global rate limiting
    const ipCounts = new Map<string, number>();
    recentRequests.forEach(r => {
      ipCounts.set(r.ipAddress, (ipCounts.get(r.ipAddress) || 0) + 1);
    });

    ipCounts.forEach((count, ip) => {
      if (count > 500) {
        abuse.push({
          type: 'resource_exhaustion',
          severity: 'critical',
          confidence: 95,
          description: 'Resource exhaustion attack detected',
          endpoint: 'global',
          ipAddress: ip,
          evidence: [
            `${count} requests from single IP in last hour`,
            'Potential DDoS or resource exhaustion attack'
          ]
        });
      }
    });

    return abuse;
  }

  private generateAbuseRecommendations(abuse: APIAbuse[], riskScore: number): string[] {
    const recommendations: string[] = [];

    if (riskScore > 80) {
      recommendations.push('Implement emergency rate limiting');
      recommendations.push('Consider blocking high-risk IP addresses');
    }

    if (abuse.some(a => a.type === 'rate_limit_exceeded')) {
      recommendations.push('Reduce rate limits for suspicious endpoints');
      recommendations.push('Implement progressive delays for repeated violations');
    }

    if (abuse.some(a => a.type === 'scraping_detected')) {
      recommendations.push('Implement CAPTCHA for automated requests');
      recommendations.push('Add request signature validation');
    }

    if (abuse.some(a => a.type === 'resource_exhaustion')) {
      recommendations.push('Enable DDoS protection');
      recommendations.push('Implement request queuing and throttling');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring API usage patterns');
      recommendations.push('Maintain current security measures');
    }

    return recommendations;
  }

  private requestsToCSV(): string {
    if (this.requests.length === 0) return '';
    
    const headers = ['ID', 'Timestamp', 'Endpoint', 'Method', 'Status Code', 'Response Time', 'IP Address', 'User ID'];
    const rows = this.requests.map(req => [
      req.id,
      req.timestamp.toISOString(),
      req.endpoint,
      req.method,
      req.statusCode.toString(),
      req.responseTime.toString(),
      req.ipAddress,
      req.userId || ''
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  private trimRequests(): void {
    if (this.requests.length > this.maxRequests) {
      this.requests = this.requests.slice(-this.maxRequests);
    }
  }
}

export const apiMonitor = new APIMonitor();
