
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLength: number;
  preventCommonPasswords: boolean;
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
  preventCommonPasswords: true,
};

// Common passwords list (subset for demo - in production use a comprehensive list)
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'iloveyou',
  'password1', 'admin123', 'welcome123', 'qwerty123', 'password321'
];

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number; // 0-100
}

export const validatePassword = (
  password: string, 
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  } else {
    score += 20;
  }

  if (password.length > requirements.maxLength) {
    errors.push(`Password must not exceed ${requirements.maxLength} characters`);
  }

  // Character requirements
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (requirements.requireUppercase) {
    score += 15;
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (requirements.requireLowercase) {
    score += 15;
  }

  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (requirements.requireNumbers) {
    score += 15;
  }

  if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else if (requirements.requireSpecialChars) {
    score += 15;
  }

  // Common password check
  if (requirements.preventCommonPasswords && COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  } else if (requirements.preventCommonPasswords) {
    score += 10;
  }

  // Additional complexity scoring
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.6) {
    score += 10; // Good character diversity
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 100)
  };
};

export const getPasswordStrengthLabel = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: 'Excellent', color: 'text-green-600' };
  if (score >= 75) return { label: 'Strong', color: 'text-green-500' };
  if (score >= 60) return { label: 'Good', color: 'text-yellow-500' };
  if (score >= 40) return { label: 'Fair', color: 'text-orange-500' };
  return { label: 'Weak', color: 'text-red-500' };
};
