import { auditLogger } from './audit-logger';
import { authRateLimiter } from './rate-limiter';

interface LoginAttempt {
  timestamp: Date;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
}

interface LoginPattern {
  ipAddress: string;
  attempts: LoginAttempt[];
  suspiciousScore: number;
  blocked: boolean;
  firstSeen: Date;
  lastSeen: Date;
}

interface ThreatIndicator {
  type: 'brute_force' | 'credential_stuffing' | 'account_enumeration' | 'distributed_attack';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  description: string;
  indicators: string[];
}

class LoginMonitor {
  private loginAttempts: LoginAttempt[] = [];
  private ipPatterns: Map<string, LoginPattern> = new Map();
  private blockedIPs: Set<string> = new Set();
  private maxAttempts = 1000; // Keep last 1000 attempts

  // Track login attempt
  trackLoginAttempt(
    email: string,
    success: boolean,
    failureReason?: string,
    ipAddress?: string
  ): void {
    const attempt: LoginAttempt = {
      timestamp: new Date(),
      email: email.toLowerCase(),
      ipAddress: ipAddress || this.getClientIP(),
      userAgent: navigator.userAgent,
      success,
      failureReason
    };

    this.loginAttempts.push(attempt);
    this.updateIPPattern(attempt);
    this.trimAttempts();

    // Log the attempt
    auditLogger.logAuthEvent('login', success, {
      email: attempt.email,
      ipAddress: attempt.ipAddress,
      failureReason,
      userAgent: attempt.userAgent
    });

    // Analyze for threats if login failed
    if (!success) {
      this.analyzeThreatPatterns(attempt);
    }

    // Update rate limiter
    if (!success) {
      authRateLimiter.recordAttempt(attempt.ipAddress, 'login');
    } else {
      authRateLimiter.reset(attempt.ipAddress, 'login');
    }
  }

