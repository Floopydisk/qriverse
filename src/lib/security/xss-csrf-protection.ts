
import { secureAPIClient } from './secure-api';

// XSS Protection utilities
export class XSSProtection {
  // HTML encode to prevent XSS
  static htmlEncode(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Sanitize HTML content
  static sanitizeHTML(html: string): string {
    // Remove script tags and dangerous attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:(?!image\/(?:png|jpg|jpeg|gif|webp|svg))/gi, '');
  }

  // Validate input against XSS patterns
  static validateInput(input: string): { isValid: boolean; risk: 'low' | 'medium' | 'high' } {
    const highRiskPatterns = [
      /<script\b/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b/gi,
      /<object\b/gi,
      /<embed\b/gi,
    ];

    const mediumRiskPatterns = [
      /<[^>]*>/g,
      /&\w+;/g,
      /%[0-9a-f]{2}/gi,
    ];

    // Check for high-risk patterns
    for (const pattern of highRiskPatterns) {
      if (pattern.test(input)) {
        return { isValid: false, risk: 'high' };
      }
    }

    // Check for medium-risk patterns
    for (const pattern of mediumRiskPatterns) {
      if (pattern.test(input)) {
        return { isValid: true, risk: 'medium' };
      }
    }

    return { isValid: true, risk: 'low' };
  }

  // URL validation to prevent XSS via URLs
  static validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Block dangerous protocols
      const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:'];
      if (dangerousProtocols.some(protocol => urlObj.protocol === protocol)) {
        return false;
      }

      // Only allow http, https, and mailto
      const allowedProtocols = ['http:', 'https:', 'mailto:'];
      return allowedProtocols.includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // Safe DOM manipulation
  static safeSetInnerHTML(element: HTMLElement, content: string): void {
    element.textContent = content; // Always use textContent for safety
  }

  static safeSetAttribute(element: HTMLElement, name: string, value: string): void {
    // Block dangerous attributes
    const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus'];
    if (dangerousAttributes.includes(name.toLowerCase())) {
      console.warn(`Blocked dangerous attribute: ${name}`);
      return;
    }

    // Validate URLs in href and src attributes
    if (['href', 'src'].includes(name.toLowerCase()) && !this.validateURL(value)) {
      console.warn(`Blocked dangerous URL in ${name}: ${value}`);
      return;
    }

    element.setAttribute(name, value);
  }
}

// CSRF Protection utilities
export class CSRFProtection {
  private static readonly TOKEN_HEADER = 'X-CSRF-Token';
  private static readonly TOKEN_STORAGE_KEY = 'csrf_token';
  private static readonly TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutes

  // Generate CSRF token
  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    const timestamp = Date.now();
    const tokenWithTimestamp = `${token}.${timestamp}`;
    
    // Store in sessionStorage for this session
    sessionStorage.setItem(this.TOKEN_STORAGE_KEY, tokenWithTimestamp);
    
    return token;
  }

  // Get current CSRF token
  static getToken(): string | null {
    const stored = sessionStorage.getItem(this.TOKEN_STORAGE_KEY);
    if (!stored) return null;

    const [token, timestampStr] = stored.split('.');
    const timestamp = parseInt(timestampStr, 10);
    
    // Check if token is expired
    if (Date.now() - timestamp > this.TOKEN_LIFETIME) {
      this.clearToken();
      return null;
    }

    return token;
  }

  // Validate CSRF token
  static validateToken(providedToken: string): boolean {
    const storedToken = this.getToken();
    if (!storedToken) return false;

    // Constant-time comparison to prevent timing attacks
    return this.constantTimeEquals(providedToken, storedToken);
  }

  // Clear CSRF token
  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_STORAGE_KEY);
  }

  // Add CSRF token to request headers
  static addTokenToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    if (token) {
      headers[this.TOKEN_HEADER] = token;
    }
    return headers;
  }

  // Secure form submission with CSRF protection
  static secureFormSubmit(form: HTMLFormElement, onSuccess?: () => void, onError?: (error: Error) => void): void {
    const formData = new FormData(form);
    const token = this.getToken() || this.generateToken();
    
    // Add CSRF token to form data
    formData.append('csrf_token', token);

    const url = form.action || window.location.href;
    const method = form.method || 'POST';

    fetch(url, {
      method,
      body: formData,
      headers: this.addTokenToHeaders({
        'X-Requested-With': 'XMLHttpRequest',
      }),
      credentials: 'same-origin',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      onSuccess?.();
    })
    .catch(error => {
      console.error('Secure form submission failed:', error);
      onError?.(error);
    });
  }

  // Constant-time string comparison to prevent timing attacks
  private static constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) return false;

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  // Initialize CSRF protection for the session
  static init(): void {
    // Generate initial token if none exists
    if (!this.getToken()) {
      this.generateToken();
    }

    // Add CSRF token to all forms on the page
    document.addEventListener('DOMContentLoaded', () => {
      this.protectAllForms();
    });

    // Intercept all fetch requests to add CSRF token
    this.interceptFetchRequests();
  }

  private static protectAllForms(): void {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      if (!form.querySelector('input[name="csrf_token"]')) {
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'csrf_token';
        tokenInput.value = this.getToken() || this.generateToken();
        form.appendChild(tokenInput);
      }
    });
  }

  private static interceptFetchRequests(): void {
    const originalFetch = window.fetch;
    
    window.fetch = function(...args: Parameters<typeof fetch>): Promise<Response> {
      const [resource, config = {}] = args;
      
      // Only add CSRF token to same-origin requests
      const url = typeof resource === 'string' ? resource : resource.url;
      const isSameOrigin = !url.includes('://') || url.startsWith(window.location.origin);
      
      if (isSameOrigin && config.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method.toUpperCase())) {
        config.headers = CSRFProtection.addTokenToHeaders(config.headers as Record<string, string>);
      }
      
      return originalFetch.apply(this, [resource, config]);
    };
  }
}

// Request origin validation
export class OriginValidator {
  private static readonly ALLOWED_ORIGINS = [
    window.location.origin,
    // Add your production domains here
  ];

  // Validate request origin
  static validateOrigin(origin: string): boolean {
    return this.ALLOWED_ORIGINS.includes(origin);
  }

  // Check if request is from same origin
  static isSameOrigin(url: string): boolean {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  // Validate referrer header
  static validateReferrer(referrer: string): boolean {
    if (!referrer) return false;
    
    try {
      const referrerUrl = new URL(referrer);
      return this.ALLOWED_ORIGINS.includes(referrerUrl.origin);
    } catch {
      return false;
    }
  }
}
