// Enhanced CORS configuration for secure API communication
export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  allowCredentials: boolean;
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

export class CORSManager {
  private readonly config: CORSConfig;
  private readonly isDevelopment: boolean;

  constructor(customConfig?: Partial<CORSConfig>) {
    this.isDevelopment = import.meta.env.DEV;
    
    this.config = {
      allowedOrigins: this.getAllowedOrigins(),
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-Token',
        'X-Timestamp',
        'X-Request-ID',
        'X-Signature',
        'Accept',
        'Origin',
      ],
      exposedHeaders: [
        'X-Total-Count',
        'X-Rate-Limit-Remaining',
        'X-Rate-Limit-Reset',
        'X-Request-ID',
      ],
      allowCredentials: true,
      maxAge: 86400, // 24 hours
      preflightContinue: false,
      optionsSuccessStatus: 204,
      ...customConfig,
    };
  }

  private getAllowedOrigins(): string[] {
    const origins = [window.location.origin];
    
    if (this.isDevelopment) {
      // Add common development origins
      origins.push(
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8080'
      );
    } else {
      // Add production origins
      // These should be loaded from environment variables in a real app
      const productionOrigins = [
        // Add your production domains here
      ];
      origins.push(...productionOrigins);
    }
    
    return origins;
  }

  // Validate origin against allowed origins
  validateOrigin(origin: string): boolean {
    if (!origin) return false;
    
    // Check exact matches
    if (this.config.allowedOrigins.includes(origin)) {
      return true;
    }
    
    // In development, be more permissive with localhost
    if (this.isDevelopment && this.isLocalhostOrigin(origin)) {
      return true;
    }
    
    return false;
  }

  private isLocalhostOrigin(origin: string): boolean {
    try {
      const url = new URL(origin);
      return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    } catch {
      return false;
    }
  }

  // Generate CORS headers for a request
  generateCORSHeaders(requestOrigin?: string): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Handle origin
    if (requestOrigin && this.validateOrigin(requestOrigin)) {
      headers['Access-Control-Allow-Origin'] = requestOrigin;
    } else if (this.config.allowedOrigins.length === 1 && this.config.allowedOrigins[0] !== '*') {
      headers['Access-Control-Allow-Origin'] = this.config.allowedOrigins[0];
    }
    
    // Other CORS headers
    headers['Access-Control-Allow-Methods'] = this.config.allowedMethods.join(', ');
    headers['Access-Control-Allow-Headers'] = this.config.allowedHeaders.join(', ');
    headers['Access-Control-Expose-Headers'] = this.config.exposedHeaders.join(', ');
    headers['Access-Control-Max-Age'] = this.config.maxAge.toString();
    
    if (this.config.allowCredentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
    
    // Vary header for proper caching
    headers['Vary'] = 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers';
    
    return headers;
  }

  // Handle preflight requests
  handlePreflightRequest(request: Request): Response {
    const origin = request.headers.get('Origin');
    const method = request.headers.get('Access-Control-Request-Method');
    const headers = request.headers.get('Access-Control-Request-Headers');
    
    // Validate origin
    if (!origin || !this.validateOrigin(origin)) {
      return new Response(null, { status: 403 });
    }
    
    // Validate method
    if (!method || !this.config.allowedMethods.includes(method.toUpperCase())) {
      return new Response(null, { status: 405 });
    }
    
    // Validate headers
    if (headers) {
      const requestedHeaders = headers.split(',').map(h => h.trim().toLowerCase());
      const allowedHeaders = this.config.allowedHeaders.map(h => h.toLowerCase());
      
      const hasDisallowedHeaders = requestedHeaders.some(h => !allowedHeaders.includes(h));
      if (hasDisallowedHeaders) {
        return new Response(null, { status: 400 });
      }
    }
    
    return new Response(null, {
      status: this.config.optionsSuccessStatus,
      headers: this.generateCORSHeaders(origin),
    });
  }

  // Apply CORS to fetch requests
  applyCORSToFetch(url: string, options: RequestInit = {}): RequestInit {
    const updatedOptions = { ...options };
    
    // Ensure credentials are included for same-origin requests
    if (this.isSameOrigin(url)) {
      updatedOptions.credentials = 'include';
    }
    
    // Add origin header
    if (!updatedOptions.headers) {
      updatedOptions.headers = {};
    }
    
    const headers = updatedOptions.headers as Record<string, string>;
    headers['Origin'] = window.location.origin;
    
    return updatedOptions;
  }

  private isSameOrigin(url: string): boolean {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  // Log CORS violations for monitoring
  logCORSViolation(origin: string, method: string, reason: string): void {
    const violation = {
      timestamp: new Date().toISOString(),
      origin,
      method,
      reason,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.warn('CORS violation detected:', violation);
    
    // In production, send to monitoring service
    if (!this.isDevelopment) {
      this.reportCORSViolation(violation);
    }
  }

  private async reportCORSViolation(violation: any): Promise<void> {
    try {
      await fetch('/api/security/cors-violation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(violation),
      });
    } catch (error) {
      console.error('Failed to report CORS violation:', error);
    }
  }
}

export const corsManager = new CORSManager();

// CORS middleware for intercepting requests
export class CORSInterceptor {
  private static instance: CORSInterceptor;
  private corsManager: CORSManager;

  private constructor() {
    this.corsManager = corsManager;
  }

  static getInstance(): CORSInterceptor {
    if (!this.instance) {
      this.instance = new CORSInterceptor();
    }
    return this.instance;
  }

  // Initialize CORS interceptor
  init(): void {
    this.interceptFetchRequests();
    this.interceptXMLHttpRequests();
  }

  private interceptFetchRequests(): void {
    const originalFetch = window.fetch;
    
    window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const updatedInit = this.corsManager.applyCORSToFetch(url, init);
      
      return originalFetch(input, updatedInit)
        .then(response => {
          this.validateCORSResponse(response, url);
          return response;
        })
        .catch(error => {
          if (this.isCORSError(error)) {
            this.corsManager.logCORSViolation(
              window.location.origin,
              updatedInit.method || 'GET',
              'Fetch request blocked by CORS'
            );
          }
          throw error;
        });
    };
  }

  private interceptXMLHttpRequests(): void {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string, ...args: any[]) {
      (this as any)._corsUrl = url;
      (this as any)._corsMethod = method;
      return originalOpen.apply(this, [method, url, ...args]);
    };
    
    XMLHttpRequest.prototype.send = function(body?: any) {
      const url = (this as any)._corsUrl;
      const method = (this as any)._corsMethod;
      
      if (url && !corsManager.validateOrigin(window.location.origin)) {
        corsManager.logCORSViolation(window.location.origin, method, 'XMLHttpRequest blocked by CORS');
      }
      
      return originalSend.apply(this, [body]);
    };
  }

  private validateCORSResponse(response: Response, url: string): void {
    const origin = response.headers.get('Access-Control-Allow-Origin');
    const credentials = response.headers.get('Access-Control-Allow-Credentials');
    
    // Log potential CORS misconfigurations
    if (!this.corsManager.validateOrigin(window.location.origin) && origin !== '*') {
      console.warn('Potential CORS misconfiguration detected:', { url, origin });
    }
    
    if (credentials === 'true' && origin === '*') {
      console.error('CORS security violation: wildcard origin with credentials', { url });
    }
  }

  private isCORSError(error: any): boolean {
    return error.message && error.message.toLowerCase().includes('cors');
  }
}