  // Get login statistics
  getLoginStats(timeRange?: { start: Date; end: Date }): {
    totalAttempts: number;
    successfulLogins: number;
    failedLogins: number;
    uniqueIPs: number;
    uniqueEmails: number;
    topFailureReasons: Array<{ reason: string; count: number }>;
    suspiciousIPs: string[];
  } {
    let attempts = this.loginAttempts;
    
    if (timeRange) {
      attempts = attempts.filter(a => 
        a.timestamp >= timeRange.start && a.timestamp <= timeRange.end
      );
    }

    const successful = attempts.filter(a => a.success);
    const failed = attempts.filter(a => !a.success);
    const uniqueIPs = new Set(attempts.map(a => a.ipAddress));
    const uniqueEmails = new Set(attempts.map(a => a.email));

    // Count failure reasons
    const failureReasons = new Map<string, number>();
    failed.forEach(attempt => {
      if (attempt.failureReason) {
        failureReasons.set(
          attempt.failureReason,
          (failureReasons.get(attempt.failureReason) || 0) + 1
        );
      }
    });

    const topFailureReasons = Array.from(failureReasons.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    const suspiciousIPs = Array.from(this.ipPatterns.entries())
      .filter(([, pattern]) => pattern.suspiciousScore > 50)
      .map(([ip]) => ip);

    return {
      totalAttempts: attempts.length,
      successfulLogins: successful.length,
      failedLogins: failed.length,
      uniqueIPs: uniqueIPs.size,
      uniqueEmails: uniqueEmails.size,
      topFailureReasons,
      suspiciousIPs
    };
  }

  // Get threat analysis
  getThreatAnalysis(): {
    threats: ThreatIndicator[];
    riskScore: number;
    recommendations: string[];
  } {
    const threats: ThreatIndicator[] = [];
    let riskScore = 0;

    // Analyze IP patterns for threats
    this.ipPatterns.forEach((pattern, ip) => {
      const ipThreats = this.analyzeIPPattern(pattern);
      threats.push(...ipThreats);
      riskScore += ipThreats.reduce((sum, threat) => sum + threat.confidence, 0);
    });

    // Global threat analysis
    const recentAttempts = this.getRecentAttempts(24 * 60 * 60 * 1000); // Last 24 hours
    
    // Check for distributed attacks
    const uniqueIPs = new Set(recentAttempts.map(a => a.ipAddress));
    if (uniqueIPs.size > 50 && recentAttempts.length > 200) {
      threats.push({
        type: 'distributed_attack',
        severity: 'high',
        confidence: 85,
        description: 'Distributed brute force attack detected across multiple IP addresses',
        indicators: [
          `${uniqueIPs.size} unique IP addresses`,
          `${recentAttempts.length} login attempts in 24 hours`
        ]
      });
      riskScore += 85;
    }

    // Check for credential stuffing
    const emailVariety = new Set(recentAttempts.map(a => a.email)).size;
    if (emailVariety > 100) {
      threats.push({
        type: 'credential_stuffing',
        severity: 'high',
        confidence: 75,
        description: 'Potential credential stuffing attack detected',
        indicators: [
          `${emailVariety} different email addresses attempted`,
          'High email variety suggests leaked credential usage'
        ]
      });
      riskScore += 75;
    }

    // Normalize risk score (0-100)
    riskScore = Math.min(100, riskScore / Math.max(1, threats.length));

    const recommendations = this.generateRecommendations(threats, riskScore);

    return {
      threats,
      riskScore,
      recommendations
    };
  }

  // Get suspicious activities
  getSuspiciousActivities(limit: number = 20): Array<{
    type: string;
    timestamp: Date;
    details: Record<string, any>;
    severity: string;
  }> {
    const suspicious: Array<{
      type: string;
      timestamp: Date;
      details: Record<string, any>;
      severity: string;
    }> = [];

    // Add patterns with high suspicious scores
    this.ipPatterns.forEach((pattern, ip) => {
      if (pattern.suspiciousScore > 70) {
        suspicious.push({
          type: 'suspicious_ip_pattern',
          timestamp: pattern.lastSeen,
          details: {
            ipAddress: ip,
            attempts: pattern.attempts.length,
            suspiciousScore: pattern.suspiciousScore,
            timespan: pattern.lastSeen.getTime() - pattern.firstSeen.getTime()
          },
          severity: pattern.suspiciousScore > 90 ? 'critical' : 'high'
        });
      }
    });

    // Sort by timestamp and limit
    return suspicious
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Block/unblock IP address
  blockIP(ipAddress: string, reason: string): void {
    this.blockedIPs.add(ipAddress);
    auditLogger.log('account_locked', {
      ipAddress,
      reason,
      action: 'ip_blocked'
    }, 'high');
  }

  unblockIP(ipAddress: string): void {
    this.blockedIPs.delete(ipAddress);
    auditLogger.log('account_locked', {
      ipAddress,
      action: 'ip_unblocked'
    }, 'medium');
  }

  isIPBlocked(ipAddress: string): boolean {
    return this.blockedIPs.has(ipAddress);
  }

  // Get recent failed attempts for an email
  getRecentFailuresForEmail(email: string, timeWindow: number = 15 * 60 * 1000): LoginAttempt[] {
    const cutoff = new Date(Date.now() - timeWindow);
    return this.loginAttempts.filter(attempt => 
      attempt.email === email.toLowerCase() &&
      !attempt.success &&
      attempt.timestamp >= cutoff
    );
  }

  private getClientIP(): string {
    // In production, this would come from the server
    return 'client-side';
  }

  private updateIPPattern(attempt: LoginAttempt): void {
    let pattern = this.ipPatterns.get(attempt.ipAddress);
    
    if (!pattern) {
      pattern = {
        ipAddress: attempt.ipAddress,
        attempts: [],
        suspiciousScore: 0,
        blocked: false,
        firstSeen: attempt.timestamp,
        lastSeen: attempt.timestamp
      };
      this.ipPatterns.set(attempt.ipAddress, pattern);
    }

    pattern.attempts.push(attempt);
    pattern.lastSeen = attempt.timestamp;
    
    // Keep only last 100 attempts per IP
    if (pattern.attempts.length > 100) {
      pattern.attempts = pattern.attempts.slice(-100);
    }

    // Calculate suspicious score
    pattern.suspiciousScore = this.calculateSuspiciousScore(pattern);
  }

  private calculateSuspiciousScore(pattern: LoginPattern): number {
    let score = 0;
    const recentAttempts = pattern.attempts.filter(
      a => a.timestamp >= new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    // High failure rate
    const failureRate = recentAttempts.filter(a => !a.success).length / Math.max(1, recentAttempts.length);
    score += failureRate * 40;

    // High frequency
    if (recentAttempts.length > 20) {
      score += 30;
    } else if (recentAttempts.length > 10) {
      score += 15;
    }

    // Many different emails from same IP
    const uniqueEmails = new Set(pattern.attempts.map(a => a.email)).size;
    if (uniqueEmails > 10) {
      score += 20;
    } else if (uniqueEmails > 5) {
      score += 10;
    }

    // Consistent user agent (possible bot)
    const userAgents = new Set(pattern.attempts.map(a => a.userAgent));
    if (userAgents.size === 1 && pattern.attempts.length > 10) {
      score += 15;
    }

    return Math.min(100, score);
  }

  private analyzeThreatPatterns(attempt: LoginAttempt): void {
    const pattern = this.ipPatterns.get(attempt.ipAddress);
    if (!pattern) return;

    // Check for brute force
    const recentFailures = pattern.attempts.filter(
      a => !a.success && a.timestamp >= new Date(Date.now() - 15 * 60 * 1000)
    );

    if (recentFailures.length >= 10) {
      auditLogger.log('brute_force_detected', {
        ipAddress: attempt.ipAddress,
        attempts: recentFailures.length,
        timeWindow: '15 minutes',
        targetEmails: [...new Set(recentFailures.map(a => a.email))]
      }, 'critical');
    }

    // Check for account enumeration
    const emailsAttempted = new Set(pattern.attempts.map(a => a.email));
    if (emailsAttempted.size > 20) {
      auditLogger.log('suspicious_activity_detected', {
        type: 'account_enumeration',
        ipAddress: attempt.ipAddress,
        emailsAttempted: emailsAttempted.size,
        pattern: 'multiple_email_attempts'
      }, 'high');
    }
  }

  private analyzeIPPattern(pattern: LoginPattern): ThreatIndicator[] {
    const threats: ThreatIndicator[] = [];
    
    // Brute force detection
    const recentFailures = pattern.attempts.filter(
      a => !a.success && a.timestamp >= new Date(Date.now() - 60 * 60 * 1000)
    );

    if (recentFailures.length > 20) {
      threats.push({
        type: 'brute_force',
        severity: 'critical',
        confidence: 95,
        description: `Brute force attack from ${pattern.ipAddress}`,
        indicators: [
          `${recentFailures.length} failed attempts in last hour`,
          `Targeting ${new Set(recentFailures.map(a => a.email)).size} different accounts`
        ]
      });
    }

    // Account enumeration detection
    const uniqueEmails = new Set(pattern.attempts.map(a => a.email));
    if (uniqueEmails.size > 50) {
      threats.push({
        type: 'account_enumeration',
        severity: 'high',
        confidence: 80,
        description: `Account enumeration from ${pattern.ipAddress}`,
        indicators: [
          `Attempted ${uniqueEmails.size} different email addresses`,
          'Systematic email testing pattern detected'
        ]
      });
    }

    return threats;
  }

  private getRecentAttempts(timeWindow: number): LoginAttempt[] {
    const cutoff = new Date(Date.now() - timeWindow);
    return this.loginAttempts.filter(a => a.timestamp >= cutoff);
  }

  private generateRecommendations(threats: ThreatIndicator[], riskScore: number): string[] {
    const recommendations: string[] = [];

    if (riskScore > 80) {
      recommendations.push('Immediate action required: Implement emergency rate limiting');
      recommendations.push('Consider temporarily blocking suspicious IP ranges');
    }

    if (threats.some(t => t.type === 'brute_force')) {
      recommendations.push('Enable CAPTCHA for login attempts');
      recommendations.push('Implement progressive delays for failed attempts');
    }

    if (threats.some(t => t.type === 'credential_stuffing')) {
      recommendations.push('Force password resets for compromised accounts');
      recommendations.push('Implement device fingerprinting');
    }

    if (threats.some(t => t.type === 'distributed_attack')) {
      recommendations.push('Implement geographic rate limiting');
      recommendations.push('Enable advanced bot detection');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring login patterns');
      recommendations.push('Maintain current security measures');
    }

    return recommendations;
  }

  private trimAttempts(): void {
    if (this.loginAttempts.length > this.maxAttempts) {
      this.loginAttempts = this.loginAttempts.slice(-this.maxAttempts);
    }
  }
}

export const loginMonitor = new LoginMonitor();
