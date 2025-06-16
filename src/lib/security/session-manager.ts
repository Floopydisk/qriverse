
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface SecureSessionData {
  user: User;
  session: Session;
  deviceFingerprint: string;
  createdAt: number;
  lastActivity: number;
  isValid: boolean;
}

interface DeviceInfo {
  userAgent: string;
  language: string;
  platform: string;
  timezone: string;
  screenResolution: string;
}

class SessionManager {
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private sessionData: SecureSessionData | null = null;
  private activityTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.setupActivityTracking();
    this.setupStorageListener();
  }

  private generateDeviceFingerprint(): string {
    const deviceInfo = this.getDeviceInfo();
    const fingerprintData = [
      deviceInfo.userAgent,
      deviceInfo.language,
      deviceInfo.platform,
      deviceInfo.timezone,
      deviceInfo.screenResolution,
      navigator.hardwareConcurrency || 'unknown',
      navigator.maxTouchPoints || 'unknown'
    ].join('|');

    // Simple hash function for fingerprinting
    let hash = 0;
    for (let i = 0; i < fingerprintData.length; i++) {
      const char = fingerprintData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`
    };
  }

  private setupActivityTracking() {
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, () => this.updateActivity(), { passive: true });
    });

    // Check session validity every minute
    setInterval(() => this.validateSession(), 60 * 1000);
  }

  private setupStorageListener() {
    // Listen for storage changes (tab synchronization)
    window.addEventListener('storage', (e) => {
      if (e.key === 'session_invalidated') {
        this.invalidateSession();
      }
    });
  }

  private updateActivity() {
    if (this.sessionData) {
      this.sessionData.lastActivity = Date.now();
      this.resetActivityTimer();
    }
  }

  private resetActivityTimer() {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    
    this.activityTimer = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.SESSION_TIMEOUT);
  }

  private handleSessionTimeout() {
    console.warn('Session timeout due to inactivity');
    this.invalidateSession();
    // Trigger logout in auth context
    window.dispatchEvent(new CustomEvent('session-timeout'));
  }

  async initializeSession(user: User, session: Session): Promise<boolean> {
    const deviceFingerprint = this.generateDeviceFingerprint();
    const now = Date.now();

    // Store device fingerprint for this session
    const storedFingerprint = localStorage.getItem('device_fingerprint');
    if (storedFingerprint && storedFingerprint !== deviceFingerprint) {
      console.warn('Device fingerprint mismatch - potential session hijacking');
      return false;
    }

    localStorage.setItem('device_fingerprint', deviceFingerprint);

    this.sessionData = {
      user,
      session,
      deviceFingerprint,
      createdAt: now,
      lastActivity: now,
      isValid: true
    };

    this.resetActivityTimer();
    return true;
  }

  validateSession(): boolean {
    if (!this.sessionData) return false;

    const now = Date.now();
    
    // Check if session has expired
    if (now - this.sessionData.createdAt > this.MAX_SESSION_DURATION) {
      console.warn('Session expired - maximum duration reached');
      this.invalidateSession();
      return false;
    }

    // Check if session is inactive
    if (now - this.sessionData.lastActivity > this.SESSION_TIMEOUT) {
      console.warn('Session expired - inactivity timeout');
      this.invalidateSession();
      return false;
    }

    // Verify device fingerprint
    const currentFingerprint = this.generateDeviceFingerprint();
    if (currentFingerprint !== this.sessionData.deviceFingerprint) {
      console.warn('Device fingerprint changed - potential session hijacking');
      this.invalidateSession();
      return false;
    }

    return this.sessionData.isValid;
  }

  invalidateSession() {
    if (this.sessionData) {
      this.sessionData.isValid = false;
    }
    
    this.sessionData = null;
    
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }

    // Clear sensitive data
    localStorage.removeItem('device_fingerprint');
    
    // Notify other tabs
    localStorage.setItem('session_invalidated', Date.now().toString());
    localStorage.removeItem('session_invalidated');
  }

  getSessionInfo(): SecureSessionData | null {
    return this.sessionData;
  }

  isSessionValid(): boolean {
    return this.validateSession();
  }

  async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session || !data.user) {
        this.invalidateSession();
        return false;
      }

      if (this.sessionData) {
        this.sessionData.session = data.session;
        this.sessionData.user = data.user;
        this.sessionData.lastActivity = Date.now();
      }

      return true;
    } catch (error) {
      console.error('Session refresh failed:', error);
      this.invalidateSession();
      return false;
    }
  }
}

export const sessionManager = new SessionManager();
