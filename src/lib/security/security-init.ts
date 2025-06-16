import { securityHeadersManager } from './security-headers';
import { CSPReporter } from './security-headers';
import { CSRFProtection } from './xss-csrf-protection';
import { CORSInterceptor } from './cors-config';
import { useSecurityContext } from '@/contexts/SecurityContext';

// Security initialization and monitoring
export class SecurityManager {
  private static instance: SecurityManager;
  private initialized = false;
  private securityLog: Array<{ timestamp: Date; event: string; details: any }> = [];

  private constructor() {}

  static getInstance(): SecurityManager {
    if (!this.instance) {
      this.instance = new SecurityManager();
    }
    return this.instance;
  }

  // Initialize all security measures
  async init(): Promise<void> {
    if (this.initialized) {
      console.warn('Security manager already initialized');
      return;
    }

    try {
      this.log('Security initialization started');

      // Initialize CSP reporting
      CSPReporter.init();
      this.log('CSP reporting initialized');

      // Initialize CSRF protection
      CSRFProtection.init();
      this.log('CSRF protection initialized');

      // Initialize CORS interceptor
      CORSInterceptor.getInstance().init();
      this.log('CORS interceptor initialized');

      // Set up security headers for all requests
      this.initializeSecurityHeaders();
      this.log('Security headers configured');

      // Set up security monitoring
      this.initializeSecurityMonitoring();
      this.log('Security monitoring active');

      // Initialize session security
      this.initializeSessionSecurity();
      this.log('Session security initialized');

      this.initialized = true;
      this.log('Security initialization completed successfully');

      // Log security status
      this.logSecurityStatus();

    } catch (error) {
      console.error('Security initialization failed:', error);
      this.log('Security initialization failed', { error: error.message });
      throw error;
    }
  }

  private initializeSecurityHeaders(): void {
    // Apply security headers to the document
    const headers = securityHeadersManager.getSecurityHeaders();
    
    // Add meta tags for security headers that can be set via HTML
    this.addSecurityMetaTags(headers);
    
    // Intercept and modify outgoing requests
    this.interceptOutgoingRequests(headers);
  }

  private addSecurityMetaTags(headers: Record<string, string>): void {
    const head = document.head;
    
    // Content Security Policy
    if (headers['Content-Security-Policy']) {
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = headers['Content-Security-Policy'];
      head.appendChild(cspMeta);
    }

    // X-Content-Type-Options
    if (headers['X-Content-Type-Options']) {
      const nosniffMeta = document.createElement('meta');
      nosniffMeta.httpEquiv = 'X-Content-Type-Options';
      nosniffMeta.content = headers['X-Content-Type-Options'];
      head.appendChild(nosniffMeta);
    }

    // Referrer Policy
    if (headers['Referrer-Policy']) {
      const referrerMeta = document.createElement('meta');
      referrerMeta.name = 'referrer';
      referrerMeta.content = headers['Referrer-Policy'];
      head.appendChild(referrerMeta);
    }
  }

  private interceptOutgoingRequests(securityHeaders: Record<string, string>): void {
    const originalFetch = window.fetch;
    
    window.fetch = function(...args: Parameters<typeof fetch>): Promise<Response> {
      const [resource, config = {}] = args;
      
      // Add security headers to all outgoing requests
      config.headers = {
        ...securityHeaders,
        ...config.headers,
      };
      
      return originalFetch.apply(this, [resource, config]);
    };
  }

  private initializeSecurityMonitoring(): void {
    // Monitor for suspicious activity
    this.monitorDOMManipulation();
    this.monitorNetworkActivity();
    this.monitorConsoleAccess();
    this.monitorDevTools();
  }

