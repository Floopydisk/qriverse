
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { DataSanitizer, ValidationRule } from '@/lib/security/data-sanitization';
import { cn } from '@/lib/utils';

interface SecureInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  label?: string;
  validationRule?: ValidationRule;
  enableRealTimeValidation?: boolean;
  showSecurityIndicator?: boolean;
  sanitizeOnChange?: boolean;
  onChange?: (value: string, isValid: boolean) => void;
  onValidationChange?: (errors: string[]) => void;
}

export interface SecureInputRef {
  getValue: () => string;
  isValid: () => boolean;
  getErrors: () => string[];
  reset: () => void;
}

const SecureInput = forwardRef<SecureInputRef, SecureInputProps>(({
  label,
  validationRule,
  enableRealTimeValidation = true,
  showSecurityIndicator = true,
  sanitizeOnChange = true,
  onChange,
  onValidationChange,
  className,
  value: controlledValue,
  ...props
}, ref) => {
  const [value, setValue] = useState(controlledValue || '');
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [securityLevel, setSecurityLevel] = useState<'safe' | 'warning' | 'danger'>('safe');

  useImperativeHandle(ref, () => ({
    getValue: () => value as string,
    isValid: () => isValid,
    getErrors: () => errors,
    reset: () => {
      setValue('');
      setErrors([]);
      setIsValid(true);
      setSecurityLevel('safe');
    },
  }));

  // Update internal value when controlled value changes
  useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(controlledValue);
    }
  }, [controlledValue]);

  // Validate input value
  const validateInput = (inputValue: string): { isValid: boolean; errors: string[]; securityLevel: 'safe' | 'warning' | 'danger' } => {
    const validationErrors: string[] = [];
    let level: 'safe' | 'warning' | 'danger' = 'safe';

    if (!validationRule) {
      return { isValid: true, errors: [], securityLevel: 'safe' };
    }

    // Required validation
    if (validationRule.required && (!inputValue || inputValue.trim() === '')) {
      validationErrors.push('This field is required');
      level = 'danger';
    }

    if (inputValue) {
      // Type validation
      if (validationRule.type && validationRule.type === 'number' && isNaN(Number(inputValue))) {
        validationErrors.push('Must be a valid number');
        level = 'danger';
      }

      // Pattern validation
      if (validationRule.pattern && !DataSanitizer.validatePattern(inputValue, validationRule.pattern)) {
        validationErrors.push(validationRule.message || 'Invalid format');
        level = 'danger';
      }

      // Length validation
      if (validationRule.minLength && inputValue.length < validationRule.minLength) {
        validationErrors.push(`Must be at least ${validationRule.minLength} characters`);
        level = 'warning';
      }

      if (validationRule.maxLength && inputValue.length > validationRule.maxLength) {
        validationErrors.push(`Must not exceed ${validationRule.maxLength} characters`);
        level = 'danger';
      }

      // Custom validation
      if (validationRule.validate) {
        const customResult = validationRule.validate(inputValue);
        if (customResult !== true) {
          validationErrors.push(customResult);
          level = 'danger';
        }
      }

      // Security validation
      const securityCheck = DataSanitizer.sanitizeString(inputValue, { allowHTML: false });
      if (securityCheck !== inputValue) {
        if (level !== 'danger') level = 'warning';
      }

      // XSS pattern detection
      const xssValidation = DataSanitizer.validateInput(inputValue);
      if (xssValidation.risk === 'high') {
        validationErrors.push('Input contains potentially dangerous content');
        level = 'danger';
      } else if (xssValidation.risk === 'medium' && level === 'safe') {
        level = 'warning';
      }
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      securityLevel: level,
    };
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Sanitize input if enabled
    if (sanitizeOnChange) {
      newValue = DataSanitizer.sanitizeString(newValue, {
        allowHTML: false,
        stripWhitespace: false,
        maxLength: validationRule?.maxLength || 10000,
      });
    }

    setValue(newValue);

    // Validate in real-time if enabled
    if (enableRealTimeValidation) {
      const validation = validateInput(newValue);
      setErrors(validation.errors);
      setIsValid(validation.isValid);
      setSecurityLevel(validation.securityLevel);
      
      onValidationChange?.(validation.errors);
    }

    // Call external onChange
    onChange?.(newValue, enableRealTimeValidation ? isValid : true);
  };

  // Validate on blur
  const handleBlur = () => {
    if (!enableRealTimeValidation) {
      const validation = validateInput(value as string);
      setErrors(validation.errors);
      setIsValid(validation.isValid);
      setSecurityLevel(validation.securityLevel);
      
      onValidationChange?.(validation.errors);
      onChange?.(value as string, validation.isValid);
    }
  };

  // Get security indicator color
  const getSecurityColor = () => {
    switch (securityLevel) {
      case 'safe': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'danger': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={props.id}>{label}</Label>
          {showSecurityIndicator && (
            <div className="flex items-center gap-1">
              <Shield className={cn("h-4 w-4", getSecurityColor())} />
              <span className={cn("text-xs", getSecurityColor())}>
                {securityLevel === 'safe' && 'Secure'}
                {securityLevel === 'warning' && 'Caution'}
                {securityLevel === 'danger' && 'Risk'}
              </span>
            </div>
          )}
        </div>
      )}
      
      <Input
        {...props}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={cn(
          className,
          errors.length > 0 && 'border-red-500 focus:border-red-500',
          securityLevel === 'warning' && 'border-yellow-500',
          securityLevel === 'safe' && value && 'border-green-500'
        )}
      />
      
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});

SecureInput.displayName = 'SecureInput';

export default SecureInput;
