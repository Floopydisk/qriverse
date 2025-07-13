
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  securityOptions?: {
    enableSanitization?: boolean;
    enableValidation?: boolean;
    enableXSSProtection?: boolean;
  };
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, securityOptions, onChange, ...props }, ref) => {
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (securityOptions?.enableSanitization && typeof e.target.value === 'string') {
        // Basic sanitization for regular input component
        const sanitized = e.target.value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
          .replace(/javascript:/gi, '') // Remove javascript: URLs
          .replace(/data:/gi, '') // Remove data: URLs
          .replace(/vbscript:/gi, '') // Remove vbscript: URLs
          .replace(/on\w+\s*=/gi, ''); // Remove event handlers
        
        if (sanitized !== e.target.value) {
          e.target.value = sanitized;
        }
      }
      
      onChange?.(e);
    }, [onChange, securityOptions]);

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
