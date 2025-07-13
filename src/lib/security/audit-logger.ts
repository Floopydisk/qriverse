import * as crypto from 'crypto';
export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  metadata?: Record<string, any>;
}

export type SecurityEventType = 
  | 'auth_login_success'
  | 'auth_login_failed' 
  | 'auth_signup_success'
  | 'auth_signup_failed'
  | 'auth_logout'
  | 'auth_session_expired'
  | 'auth_password_reset_requested'
  | 'auth_password_reset_completed'
  | 'api_request'
  | 'api_rate_limit_exceeded'
  | 'api_unauthorized_access'
  | 'file_upload'
  | 'file_upload_blocked'
  | 'xss_attempt_detected'
  | 'csrf_token_mismatch'
  | 'suspicious_activity_detected'
  | 'data_breach_attempt'
  | 'privilege_escalation_attempt'
  | 'brute_force_detected'
  | 'account_locked'
  | 'security_scan_detected'
  | 'malicious_payload_detected';

interface SecurityMetrics {
  failedLogins: number;
  successfulLogins: number;
  blockedRequests: number;
  suspiciousActivities: number;
  lastActivity: Date;
}

class AuditLogger {
  private events: AuditEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events in memory
  private metrics: SecurityMetrics = {
    failedLogins: 0,
    successfulLogins: 0,
    blockedRequests: 0,
    suspiciousActivities: 0,
    lastActivity: new Date()
  };

