
// Data sanitization utilities following OWASP guidelines

export interface SanitizationOptions {
  allowHTML?: boolean;
  allowedTags?: string[];
  allowedAttributes?: string[];
  maxLength?: number;
  stripWhitespace?: boolean;
}

export class DataSanitizer {
  // HTML sanitization patterns
  private static readonly HTML_PATTERNS = {
    script: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    iframe: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    object: /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    embed: /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    form: /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    input: /<input\b[^<]*(?:\/>|(?:(?!<\/input>)<[^<]*)*<\/input>)/gi,
    link: /<link\b[^<]*(?:\/>|(?:(?!<\/link>)<[^<]*)*<\/link>)/gi,
    meta: /<meta\b[^<]*(?:\/>|(?:(?!<\/meta>)<[^<]*)*<\/meta>)/gi,
  };

  // JavaScript patterns
  private static readonly JS_PATTERNS = {
    javascript: /javascript:/gi,
    vbscript: /vbscript:/gi,
    onEvents: /\bon\w+\s*=/gi,
    expression: /expression\s*\(/gi,
    dataUri: /data:(?!image\/(?:png|jpg|jpeg|gif|webp|svg))/gi,
  };

  // SQL injection patterns
  private static readonly SQL_PATTERNS = {
    union: /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\s)/gi,
    comment: /(--|\/\*|\*\/|#)/g,
    quote: /('|"|;|\||&|\$)/g,
  };

  // Sanitize string input
  static sanitizeString(
    input: string, 
    options: SanitizationOptions = {}
  ): string {
    if (typeof input !== 'string') {
      return String(input);
    }

    let sanitized = input;

    // Apply length limit
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    // Strip whitespace if requested
    if (options.stripWhitespace) {
      sanitized = sanitized.trim();
    }

    // Remove HTML if not allowed
    if (!options.allowHTML) {
      sanitized = this.removeHTML(sanitized);
    } else {
      sanitized = this.sanitizeHTML(sanitized, options);
    }

    // Remove JavaScript patterns
    sanitized = this.removeJavaScript(sanitized);

    // Encode special characters
    sanitized = this.encodeSpecialCharacters(sanitized);

    return sanitized;
  }

  // Remove all HTML tags
  private static removeHTML(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  }

  // Sanitize HTML while preserving allowed tags
  private static sanitizeHTML(
    input: string, 
    options: SanitizationOptions
  ): string {
    let sanitized = input;

    // Remove dangerous HTML elements
    Object.values(this.HTML_PATTERNS).forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // If specific tags are allowed, remove others
    if (options.allowedTags && options.allowedTags.length > 0) {
      const allowedTagsPattern = options.allowedTags
        .map(tag => `<\\/?${tag}\\b[^>]*>`)
        .join('|');
      
      const regex = new RegExp(`<(?!\\/?(?:${options.allowedTags.join('|')})\\b)[^>]*>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    }

    return sanitized;
  }

  // Remove JavaScript patterns
  private static removeJavaScript(input: string): string {
    let sanitized = input;

    Object.values(this.JS_PATTERNS).forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  }

  // Encode special characters
  private static encodeSpecialCharacters(input: string): string {
    const charMap: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
    };

    return input.replace(/[<>"'`=\/]/g, (char) => charMap[char] || char);
  }

  // Sanitize for SQL (though Supabase handles this, extra protection)
  static sanitizeForSQL(input: string): string {
    if (typeof input !== 'string') {
      return String(input);
    }

    let sanitized = input;

    // Remove SQL injection patterns
    Object.values(this.SQL_PATTERNS).forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized.trim();
  }

  // Sanitize email address
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') {
      return '';
    }

    // Basic email pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    const sanitized = email.toLowerCase().trim();
    
    return emailPattern.test(sanitized) ? sanitized : '';
  }

  // Sanitize URL
  static sanitizeURL(url: string): string {
    if (typeof url !== 'string') {
      return '';
    }

    try {
      const parsedUrl = new URL(url);
      
      // Only allow safe protocols
      const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
      
      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        return '';
      }

      return parsedUrl.toString();
    } catch {
      return '';
    }
  }

  // Sanitize filename
  static sanitizeFilename(filename: string): string {
    if (typeof filename !== 'string') {
      return '';
    }

    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace unsafe characters
      .replace(/^\.+/, '') // Remove leading dots
      .substring(0, 255); // Limit length
  }

  // Deep sanitize object
  static sanitizeObject(
    obj: any, 
    options: SanitizationOptions = {}
  ): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj, options);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, options));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize key
        const sanitizedKey = this.sanitizeString(key, { 
          allowHTML: false, 
          maxLength: 100 
        });
        
        // Sanitize value
        sanitized[sanitizedKey] = this.sanitizeObject(value, options);
      }
      
      return sanitized;
    }

    return obj;
  }

  // Validate input patterns
  static validatePattern(input: string, pattern: RegExp): boolean {
    return pattern.test(input);
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

  // Common validation patterns
  static readonly PATTERNS = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^\+?[\d\s\-\(\)]{10,}$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    username: /^[a-zA-Z0-9_-]{3,20}$/,
    strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  };
}

// Form validation utilities
export class FormValidator {
  // Validate form data
  static validateForm(
    data: Record<string, any>, 
    rules: Record<string, ValidationRule>
  ): ValidationResult {
    const errors: Record<string, string[]> = {};
    const sanitizedData: Record<string, any> = {};

    for (const [field, value] of Object.entries(data)) {
      const rule = rules[field];
      if (!rule) continue;

      const fieldErrors: string[] = [];

      // Required validation
      if (rule.required && (!value || value.toString().trim() === '')) {
        fieldErrors.push(`${field} is required`);
      }

      if (value) {
        // Type validation
        if (rule.type && typeof value !== rule.type) {
          fieldErrors.push(`${field} must be of type ${rule.type}`);
        }

        // Pattern validation
        if (rule.pattern && !DataSanitizer.validatePattern(value.toString(), rule.pattern)) {
          fieldErrors.push(rule.message || `${field} format is invalid`);
        }

        // Length validation
        if (rule.minLength && value.toString().length < rule.minLength) {
          fieldErrors.push(`${field} must be at least ${rule.minLength} characters`);
        }

        if (rule.maxLength && value.toString().length > rule.maxLength) {
          fieldErrors.push(`${field} must not exceed ${rule.maxLength} characters`);
        }

        // Custom validation
        if (rule.validate) {
          const customResult = rule.validate(value);
          if (customResult !== true) {
            fieldErrors.push(customResult);
          }
        }
      }

      // Sanitize the value
      if (typeof value === 'string') {
        sanitizedData[field] = DataSanitizer.sanitizeString(value, rule.sanitizeOptions);
      } else {
        sanitizedData[field] = value;
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData,
    };
  }
}

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object';
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  message?: string;
  sanitizeOptions?: SanitizationOptions;
  validate?: (value: any) => string | true;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  sanitizedData: Record<string, any>;
}
