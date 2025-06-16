
// Security Headers and CSP Implementation
export interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'font-src'?: string[];
  'connect-src'?: string[];
  'media-src'?: string[];
  'object-src'?: string[];
  'child-src'?: string[];
  'frame-src'?: string[];
  'worker-src'?: string[];
  'manifest-src'?: string[];
  'base-uri'?: string[];
  'form-action'?: string[];
  'frame-ancestors'?: string[];
  'upgrade-insecure-requests'?: boolean;
  'block-all-mixed-content'?: boolean;
}

export interface SecurityHeadersConfig {
  csp: CSPDirectives;
  enableHSTS: boolean;
  enableXFrameOptions: boolean;
  enableXContentTypeOptions: boolean;
  enableReferrerPolicy: boolean;
  enablePermissionsPolicy: boolean;
  hstsMaxAge: number;
  hstsIncludeSubDomains: boolean;
  hstsPreload: boolean;
}

class SecurityHeadersManager {
  private readonly config: SecurityHeadersConfig;
  private readonly isDevelopment: boolean;

  constructor(config?: Partial<SecurityHeadersConfig>) {
    this.isDevelopment = import.meta.env.DEV;
    this.config = {
      csp: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          "'unsafe-inline'", // Required for React dev tools in development
          ...(this.isDevelopment ? ["'unsafe-eval'"] : []),
          'https://cdn.gpteng.co', // Required for Lovable editor
          'https://supabase.com',
          'https://*.supabase.co',
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'", // Required for Tailwind CSS
          'https://fonts.googleapis.com',
        ],
        'img-src': [
          "'self'",
          'data:', // For QR codes and base64 images
          'blob:', // For generated images
          'https://*.supabase.co', // Supabase storage
          'https://supabase.com',
        ],
        'font-src': [
          "'self'",
          'https://fonts.gstatic.com',
        ],
        'connect-src': [
          "'self'",
          'https://*.supabase.co',
          'https://supabase.com',
          ...(this.isDevelopment ? ['ws://localhost:*', 'http://localhost:*'] : []),
        ],
        'media-src': ["'self'", 'data:', 'blob:'],
        'object-src': ["'none'"],
        'child-src': ["'self'"],
        'frame-src': ["'self'"],
        'worker-src': ["'self'", 'blob:'],
        'manifest-src': ["'self'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'upgrade-insecure-requests': !this.isDevelopment,
        'block-all-mixed-content': !this.isDevelopment,
      },
      enableHSTS: !this.isDevelopment,
      enableXFrameOptions: true,
      enableXContentTypeOptions: true,
      enableReferrerPolicy: true,
      enablePermissionsPolicy: true,
      hstsMaxAge: 31536000, // 1 year
      hstsIncludeSubDomains: true,
      hstsPreload: true,
      ...config,
    };
  }

  // Generate CSP header value
  private generateCSPHeader(): string {
    const directives: string[] = [];

    Object.entries(this.config.csp).forEach(([directive, value]) => {
      if (typeof value === 'boolean') {
        if (value) {
          directives.push(directive.replace(/([A-Z])/g, '-$1').toLowerCase());
        }
      } else if (Array.isArray(value) && value.length > 0) {
        const directiveName = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
        directives.push(`${directiveName} ${value.join(' ')}`);
      }
    });

    return directives.join('; ');
  }

  // Generate HSTS header value
  private generateHSTSHeader(): string {
    let hsts = `max-age=${this.config.hstsMaxAge}`;
    
    if (this.config.hstsIncludeSubDomains) {
      hsts += '; includeSubDomains';
    }
    
    if (this.config.hstsPreload) {
      hsts += '; preload';
    }
    
    return hsts;
  }

  // Generate Permissions Policy header
  private generatePermissionsPolicyHeader(): string {
    const policies = [
      'geolocation=()', // Block geolocation access
      'microphone=()', // Block microphone access
      'camera=()', // Block camera access
      'usb=()', // Block USB access
      'magnetometer=()', // Block magnetometer access
      'accelerometer=()', // Block accelerometer access
      'gyroscope=()', // Block gyroscope access
      'payment=(self)', // Allow payment only for same origin
      'fullscreen=(self)', // Allow fullscreen only for same origin
    ];

    return policies.join(', ');
  }

  // Get all security headers
  getSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    // Content Security Policy
    headers['Content-Security-Policy'] = this.generateCSPHeader();

    // HTTP Strict Transport Security
    if (this.config.enableHSTS && !this.isDevelopment) {
      headers['Strict-Transport-Security'] = this.generateHSTSHeader();
    }

    // X-Frame-Options
    if (this.config.enableXFrameOptions) {
      headers['X-Frame-Options'] = 'DENY';
    }

    // X-Content-Type-Options
    if (this.config.enableXContentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    // Referrer Policy
    if (this.config.enableReferrerPolicy) {
      headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    }

    // Permissions Policy
    if (this.config.enablePermissionsPolicy) {
      headers['Permissions-Policy'] = this.generatePermissionsPolicyHeader();
    }

    // XSS Protection (legacy browsers)
    headers['X-XSS-Protection'] = '1; mode=block';

    // Cache Control for security-sensitive pages
    headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, private';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';

    return headers;
  }

  // Apply headers to a fetch request
  applyToFetchRequest(headers: HeadersInit = {}): HeadersInit {
    return {
      ...headers,
      ...this.getSecurityHeaders(),
    };
  }

  // Get CSP nonce for inline scripts (if needed)
  generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  // Validate CSP compliance
  validateCSPCompliance(elementType: string, source: string): boolean {
    const directive = this.getDirectiveForElement(elementType);
    const allowedSources = this.config.csp[directive] || [];

    return this.isSourceAllowed(source, allowedSources);
  }

  private getDirectiveForElement(elementType: string): keyof CSPDirectives {
    const mapping: Record<string, keyof CSPDirectives> = {
      'script': 'script-src',
      'style': 'style-src',
      'img': 'img-src',
      'font': 'font-src',
      'iframe': 'frame-src',
      'object': 'object-src',
      'embed': 'object-src',
    };

    return mapping[elementType] || 'default-src';
  }

  private isSourceAllowed(source: string, allowedSources: string[]): boolean {
    // Check for exact matches
    if (allowedSources.includes(source)) {
      return true;
    }

    // Check for wildcard matches
    for (const allowed of allowedSources) {
      if (allowed === "'self'" && (source.startsWith('/') || source.startsWith(window.location.origin))) {
        return true;
      }
      
      if (allowed === 'data:' && source.startsWith('data:')) {
        return true;
      }
      
      if (allowed === 'blob:' && source.startsWith('blob:')) {
        return true;
      }
      
      if (allowed.includes('*') && this.matchesWildcard(source, allowed)) {
        return true;
      }
    }

    return false;
  }

  private matchesWildcard(source: string, pattern: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(source);
  }
}

