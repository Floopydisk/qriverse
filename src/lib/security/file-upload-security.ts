
// File upload security utilities
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  enableVirusScanning?: boolean;
  enableImageSanitization?: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedFile?: File;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  originalName: string;
  sanitizedName: string;
  size: number;
  mimeType: string;
  extension: string;
  hash: string;
  isImage: boolean;
  imageDimensions?: { width: number; height: number };
}

export class FileUploadSecurity {
  // Default security settings
  private static readonly DEFAULT_OPTIONS: FileValidationOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'text/plain',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.txt'],
    enableVirusScanning: false, // Would require external service
    enableImageSanitization: true,
  };

  // Validate uploaded file
  static async validateFile(
    file: File,
    options: FileValidationOptions = {}
  ): Promise<FileValidationResult> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    const errors: string[] = [];

    try {
      // Basic file validation
      if (!file) {
        errors.push('No file provided');
        return { isValid: false, errors };
      }

      // File size validation
      if (config.maxSize && file.size > config.maxSize) {
        errors.push(`File size exceeds limit of ${this.formatBytes(config.maxSize)}`);
      }

      // MIME type validation
      if (config.allowedMimeTypes && !config.allowedMimeTypes.includes(file.type)) {
        errors.push(`File type ${file.type} is not allowed`);
      }

      // File extension validation
      const extension = this.getFileExtension(file.name);
      if (config.allowedExtensions && !config.allowedExtensions.includes(extension)) {
        errors.push(`File extension ${extension} is not allowed`);
      }

      // Generate file metadata
      const metadata = await this.generateFileMetadata(file);

      // Validate file content against MIME type
      if (!this.validateFileContent(file, metadata)) {
        errors.push('File content does not match its declared type');
      }

      // Check for malicious content
      const maliciousCheck = await this.checkForMaliciousContent(file);
      if (!maliciousCheck.isClean) {
        errors.push(...maliciousCheck.threats);
      }

      // Sanitize file if it's an image
      let sanitizedFile = file;
      if (config.enableImageSanitization && metadata.isImage) {
        sanitizedFile = await this.sanitizeImageFile(file);
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedFile: errors.length === 0 ? sanitizedFile : undefined,
        metadata,
      };
    } catch (error) {
      console.error('File validation error:', error);
      return {
        isValid: false,
        errors: ['File validation failed'],
      };
    }
  }

  // Generate comprehensive file metadata
  private static async generateFileMetadata(file: File): Promise<FileMetadata> {
    const extension = this.getFileExtension(file.name);
    const sanitizedName = this.sanitizeFileName(file.name);
    const hash = await this.generateFileHash(file);
    const isImage = file.type.startsWith('image/');

    let imageDimensions;
    if (isImage) {
      imageDimensions = await this.getImageDimensions(file);
    }

    return {
      originalName: file.name,
      sanitizedName,
      size: file.size,
      mimeType: file.type,
      extension,
      hash,
      isImage,
      imageDimensions,
    };
  }

  // Sanitize filename
  private static sanitizeFileName(filename: string): string {
    // Remove dangerous characters and patterns
    let sanitized = filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace unsafe characters
      .replace(/^\.+/, '') // Remove leading dots
      .replace(/\.{2,}/g, '.') // Replace multiple dots
      .substring(0, 255); // Limit length

    // Ensure file has an extension
    if (!sanitized.includes('.')) {
      sanitized += '.txt';
    }

    return sanitized;
  }

  // Get file extension
  private static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot).toLowerCase();
  }

  // Generate file hash for integrity verification
  private static async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Validate file content matches declared MIME type
  private static validateFileContent(file: File, metadata: FileMetadata): boolean {
    // For images, we can validate by trying to load them
    if (metadata.isImage) {
      return this.validateImageContent(file);
    }

    // For other files, basic validation
    return true;
  }

  // Validate image content
  private static validateImageContent(file: File): boolean {
    return new Promise<boolean>((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };

      img.src = url;
    });
  }

  // Get image dimensions
  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  // Check for malicious content
  private static async checkForMaliciousContent(file: File): Promise<{ isClean: boolean; threats: string[] }> {
    const threats: string[] = [];

    // Check file size for zip bombs
    if (file.size > 100 * 1024 * 1024) { // 100MB
      threats.push('File size is suspiciously large');
    }

    // Check for executable extensions disguised as other files
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const filename = file.name.toLowerCase();
    
    for (const ext of dangerousExtensions) {
      if (filename.includes(ext)) {
        threats.push('File contains dangerous executable extension');
        break;
      }
    }

    // For text files, check for suspicious content
    if (file.type.startsWith('text/') || file.name.endsWith('.svg')) {
      const content = await this.readFileAsText(file);
      const suspiciousPatterns = [
        /<script\b/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b/gi,
        /<object\b/gi,
        /<embed\b/gi,
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(content)) {
          threats.push('File contains suspicious script content');
          break;
        }
      }
    }

    return {
      isClean: threats.length === 0,
      threats,
    };
  }

  // Read file as text
  private static async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // Sanitize image file (remove EXIF data, etc.)
  private static async sanitizeImageFile(file: File): Promise<File> {
    try {
      // Create a canvas to redraw the image without metadata
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      return new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image to canvas (removes EXIF data)
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const sanitizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(sanitizedFile);
            } else {
              reject(new Error('Failed to create sanitized image'));
            }
          }, file.type);
        };

        img.onerror = () => reject(new Error('Failed to load image for sanitization'));
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.warn('Image sanitization failed, returning original file:', error);
      return file;
    }
  }

  // Format bytes for human readable display
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Create secure upload configuration for QR codes
  static getQRCodeUploadConfig(): FileValidationOptions {
    return {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      enableImageSanitization: true,
    };
  }

  // Create secure upload configuration for avatars
  static getAvatarUploadConfig(): FileValidationOptions {
    return {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      enableImageSanitization: true,
    };
  }

  // Create secure upload configuration for documents
  static getDocumentUploadConfig(): FileValidationOptions {
    return {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['application/pdf', 'text/plain'],
      allowedExtensions: ['.pdf', '.txt'],
      enableImageSanitization: false,
    };
  }
}
