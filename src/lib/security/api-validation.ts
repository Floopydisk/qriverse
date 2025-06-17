
// API parameter validation and sanitization
import { DataSanitizer, ValidationRule, FormValidator } from './data-sanitization';

export interface APIValidationConfig {
  sanitize: boolean;
  validateTypes: boolean;
  enforceRequired: boolean;
  maxDepth: number;
  maxLength: number;
}

export interface APIValidationResult<T = any> {
  isValid: boolean;
  data: T;
  errors: Record<string, string[]>;
  warnings: string[];
}

export class APIValidator {
  private static readonly DEFAULT_CONFIG: APIValidationConfig = {
    sanitize: true,
    validateTypes: true,
    enforceRequired: true,
    maxDepth: 10,
    maxLength: 10000,
  };

  // Validate and sanitize API request data
  static validateAPIRequest<T = any>(
    data: any,
    schema: Record<string, ValidationRule>,
    config: Partial<APIValidationConfig> = {}
  ): APIValidationResult<T> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const warnings: string[] = [];

    try {
      // Check for object depth (prevent DoS attacks)
      if (this.getObjectDepth(data) > finalConfig.maxDepth) {
        return {
          isValid: false,
          data: null,
          errors: { _root: ['Request data is too deeply nested'] },
          warnings,
        };
      }

      // Check for data size
      const dataSize = JSON.stringify(data).length;
      if (dataSize > finalConfig.maxLength) {
        return {
          isValid: false,
          data: null,
          errors: { _root: ['Request data is too large'] },
          warnings,
        };
      }

      // Sanitize data if enabled
      let sanitizedData = data;
      if (finalConfig.sanitize) {
        sanitizedData = DataSanitizer.sanitizeObject(data, {
          allowHTML: false,
          maxLength: 1000,
          stripWhitespace: true,
        });
      }

      // Validate using form validator
      const validationResult = FormValidator.validateForm(sanitizedData, schema);

      // Add warnings for potential security issues
      this.addSecurityWarnings(data, warnings);

      return {
        isValid: validationResult.isValid,
        data: validationResult.isValid ? validationResult.sanitizedData as T : null,
        errors: validationResult.errors,
        warnings,
      };
    } catch (error) {
      console.error('API validation error:', error);
      return {
        isValid: false,
        data: null,
        errors: { _root: ['Validation failed'] },
        warnings,
      };
    }
  }

  // Get object nesting depth
  private static getObjectDepth(obj: any, depth = 0): number {
    if (depth > 50) return depth; // Prevent infinite recursion
    
    if (typeof obj !== 'object' || obj === null) {
      return depth;
    }

    if (Array.isArray(obj)) {
      return Math.max(depth, ...obj.map(item => this.getObjectDepth(item, depth + 1)));
    }

    const depths = Object.values(obj).map(value => this.getObjectDepth(value, depth + 1));
    return depths.length > 0 ? Math.max(...depths) : depth;
  }

  // Add security warnings
  private static addSecurityWarnings(data: any, warnings: string[]): void {
    const jsonString = JSON.stringify(data);

    // Check for suspicious patterns
    const suspiciousPatterns = [
      { pattern: /<script\b/gi, warning: 'Request contains script tags' },
      { pattern: /javascript:/gi, warning: 'Request contains javascript: protocol' },
      { pattern: /vbscript:/gi, warning: 'Request contains vbscript: protocol' },
      { pattern: /on\w+\s*=/gi, warning: 'Request contains event handlers' },
      { pattern: /\.\.\//g, warning: 'Request contains directory traversal patterns' },
      { pattern: /union\s+select/gi, warning: 'Request contains SQL injection patterns' },
    ];

    suspiciousPatterns.forEach(({ pattern, warning }) => {
      if (pattern.test(jsonString)) {
        warnings.push(warning);
      }
    });
  }

  // Validate QR code creation data
  static validateQRCodeData(data: any): APIValidationResult {
    const schema: Record<string, ValidationRule> = {
      name: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9\s\-_]+$/,
        message: 'Name must contain only letters, numbers, spaces, hyphens, and underscores',
      },
      type: {
        required: true,
        type: 'string',
        validate: (value: string) => {
          const allowedTypes = ['text', 'url', 'email', 'phone', 'sms', 'wifi', 'contact', 'bitcoin'];
          return allowedTypes.includes(value) || 'Invalid QR code type';
        },
      },
      content: {
        required: true,
        type: 'string',
        maxLength: 2000,
      },
      folder_id: {
        required: false,
        type: 'string',
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        message: 'Invalid folder ID format',
      },
      team_id: {
        required: false,
        type: 'string',
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        message: 'Invalid team ID format',
      },
    };

    return this.validateAPIRequest(data, schema);
  }

  // Validate user profile data
  static validateProfileData(data: any): APIValidationResult {
    const schema: Record<string, ValidationRule> = {
      username: {
        required: false,
        type: 'string',
        minLength: 3,
        maxLength: 30,
        pattern: /^[a-zA-Z0-9_-]+$/,
        message: 'Username must contain only letters, numbers, hyphens, and underscores',
      },
      full_name: {
        required: false,
        type: 'string',
        maxLength: 100,
        pattern: /^[a-zA-Z\s\-'\.]+$/,
        message: 'Full name contains invalid characters',
      },
      email: {
        required: false,
        type: 'string',
        pattern: DataSanitizer.PATTERNS.email,
        message: 'Invalid email format',
      },
    };

    return this.validateAPIRequest(data, schema);
  }

  // Validate team data
  static validateTeamData(data: any): APIValidationResult {
    const schema: Record<string, ValidationRule> = {
      name: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9\s\-_]+$/,
        message: 'Team name must contain only letters, numbers, spaces, hyphens, and underscores',
      },
      description: {
        required: false,
        type: 'string',
        maxLength: 500,
      },
    };

    return this.validateAPIRequest(data, schema);
  }

  // Validate API key data
  static validateApiKeyData(data: any): APIValidationResult {
    const schema: Record<string, ValidationRule> = {
      name: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9\s\-_]+$/,
        message: 'API key name must contain only letters, numbers, spaces, hyphens, and underscores',
      },
      permissions: {
        required: true,
        validate: (value: any) => {
          if (!Array.isArray(value)) return 'Permissions must be an array';
          const validPermissions = ['read', 'write', 'delete'];
          const invalidPerms = value.filter(p => !validPermissions.includes(p));
          return invalidPerms.length === 0 || `Invalid permissions: ${invalidPerms.join(', ')}`;
        },
      },
      rate_limit: {
        required: false,
        type: 'number',
        validate: (value: number) => {
          return (value >= 1 && value <= 10000) || 'Rate limit must be between 1 and 10000';
        },
      },
    };

    return this.validateAPIRequest(data, schema);
  }

  // Validate webhook data
  static validateWebhookData(data: any): APIValidationResult {
    const schema: Record<string, ValidationRule> = {
      name: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9\s\-_]+$/,
        message: 'Webhook name must contain only letters, numbers, spaces, hyphens, and underscores',
      },
      url: {
        required: true,
        type: 'string',
        pattern: DataSanitizer.PATTERNS.url,
        message: 'Invalid webhook URL',
      },
      events: {
        required: true,
        validate: (value: any) => {
          if (!Array.isArray(value)) return 'Events must be an array';
          const validEvents = ['qr_code.created', 'qr_code.updated', 'qr_code.deleted', 'qr_code.scanned'];
          const invalidEvents = value.filter(e => !validEvents.includes(e));
          return invalidEvents.length === 0 || `Invalid events: ${invalidEvents.join(', ')}`;
        },
      },
      secret: {
        required: false,
        type: 'string',
        minLength: 10,
        maxLength: 100,
      },
    };

    return this.validateAPIRequest(data, schema);
  }

  // Validate search parameters
  static validateSearchParams(data: any): APIValidationResult {
    const schema: Record<string, ValidationRule> = {
      query: {
        required: false,
        type: 'string',
        maxLength: 100,
      },
      type: {
        required: false,
        type: 'string',
        validate: (value: string) => {
          const allowedTypes = ['all', 'text', 'url', 'email', 'phone', 'sms', 'wifi', 'contact', 'bitcoin'];
          return allowedTypes.includes(value) || 'Invalid search type';
        },
      },
      folder_id: {
        required: false,
        type: 'string',
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        message: 'Invalid folder ID format',
      },
      limit: {
        required: false,
        type: 'number',
        validate: (value: number) => {
          return (value >= 1 && value <= 100) || 'Limit must be between 1 and 100';
        },
      },
      offset: {
        required: false,
        type: 'number',
        validate: (value: number) => {
          return value >= 0 || 'Offset must be non-negative';
        },
      },
    };

    return this.validateAPIRequest(data, schema, { maxLength: 1000 });
  }
}

// Middleware for Express-like frameworks (for edge functions)
export function createValidationMiddleware<T = any>(
  validator: (data: any) => APIValidationResult<T>
) {
  return (req: Request, res: Response, next: () => void) => {
    try {
      const result = validator(req.body);
      
      if (!result.isValid) {
        return new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: result.errors,
            warnings: result.warnings,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Attach validated data to request
      (req as any).validatedData = result.data;
      (req as any).validationWarnings = result.warnings;
      
      return next();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Validation middleware failed' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}