  // Log a security event
  log(
    eventType: SecurityEventType,
    details: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
    userId?: string
  ): void {
    const event: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      eventType,
      severity,
      userId: userId || this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      details,
      metadata: this.collectMetadata()
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.trimEvents();
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Security Audit] ${eventType}:`, event);
    }

    // Send to backend in production (if available)
    if (import.meta.env.PROD) {
      this.sendToBackend(event).catch(console.error);
    }

    // Check for suspicious patterns
    this.detectSuspiciousActivity(event);
  }

  // Log authentication events
  logAuthEvent(
    type: 'login' | 'signup' | 'logout' | 'password_reset',
    success: boolean,
    details: Record<string, any> = {},
    userId?: string
  ): void {
    const eventType: SecurityEventType = success 
      ? `auth_${type}_success` as SecurityEventType
      : `auth_${type}_failed` as SecurityEventType;
    
    const severity = success ? 'low' : (type === 'login' ? 'medium' : 'low');
    
    this.log(eventType, {
      success,
      attempt_type: type,
      ...details
    }, severity, userId);
  }

  // Log API access
  logApiAccess(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    details: Record<string, any> = {}
  ): void {
    const severity = statusCode >= 400 ? 'medium' : 'low';
    
    this.log('api_request', {
      endpoint,
      method,
      statusCode,
      responseTime,
      ...details
    }, severity);
  }

  // Log file upload events
  logFileUpload(
    filename: string,
    fileSize: number,
    mimeType: string,
    success: boolean,
    details: Record<string, any> = {}
  ): void {
    const eventType: SecurityEventType = success ? 'file_upload' : 'file_upload_blocked';
    const severity = success ? 'low' : 'medium';
    
    this.log(eventType, {
      filename,
      fileSize,
      mimeType,
      success,
      ...details
    }, severity);
  }

  // Log security violations
  logSecurityViolation(
    violationType: string,
    details: Record<string, any>,
    severity: 'medium' | 'high' | 'critical' = 'high'
  ): void {
    this.log('suspicious_activity_detected', {
      violationType,
      ...details
    }, severity);
  }

  // Get events by criteria
  getEvents(filter?: {
    eventType?: SecurityEventType;
    severity?: string;
    userId?: string;
    timeRange?: { start: Date; end: Date };
    limit?: number;
  }): AuditEvent[] {
    let filteredEvents = [...this.events];

    if (filter) {
      if (filter.eventType) {
        filteredEvents = filteredEvents.filter(e => e.eventType === filter.eventType);
      }
      
      if (filter.severity) {
        filteredEvents = filteredEvents.filter(e => e.severity === filter.severity);
      }
      
      if (filter.userId) {
        filteredEvents = filteredEvents.filter(e => e.userId === filter.userId);
      }
      
      if (filter.timeRange) {
        filteredEvents = filteredEvents.filter(e => 
          e.timestamp >= filter.timeRange!.start && 
          e.timestamp <= filter.timeRange!.end
        );
      }
    }

    // Sort by timestamp (most recent first)
    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return filter?.limit ? filteredEvents.slice(0, filter.limit) : filteredEvents;
  }

  // Get security metrics
  getMetrics(): SecurityMetrics & { totalEvents: number; recentEvents: AuditEvent[] } {
    return {
      ...this.metrics,
      totalEvents: this.events.length,
      recentEvents: this.getEvents({ limit: 10 })
    };
  }

  // Generate security report
  generateSecurityReport(timeRange?: { start: Date; end: Date }): {
    summary: SecurityMetrics;
    criticalEvents: AuditEvent[];
    failedLoginAttempts: AuditEvent[];
    suspiciousActivities: AuditEvent[];
    apiAbuse: AuditEvent[];
    recommendations: string[];
  } {
    const events = this.getEvents({ timeRange });
    
    const criticalEvents = events.filter(e => e.severity === 'critical');
    const failedLoginAttempts = events.filter(e => e.eventType === 'auth_login_failed');
    const suspiciousActivities = events.filter(e => e.eventType === 'suspicious_activity_detected');
    const apiAbuse = events.filter(e => e.eventType === 'api_rate_limit_exceeded');
    
    const recommendations: string[] = [];
    
    if (failedLoginAttempts.length > 10) {
      recommendations.push('High number of failed login attempts detected. Consider implementing stricter rate limiting.');
    }
    
    if (criticalEvents.length > 0) {
      recommendations.push('Critical security events detected. Immediate review recommended.');
    }
    
    if (suspiciousActivities.length > 5) {
      recommendations.push('Multiple suspicious activities detected. Consider additional security measures.');
    }

    return {
      summary: this.metrics,
      criticalEvents,
      failedLoginAttempts,
      suspiciousActivities,
      apiAbuse,
      recommendations
    };
  }

  // Clear old events
  clearOldEvents(olderThan: Date): void {
    this.events = this.events.filter(e => e.timestamp >= olderThan);
  }

  // Export events (for backup or analysis)
  exportEvents(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.eventsToCSV();
    }
    return JSON.stringify(this.events, null, 2);
  }

  private generateEventId(): string {
    const randomBytes = crypto.randomBytes(12).toString('hex');
    return `${Date.now()}-${randomBytes}`;
  }
  private getCurrentUserId(): string | undefined {
    // Try to get user ID from various sources
    try {
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.user?.id;
      }
    } catch (error) {
      // Silent fail
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    // Get session ID from storage or generate one
    let sessionId = sessionStorage.getItem('security_session_id');
    if (!sessionId) {
      sessionId = this.generateEventId();
      sessionStorage.setItem('security_session_id', sessionId);
    }
    return sessionId;
  }

  private getClientIP(): string {
    // In a real implementation, this would come from the server
    // For now, we'll use a placeholder
    return 'client-side';
  }

  private collectMetadata(): Record<string, any> {
    return {
      url: window.location.href,
      referrer: document.referrer,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform
    };
  }

  private updateMetrics(event: AuditEvent): void {
    this.metrics.lastActivity = event.timestamp;
    
    switch (event.eventType) {
      case 'auth_login_success':
        this.metrics.successfulLogins++;
        break;
      case 'auth_login_failed':
        this.metrics.failedLogins++;
        break;
      case 'api_rate_limit_exceeded':
      case 'file_upload_blocked':
        this.metrics.blockedRequests++;
        break;
      case 'suspicious_activity_detected':
        this.metrics.suspiciousActivities++;
        break;
    }
  }

  private trimEvents(): void {
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  private async sendToBackend(event: AuditEvent): Promise<void> {
    // In a real implementation, send to your backend/Supabase
    // For now, we'll just store in localStorage as backup
    try {
      const stored = localStorage.getItem('security_audit_backup') || '[]';
      const backup = JSON.parse(stored);
      backup.push(event);
      
      // Keep only last 100 events in localStorage
      if (backup.length > 100) {
        backup.splice(0, backup.length - 100);
      }
      
      localStorage.setItem('security_audit_backup', JSON.stringify(backup));
    } catch (error) {
      console.error('Failed to backup audit event:', error);
    }
  }

  private detectSuspiciousActivity(event: AuditEvent): void {
    // Check for brute force attacks
    if (event.eventType === 'auth_login_failed') {
      const recentFailures = this.getEvents({
        eventType: 'auth_login_failed',
        timeRange: {
          start: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
          end: new Date()
        }
      });
      
      if (recentFailures.length >= 5) {
        this.log('brute_force_detected', {
          failedAttempts: recentFailures.length,
          timeWindow: '15 minutes',
          targetUser: event.userId
        }, 'critical');
      }
    }

    // Check for rapid API requests (potential bot activity)
    if (event.eventType === 'api_request') {
      const recentRequests = this.getEvents({
        eventType: 'api_request',
        timeRange: {
          start: new Date(Date.now() - 60 * 1000), // Last minute
          end: new Date()
        }
      });
      
      if (recentRequests.length > 100) {
        this.log('security_scan_detected', {
          requestCount: recentRequests.length,
          timeWindow: '1 minute'
        }, 'high');
      }
    }

    // Check for privilege escalation attempts
    if (event.details.unauthorized_access) {
      this.log('privilege_escalation_attempt', {
        attemptedAction: event.details.action,
        currentRole: event.details.userRole,
        requiredRole: event.details.requiredRole
      }, 'high');
    }
  }

  private eventsToCSV(): string {
    if (this.events.length === 0) return '';
    
    const headers = ['ID', 'Timestamp', 'Event Type', 'Severity', 'User ID', 'IP Address', 'Details'];
    const rows = this.events.map(event => [
      event.id,
      event.timestamp.toISOString(),
      event.eventType,
      event.severity,
      event.userId || '',
      event.ipAddress || '',
      JSON.stringify(event.details)
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
}

export const auditLogger = new AuditLogger();
