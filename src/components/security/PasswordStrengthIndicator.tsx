
import { useState, useEffect } from 'react';
import { validatePassword, getPasswordStrengthLabel, PasswordValidationResult } from '@/lib/security/password-policy';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  onValidationChange?: (result: PasswordValidationResult) => void;
  showRequirements?: boolean;
}

export const PasswordStrengthIndicator = ({ 
  password, 
  onValidationChange,
  showRequirements = true 
}: PasswordStrengthIndicatorProps) => {
  const [validation, setValidation] = useState<PasswordValidationResult>({
    isValid: false,
    errors: [],
    score: 0
  });

  useEffect(() => {
    const result = validatePassword(password);
    setValidation(result);
    onValidationChange?.(result);
  }, [password, onValidationChange]);

  const strengthLabel = getPasswordStrengthLabel(validation.score);

  if (!password) return null;

  const getProgressColor = () => {
    if (validation.score >= 75) return 'bg-green-500';
    if (validation.score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">Password Strength</span>
          <span className={`font-medium ${strengthLabel.color}`}>
            {strengthLabel.label}
          </span>
        </div>
        <div className="relative">
          <Progress 
            value={validation.score} 
            className="h-2 bg-gray-700"
          />
          <div 
            className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${validation.score}%` }}
          />
        </div>
      </div>

      {showRequirements && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Password Requirements</h4>
          <div className="space-y-1">
            <RequirementItem 
              met={password.length >= 12} 
              text="At least 12 characters" 
            />
            <RequirementItem 
              met={/[A-Z]/.test(password)} 
              text="One uppercase letter" 
            />
            <RequirementItem 
              met={/[a-z]/.test(password)} 
              text="One lowercase letter" 
            />
            <RequirementItem 
              met={/\d/.test(password)} 
              text="One number" 
            />
            <RequirementItem 
              met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)} 
              text="One special character" 
            />
          </div>
        </div>
      )}

      {validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface RequirementItemProps {
  met: boolean;
  text: string;
}

const RequirementItem = ({ met, text }: RequirementItemProps) => (
  <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-400' : 'text-gray-500'}`}>
    <CheckCircle className={`h-4 w-4 flex-shrink-0 ${met ? 'text-green-400' : 'text-gray-600'}`} />
    {text}
  </div>
);
