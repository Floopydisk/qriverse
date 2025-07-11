
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { FileUploadSecurity, FileValidationOptions, FileValidationResult } from '@/lib/security/file-upload-security';
import { cn } from '@/lib/utils';

interface SecureFileUploadProps {
  onFileSelect?: (file: File, metadata: unknown) => void;
  onFileRemove?: (file: File) => void;
  onValidationResult?: (result: FileValidationResult) => void;
  validationOptions?: FileValidationOptions;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

interface FileWithValidation {
  file: File;
  result: FileValidationResult;
  uploadProgress?: number;
}

const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  onValidationResult,
  validationOptions,
  multiple = false,
  accept,
  maxFiles = 10,
  className,
  disabled = false,
}) => {
  const [files, setFiles] = useState<FileWithValidation[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    
    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      const result: FileValidationResult = {
        isValid: false,
        errors: [`Maximum ${maxFiles} files allowed`],
      };
      onValidationResult?.(result);
      return;
    }

    setIsValidating(true);

    try {
      const newFilesWithValidation: FileWithValidation[] = [];

      for (const file of fileArray) {
        const validationResult = await FileUploadSecurity.validateFile(file, validationOptions);
        
        const fileWithValidation: FileWithValidation = {
          file: validationResult.sanitizedFile || file,
          result: validationResult,
        };

        newFilesWithValidation.push(fileWithValidation);

        // Call callbacks
        onValidationResult?.(validationResult);
        if (validationResult.isValid && validationResult.sanitizedFile) {
          onFileSelect?.(validationResult.sanitizedFile, validationResult.metadata);
        }
      }

      if (multiple) {
        setFiles(prev => [...prev, ...newFilesWithValidation]);
      } else {
        setFiles(newFilesWithValidation);
      }
    } catch (error) {
      console.error('File validation error:', error);
      const result: FileValidationResult = {
        isValid: false,
        errors: ['File validation failed'],
      };
      onValidationResult?.(result);
    } finally {
      setIsValidating(false);
    }
  }, [files.length, maxFiles, validationOptions, onValidationResult, onFileSelect, multiple]);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Remove file
  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    onFileRemove?.(fileToRemove.file);
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Open file selector
  const openFileSelector = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get security status icon
  const getSecurityIcon = (result: FileValidationResult) => {
    if (result.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileSelector}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragOver ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-gray-300 dark:border-gray-600",
          disabled && "cursor-not-allowed opacity-50",
          "hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950"
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <Shield className="h-6 w-6 text-green-500" />
          </div>
          
          <div>
            <p className="text-lg font-medium">
              {isDragOver ? 'Drop files here' : 'Upload files securely'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Click to browse or drag and drop files
            </p>
            {validationOptions?.maxSize && (
              <p className="text-xs text-gray-400 mt-1">
                Max size: {formatFileSize(validationOptions.maxSize)}
              </p>
            )}
          </div>
          
          <Button variant="outline" disabled={disabled}>
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Validation progress */}
      {isValidating && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Validating files...</span>
            </div>
            <Progress value={undefined} className="mt-2" />
          </CardContent>
        </Card>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Files</h4>
          {files.map((fileWithValidation, index) => (
            <Card key={index} className={cn(
              "transition-colors",
              !fileWithValidation.result.isValid && "border-red-200 bg-red-50 dark:bg-red-950"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <File className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {fileWithValidation.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(fileWithValidation.file.size)}
                      </p>
                    </div>
                    {getSecurityIcon(fileWithValidation.result)}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Validation errors */}
                {fileWithValidation.result.errors.length > 0 && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {fileWithValidation.result.errors.map((error, errorIndex) => (
                          <li key={errorIndex}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* File metadata */}
                {fileWithValidation.result.isValid && fileWithValidation.result.metadata && (
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <p>Type: {fileWithValidation.result.metadata.mimeType}</p>
                    {fileWithValidation.result.metadata.isImage && fileWithValidation.result.metadata.imageDimensions && (
                      <p>
                        Dimensions: {fileWithValidation.result.metadata.imageDimensions.width} × {fileWithValidation.result.metadata.imageDimensions.height}
                      </p>
                    )}
                    <p>Hash: {fileWithValidation.result.metadata.hash.substring(0, 16)}...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SecureFileUpload;