export const securityHeadersManager = new SecurityHeadersManager();

// CSP violation reporting
export interface CSPViolationReport {
  'document-uri': string;
  referrer: string;
  'violated-directive': string;
  'effective-directive': string;
  'original-policy': string;
  disposition: string;
  'blocked-uri': string;
  'line-number': number;
  'column-number': number;
  'source-file': string;
  'status-code': number;
  'script-sample': string;
}

export class CSPReporter {
  private static violations: CSPViolationReport[] = [];
  private static maxViolations = 100;

  static init() {
    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      const violation: CSPViolationReport = {
        'document-uri': event.documentURI,
        referrer: event.referrer,
        'violated-directive': event.violatedDirective,
        'effective-directive': event.effectiveDirective,
        'original-policy': event.originalPolicy,
        disposition: event.disposition,
        'blocked-uri': event.blockedURI,
        'line-number': event.lineNumber,
        'column-number': event.columnNumber,
        'source-file': event.sourceFile,
        'status-code': event.statusCode,
        'script-sample': event.sample,
      };

      this.reportViolation(violation);
    });
  }

  static reportViolation(violation: CSPViolationReport) {
    console.warn('CSP Violation detected:', violation);
    
    // Store violation (with size limit)
    this.violations.push(violation);
    if (this.violations.length > this.maxViolations) {
      this.violations.shift();
    }

    // In production, you would send this to your logging service
    if (!import.meta.env.DEV) {
      this.sendViolationReport(violation);
    }
  }

  private static async sendViolationReport(violation: CSPViolationReport) {
    try {
      // Send to your logging endpoint
      await fetch('/api/csp-violation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(violation),
      });
    } catch (error) {
      console.error('Failed to report CSP violation:', error);
    }
  }

  static getViolations(): CSPViolationReport[] {
    return [...this.violations];
  }

  static clearViolations() {
    this.violations = [];
  }
}
