
import { useState, useEffect, useCallback } from 'react';
import { auditLogger } from '@/lib/security/audit-logger';
import { loginMonitor } from '@/lib/security/login-monitor';
import { apiMonitor } from '@/lib/security/api-monitor';

interface SecurityDashboard {
  auditMetrics: {
    totalEvents: number;
    criticalEvents: number;
    recentEvents: any[];
  };
  loginMetrics: {
    totalAttempts: number;
    failedLogins: number;
    suspiciousIPs: string[];
    riskScore: number;
  };
  apiMetrics: {
    totalRequests: number;
    errorRate: number;
    suspiciousIPs: string[];
    riskScore: number;
  };
  overallRiskScore: number;
  recommendations: string[];
}

export const useSecurityMonitoring = () => {
  const [dashboard, setDashboard] = useState<SecurityDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshDashboard = useCallback(() => {
    try {
      // Get audit metrics
      const auditMetrics = auditLogger.getMetrics();
      const criticalEvents = auditLogger.getEvents({ severity: 'critical' }).length;

      // Get login metrics
      const loginStats = loginMonitor.getLoginStats();
      const loginThreats = loginMonitor.getThreatAnalysis();

      // Get API metrics
      const apiStats = apiMonitor.getAPIStats();
      const apiAbuse = apiMonitor.getAbuseDetection();

      // Calculate overall risk score
      const overallRiskScore = Math.round(
        (loginThreats.riskScore + apiAbuse.riskScore + (criticalEvents > 0 ? 100 : 0)) / 3
      );

      // Combine recommendations
      const recommendations = [
        ...loginThreats.recommendations,
        ...apiAbuse.recommendations
      ].filter((rec, index, arr) => arr.indexOf(rec) === index); // Remove duplicates

      setDashboard({
        auditMetrics: {
          totalEvents: auditMetrics.totalEvents,
          criticalEvents,
          recentEvents: auditMetrics.recentEvents
        },
        loginMetrics: {
          totalAttempts: loginStats.totalAttempts,
          failedLogins: loginStats.failedLogins,
          suspiciousIPs: loginStats.suspiciousIPs,
          riskScore: loginThreats.riskScore
        },
        apiMetrics: {
          totalRequests: apiStats.totalRequests,
          errorRate: apiStats.errorRate,
          suspiciousIPs: apiStats.suspiciousIPs,
          riskScore: apiAbuse.riskScore
        },
        overallRiskScore,
        recommendations
      });
    } catch (error) {
      console.error('Failed to refresh security dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
    
    // Refresh every 30 seconds
    const interval = setInterval(refreshDashboard, 30000);
    
    return () => clearInterval(interval);
  }, [refreshDashboard]);

  // Track login attempt
  const trackLoginAttempt = useCallback((
    email: string,
    success: boolean,
    failureReason?: string
  ) => {
    loginMonitor.trackLoginAttempt(email, success, failureReason);
    refreshDashboard();
  }, [refreshDashboard]);

  // Track API request
  const trackApiRequest = useCallback((
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    options?: any
  ) => {
    apiMonitor.trackRequest(endpoint, method, statusCode, responseTime, options);
    refreshDashboard();
  }, [refreshDashboard]);

  // Get detailed security report
  const getSecurityReport = useCallback(() => {
    const timeRange = {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      end: new Date()
    };

    return {
      auditReport: auditLogger.generateSecurityReport(timeRange),
      loginAnalysis: loginMonitor.getThreatAnalysis(),
      apiAnalysis: apiMonitor.getAbuseDetection(),
      suspiciousActivities: loginMonitor.getSuspiciousActivities(50)
    };
  }, []);

  // Export security logs
  const exportSecurityLogs = useCallback((format: 'json' | 'csv' = 'json') => {
    const auditLogs = auditLogger.exportEvents(format);
    const apiLogs = apiMonitor.exportLogs(format);
    
    if (format === 'json') {
      return {
        auditLogs: JSON.parse(auditLogs),
        apiLogs: JSON.parse(apiLogs),
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      auditLogs,
      apiLogs,
      timestamp: new Date().toISOString()
    };
  }, []);

  // Block suspicious IP
  const blockSuspiciousIP = useCallback((ipAddress: string, reason: string) => {
    loginMonitor.blockIP(ipAddress, reason);
    auditLogger.log('account_locked', {
      ipAddress,
      reason,
      action: 'manual_block'
    }, 'high');
    refreshDashboard();
  }, [refreshDashboard]);

  return {
    dashboard,
    loading,
    refreshDashboard,
    trackLoginAttempt,
    trackApiRequest,
    getSecurityReport,
    exportSecurityLogs,
    blockSuspiciousIP
  };
};
