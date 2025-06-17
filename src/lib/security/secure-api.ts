/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/integrations/supabase/client';

// Security headers for all API requests
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
};

export interface SecureRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  encryptBody?: boolean;
  includeAuth?: boolean;
  timeout?: number;
}

export interface SecureResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
  statusCode: number;
  headers: Record<string, string>;
}

class SecureAPIClient {
  private readonly baseURL: string;
  private readonly defaultTimeout = 30000; // 30 seconds

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  // Generate request signature for integrity verification
  private async generateRequestSignature(
    method: string,
    url: string,
    body: string,
    timestamp: string
  ): Promise<string> {
    const message = `${method}${url}${body}${timestamp}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Secure fetch with enhanced security measures
  async secureRequest<T = any>(
    endpoint: string,
    options: SecureRequestOptions = {}
  ): Promise<SecureResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      encryptBody = false,
      includeAuth = true,
      timeout = this.defaultTimeout
    } = options;

    try {
      const url = this.baseURL + endpoint;
      const timestamp = Date.now().toString();
      
      // Prepare headers
      const requestHeaders: Record<string, string> = {
        ...SECURITY_HEADERS,
        'Content-Type': 'application/json',
        'X-Timestamp': timestamp,
        'X-Request-ID': crypto.randomUUID(),
        ...headers,
      };

      // Add authentication if required
      if (includeAuth) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          requestHeaders['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      // Prepare body
      let requestBody: string | undefined;
      if (body && method !== 'GET') {
        if (encryptBody) {
          // Implement body encryption if needed
          requestBody = JSON.stringify(body);
        } else {
          requestBody = JSON.stringify(body);
        }
      }

      // Generate request signature
      const signature = await this.generateRequestSignature(
        method,
        url,
        requestBody || '',
        timestamp
      );
      requestHeaders['X-Signature'] = signature;

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Make request
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
        credentials: 'same-origin',
      });

      clearTimeout(timeoutId);

      // Validate response
      await this.validateResponse(response);

      // Parse response
      const responseData = await response.json();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        data: responseData,
        success: response.ok,
        statusCode: response.status,
        headers: responseHeaders,
      };

    } catch (error: any) {
      console.error('Secure API request failed:', error);
      
      return {
        data: null,
        success: false,
        error: error.message || 'Request failed',
        statusCode: error.status || 0,
        headers: {},
      };
    }
  }

  // Validate response for security issues
  private async validateResponse(response: Response): Promise<void> {
    // Check for suspicious status codes
    if (response.status === 418) {
      throw new Error('Suspicious response detected');
    }

    // Validate content type
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      console.warn('Unexpected content type:', contentType);
    }

    // Check for security headers in response
    const securityHeaders = ['x-frame-options', 'x-content-type-options'];
    securityHeaders.forEach(header => {
      if (!response.headers.get(header)) {
        console.warn(`Missing security header: ${header}`);
      }
    });
  }

  // Secure GET request
  async get<T = any>(endpoint: string, options: Omit<SecureRequestOptions, 'method'> = {}): Promise<SecureResponse<T>> {
    return this.secureRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  // Secure POST request
  async post<T = any>(endpoint: string, body: any, options: Omit<SecureRequestOptions, 'method' | 'body'> = {}): Promise<SecureResponse<T>> {
    return this.secureRequest<T>(endpoint, { ...options, method: 'POST', body });
  }

  // Secure PUT request
  async put<T = any>(endpoint: string, body: any, options: Omit<SecureRequestOptions, 'method' | 'body'> = {}): Promise<SecureResponse<T>> {
    return this.secureRequest<T>(endpoint, { ...options, method: 'PUT', body });
  }

  // Secure DELETE request
  async delete<T = any>(endpoint: string, options: Omit<SecureRequestOptions, 'method'> = {}): Promise<SecureResponse<T>> {
    return this.secureRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const secureAPIClient = new SecureAPIClient();

// Request/Response interceptors for additional security
export class APIInterceptor {
  // Sanitize request data
  static sanitizeRequestData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Remove potential XSS vectors
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeRequestData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Sanitize string input
  static sanitizeString(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:(?!image\/(?:png|jpg|jpeg|gif|webp|svg))/gi, '') // Restrict data URLs
      .trim();
  }

  // Validate response data
  static validateResponseData(data: any): boolean {
    if (typeof data !== 'object' || data === null) {
      return true;
    }

    // Check for suspicious properties
    const suspiciousKeys = ['__proto__', 'constructor', 'prototype'];
    
    return !this.hasSuspiciousKeys(data, suspiciousKeys);
  }

  private static hasSuspiciousKeys(obj: any, suspiciousKeys: string[]): boolean {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    for (const key of Object.keys(obj)) {
      if (suspiciousKeys.includes(key)) {
        return true;
      }
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (this.hasSuspiciousKeys(obj[key], suspiciousKeys)) {
          return true;
        }
      }
    }

    return false;
  }
}
