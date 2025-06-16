
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  progressiveDelay: boolean;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (entry.resetTime < now && (!entry.blockUntil || entry.blockUntil < now)) {
        this.storage.delete(key);
      }
    }
  }

  private getKey(identifier: string, action: string): string {
    return `${identifier}:${action}`;
  }

  isRateLimited(identifier: string, action: string = 'default'): boolean {
    const key = this.getKey(identifier, action);
    const entry = this.storage.get(key);
    const now = Date.now();

    if (!entry) return false;

    // Check if currently blocked
    if (entry.blocked && entry.blockUntil && entry.blockUntil > now) {
      return true;
    }

    // Reset if window has expired
    if (entry.resetTime <= now) {
      this.storage.delete(key);
      return false;
    }

    return entry.count >= this.config.maxAttempts;
  }

  recordAttempt(identifier: string, action: string = 'default'): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const key = this.getKey(identifier, action);
    const now = Date.now();
    let entry = this.storage.get(key);

    // Initialize or reset if window expired
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
        blocked: false
      };
    }

    entry.count++;

    // Check if limit exceeded
    if (entry.count > this.config.maxAttempts) {
      entry.blocked = true;
      entry.blockUntil = now + this.config.blockDurationMs;
      
      // Progressive delay - increase block time for repeated violations
      if (this.config.progressiveDelay) {
        const violations = Math.floor(entry.count / this.config.maxAttempts);
        entry.blockUntil = now + (this.config.blockDurationMs * Math.pow(2, violations - 1));
      }
    }

    this.storage.set(key, entry);

    return {
      allowed: entry.count <= this.config.maxAttempts && !entry.blocked,
      remaining: Math.max(0, this.config.maxAttempts - entry.count),
      resetTime: entry.resetTime,
      retryAfter: entry.blockUntil && entry.blockUntil > now ? entry.blockUntil - now : undefined
    };
  }

  reset(identifier: string, action: string = 'default'): void {
    const key = this.getKey(identifier, action);
    this.storage.delete(key);
  }

  getStatus(identifier: string, action: string = 'default'): {
    attempts: number;
    remaining: number;
    resetTime: number;
    blocked: boolean;
    retryAfter?: number;
  } {
    const key = this.getKey(identifier, action);
    const entry = this.storage.get(key);
    const now = Date.now();

    if (!entry || entry.resetTime <= now) {
      return {
        attempts: 0,
        remaining: this.config.maxAttempts,
        resetTime: now + this.config.windowMs,
        blocked: false
      };
    }

    return {
      attempts: entry.count,
      remaining: Math.max(0, this.config.maxAttempts - entry.count),
      resetTime: entry.resetTime,
      blocked: entry.blocked && entry.blockUntil ? entry.blockUntil > now : false,
      retryAfter: entry.blockUntil && entry.blockUntil > now ? entry.blockUntil - now : undefined
    };
  }
}

// Pre-configured rate limiters for different actions
export const authRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes
  progressiveDelay: true
});

export const passwordResetRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours
  progressiveDelay: true
});

export const apiRateLimiter = new RateLimiter({
  maxAttempts: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 15 * 60 * 1000, // 15 minutes
  progressiveDelay: false
});

export { RateLimiter };
