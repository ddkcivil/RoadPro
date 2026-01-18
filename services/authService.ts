/**
 * Authentication service for handling security features like account lockout
 */

interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes window to track attempts

export class AuthService {
  private static readonly STORAGE_KEY = 'login_attempts';

  /**
   * Records a login attempt
   */
  static recordLoginAttempt(email: string, success: boolean): void {
    const attempts = this.getLoginAttempts();
    const now = Date.now();
    
    // Filter out attempts older than the window period
    const recentAttempts = attempts.filter(attempt => 
      now - attempt.timestamp < ATTEMPT_WINDOW && attempt.email === email
    );
    
    // Add the new attempt
    recentAttempts.push({
      email,
      timestamp: now,
      success
    });
    
    // Save back to localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentAttempts));
  }

  /**
   * Checks if an account is locked
   */
  static isAccountLocked(email: string): boolean {
    const attempts = this.getLoginAttempts();
    const now = Date.now();
    
    // Get recent failed attempts for this email
    const recentFailedAttempts = attempts.filter(attempt => 
      attempt.email === email && 
      !attempt.success && 
      now - attempt.timestamp < LOCKOUT_DURATION
    );
    
    // Check if max attempts reached
    return recentFailedAttempts.length >= MAX_LOGIN_ATTEMPTS;
  }

  /**
   * Gets remaining time until account unlock (in milliseconds)
   */
  static getTimeUntilUnlock(email: string): number | null {
    const attempts = this.getLoginAttempts();
    const now = Date.now();
    
    // Get the most recent failed attempt for this email
    const recentFailedAttempts = attempts
      .filter(attempt => attempt.email === email && !attempt.success)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (recentFailedAttempts.length === 0) {
      return null;
    }
    
    const lastFailedAttempt = recentFailedAttempts[0];
    const timePassed = now - lastFailedAttempt.timestamp;
    const timeRemaining = LOCKOUT_DURATION - timePassed;
    
    return timeRemaining > 0 ? timeRemaining : 0;
  }

  /**
   * Clears login attempts for an email (after successful login)
   */
  static clearLoginAttempts(email: string): void {
    const attempts = this.getLoginAttempts();
    const filteredAttempts = attempts.filter(attempt => attempt.email !== email);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredAttempts));
  }

  /**
   * Gets all login attempts
   */
  private static getLoginAttempts(): LoginAttempt[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Validates email and password
   */
  static validateCredentials(email: string, password: string): boolean {
    // Basic validation - in a real app, this would connect to a backend
    // For demo purposes, we'll use a simple validation
    return email.length > 0 && password.length >= 8;
  }

  /**
   * Simulates authentication (in a real app, this would be an API call)
   */
  static async authenticate(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    // Check if account is locked
    if (this.isAccountLocked(email)) {
      const timeRemaining = this.getTimeUntilUnlock(email);
      const minutes = Math.ceil((timeRemaining || 0) / 60000);
      return {
        success: false,
        message: `Account temporarily locked. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`
      };
    }

    // Validate credentials (simulated)
    const isValid = this.validateCredentials(email, password);
    
    // Record the attempt
    this.recordLoginAttempt(email, isValid);
    
    if (isValid) {
      // Clear attempts on successful login
      this.clearLoginAttempts(email);
      return { success: true };
    } else {
      return { success: false, message: 'Invalid email or password.' };
    }
  }
}