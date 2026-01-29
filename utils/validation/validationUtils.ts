/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format
 */
export function validatePhone(phone: string): boolean {
  // Simple validation - can be expanded based on requirements
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Validates that a field is not empty
 */
export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a URL
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates a number within a range
 */
export function validateNumberInRange(value: string, min?: number, max?: number): { isValid: boolean; error?: string } {
  const num = Number(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Value must be a number' };
  }
  
  if (min !== undefined && num < min) {
    return { isValid: false, error: `Value must be at least ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { isValid: false, error: `Value must be at most ${max}` };
  }
  
  return { isValid: true };
}

/**
 * Validates a date string
 */
export function validateDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validates a date range
 */
export function validateDateRange(startDate: string, endDate: string): { isValid: boolean; error?: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    return { isValid: false, error: 'End date must be after start date' };
  }
  
  return { isValid: true };
}

/**
 * Validates a field with multiple validators
 */
export function validateField(value: string, validators: ((val: string) => boolean | { isValid: boolean; error?: string })[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const validator of validators) {
    const result = validator(value);
    
    if (typeof result === 'boolean') {
      if (!result) {
        errors.push('Invalid value');
      }
    } else {
      if (!result.isValid) {
        errors.push(result.error || 'Invalid value');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generic form validation function
 */
export function validateForm(formData: Record<string, any>, rules: Record<string, ((val: any) => boolean | { isValid: boolean; error?: string })[]>): { isValid: boolean; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};
  
  for (const field in rules) {
    const value = formData[field];
    const fieldRules = rules[field];
    
    if (fieldRules) {
      const validationResult = validateField(String(value || ''), fieldRules);
      
      if (!validationResult.isValid) {
        errors[field] = validationResult.errors;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Custom validation error class
 */
export function validatePasswordStrength(password: string): { score: number; isValid: boolean; feedback: string[] } {
  let score = 0;
  const feedback: string[] = [];
  
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters');
  } else {
    score += 20;
  }
  
  if (/[A-Z]/.test(password)) {
    score += 20;
  } else {
    feedback.push('Add uppercase letters');
  }
  
  if (/[a-z]/.test(password)) {
    score += 20;
  } else {
    feedback.push('Add lowercase letters');
  }
  
  if (/\d/.test(password)) {
    score += 20;
  } else {
    feedback.push('Add numbers');
  }
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 20;
  } else {
    feedback.push('Add special characters');
  }
  
  // Extra points for longer passwords
  if (password.length >= 12) {
    score = Math.min(100, score + 10);
  }
  
  return {
    score: Math.min(100, score),
    isValid: feedback.length === 0,
    feedback
  };
}

export class FormValidationError extends Error {
  errors: Record<string, string[]>;
  
  constructor(message: string, errors: Record<string, string[]>) {
    super(message);
    this.name = 'FormValidationError';
    this.errors = errors;
  }
}