  private monitorDOMManipulation(): void {
    // Monitor for potentially dangerous DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              this.validateNewElement(element);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private validateNewElement(element: Element): void {
    // Check for dangerous elements
    const dangerousTags = ['script', 'iframe', 'object', 'embed'];
    if (dangerousTags.includes(element.tagName.toLowerCase())) {
      this.log('Potentially dangerous element added', {
        tag: element.tagName,
        src: element.getAttribute('src'),
        innerHTML: element.innerHTML.substring(0, 100),
      });
    }

    // Check for dangerous attributes
    const dangerousAttributes = ['onclick', 'onload', 'onerror'];
    dangerousAttributes.forEach(attr => {
      if (element.hasAttribute(attr)) {
        this.log('Dangerous attribute detected', {
          element: element.tagName,
          attribute: attr,
          value: element.getAttribute(attr),
        });
      }
    });
  }

  private monitorNetworkActivity(): void {
    // Monitor for suspicious network requests
    const originalFetch = window.fetch;
    
    window.fetch = function(...args: Parameters<typeof fetch>): Promise<Response> {
      const [resource] = args;
      const url = typeof resource === 'string' ? resource : resource.url;
      
      // Log external requests
      if (!url.startsWith(window.location.origin)) {
        SecurityManager.getInstance().log('External request', { url });
      }
      
      return originalFetch.apply(this, args);
    };
  }

  private monitorConsoleAccess(): void {
    // Monitor console access (potential indicator of developer tools usage)
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      this.detectDeveloperConsoleUsage();
      return originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      this.detectDeveloperConsoleUsage();
      return originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      this.detectDeveloperConsoleUsage();
      return originalError.apply(console, args);
    };
  }

  private detectDeveloperConsoleUsage(): void {
    if (import.meta.env.PROD) {
      this.log('Developer console activity detected in production');
    }
  }

  private monitorDevTools(): void {
    // Detect developer tools opening (simple method)
    let devtools = { open: false, orientation: null };
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        if (!devtools.open) {
          devtools.open = true;
          this.log('Developer tools opened');
        }
      } else {
        if (devtools.open) {
          devtools.open = false;
          this.log('Developer tools closed');
        }
      }
    }, 1000);
  }

  private initializeSessionSecurity(): void {
    // Set up session timeout
    let lastActivity = Date.now();
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check for session timeout
    setInterval(() => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        this.log('Session timeout detected');
        this.handleSessionTimeout();
      }
    }, 60000); // Check every minute
  }

  private handleSessionTimeout(): void {
    // Clear sensitive data
    CSRFProtection.clearToken();
    
    // Notify user (you might want to redirect to login)
    console.warn('Session has expired due to inactivity');
    
    // Trigger security context cleanup if available
    try {
      const securityContext = useSecurityContext();
      securityContext.clearSecureData();
    } catch (error) {
      // SecurityContext not available, continue
    }
  }

  private log(event: string, details?: any): void {
    const logEntry = {
      timestamp: new Date(),
      event,
      details: details || {},
    };
    
    this.securityLog.push(logEntry);
    
    // Keep only last 1000 entries
    if (this.securityLog.length > 1000) {
      this.securityLog.shift();
    }
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Security] ${event}`, details);
    }
  }

  private logSecurityStatus(): void {
    const status = {
      cspEnabled: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
      csrfProtection: !!CSRFProtection.getToken(),
      httpsEnabled: window.location.protocol === 'https:',
      secureContext: window.isSecureContext,
      cookieSecure: document.cookie.includes('Secure'),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    this.log('Security status report', status);
  }

  // Get security logs
  getSecurityLogs(): Array<{ timestamp: Date; event: string; details: any }> {
    return [...this.securityLog];
  }

  // Clear security logs
  clearSecurityLogs(): void {
    this.securityLog = [];
  }

  // Check if security is properly initialized
  isInitialized(): boolean {
    return this.initialized;
  }

  // Generate security report
  generateSecurityReport(): any {
    return {
      initialized: this.initialized,
      logs: this.securityLog,
      cspViolations: CSPReporter.getViolations(),
      securityHeaders: securityHeadersManager.getSecurityHeaders(),
      timestamp: new Date().toISOString(),
    };
  }
}

// Initialize security when module is imported
export const securityManager = SecurityManager.getInstance();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      securityManager.init().catch(console.error);
    });
  } else {
    securityManager.init().catch(console.error);
  }
}
