
export interface SmartQRRule {
  id: string;
  name: string;
  priority: number;
  conditions: SmartQRCondition[];
  action: SmartQRAction;
  enabled: boolean;
}

export interface SmartQRCondition {
  type: 'device' | 'location' | 'time' | 'language' | 'referrer' | 'user_agent';
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'between';
  value: string | string[] | number[];
}

export interface SmartQRAction {
  type: 'redirect' | 'content' | 'api_call';
  value: string;
  metadata?: Record<string, any>;
}

export interface MultiURLConfig {
  id: string;
  name: string;
  description?: string;
  defaultUrl: string;
  rules: SmartQRRule[];
  analytics: {
    trackingEnabled: boolean;
    conversionGoals?: string[];
  };
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  userAgent: string;
}

export interface LocationInfo {
  country: string;
  region: string;
  city: string;
  timezone: string;
  language: string;
}

export interface ScanContext {
  device: DeviceInfo;
  location: LocationInfo;
  time: Date;
  referrer?: string;
  customParams?: Record<string, string>;
}

class SmartQRManager {
  
  // Device detection
  detectDevice(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase();
    
    let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    let os = 'Unknown';
    let browser = 'Unknown';

    // Detect device type
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      type = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
      type = 'mobile';
    }

    // Detect OS
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';

    // Detect browser
    if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/edg/i.test(ua)) browser = 'Edge';
    else if (/opera/i.test(ua)) browser = 'Opera';

    return { type, os, browser, userAgent };
  }

  // Location detection (would typically use IP geolocation service)
  async detectLocation(): Promise<LocationInfo> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        country: data.country_name || 'Unknown',
        region: data.region || 'Unknown',
        city: data.city || 'Unknown',
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language || 'en'
      };
    } catch (error) {
      console.error('Failed to detect location:', error);
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language || 'en'
      };
    }
  }

  // Rule evaluation
  evaluateCondition(condition: SmartQRCondition, context: ScanContext): boolean {
    let contextValue: any;

    switch (condition.type) {
      case 'device':
        contextValue = context.device.type;
        break;
      case 'location':
        contextValue = context.location.country;
        break;
      case 'time':
        contextValue = context.time.getHours();
        break;
      case 'language':
        contextValue = context.location.language;
        break;
      case 'referrer':
        contextValue = context.referrer || '';
        break;
      case 'user_agent':
        contextValue = context.device.userAgent;
        break;
      default:
        return false;
    }

    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;
      case 'contains':
        return String(contextValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'starts_with':
        return String(contextValue).toLowerCase().startsWith(String(condition.value).toLowerCase());
      case 'ends_with':
        return String(contextValue).toLowerCase().endsWith(String(condition.value).toLowerCase());
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case 'between':
        if (Array.isArray(condition.value) && condition.value.length === 2) {
          const numValue = Number(contextValue);
          return numValue >= Number(condition.value[0]) && numValue <= Number(condition.value[1]);
        }
        return false;
      default:
        return false;
    }
  }

  evaluateRule(rule: SmartQRRule, context: ScanContext): boolean {
    if (!rule.enabled) return false;
    
    // All conditions must be true for the rule to match
    return rule.conditions.every(condition => this.evaluateCondition(condition, context));
  }

  // Smart QR resolution
  async resolveSmartQR(config: MultiURLConfig, userAgent: string, referrer?: string): Promise<string> {
    try {
      // Build scan context
      const device = this.detectDevice(userAgent);
      const location = await this.detectLocation();
      const context: ScanContext = {
        device,
        location,
        time: new Date(),
        referrer
      };

      // Sort rules by priority (higher priority first)
      const sortedRules = [...config.rules].sort((a, b) => b.priority - a.priority);

      // Find first matching rule
      for (const rule of sortedRules) {
        if (this.evaluateRule(rule, context)) {
          console.log(`Smart QR rule matched: ${rule.name}`);
          
          switch (rule.action.type) {
            case 'redirect':
              return rule.action.value;
            case 'content':
              // For content action, return a special URL that serves the content
              return `/smart-content/${config.id}/${rule.id}`;
            case 'api_call':
              // For API calls, make the call and redirect based on response
              try {
                const response = await fetch(rule.action.value, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ context, metadata: rule.action.metadata })
                });
                const result = await response.json();
                return result.redirectUrl || config.defaultUrl;
              } catch (error) {
                console.error('Smart QR API call failed:', error);
                return config.defaultUrl;
              }
            default:
              return config.defaultUrl;
          }
        }
      }

      // No rules matched, return default URL
      return config.defaultUrl;
    } catch (error) {
      console.error('Error resolving smart QR:', error);
      return config.defaultUrl;
    }
  }

  // Predefined rule templates
  getCommonRuleTemplates(): Partial<SmartQRRule>[] {
    return [
      {
        name: 'Mobile Users to App Store',
        conditions: [
          {
            type: 'device',
            operator: 'equals',
            value: 'mobile'
          }
        ],
        action: {
          type: 'redirect',
          value: 'https://apps.apple.com/app/your-app'
        }
      },
      {
        name: 'Desktop Users to Website',
        conditions: [
          {
            type: 'device',
            operator: 'equals',
            value: 'desktop'
          }
        ],
        action: {
          type: 'redirect',
          value: 'https://yourwebsite.com'
        }
      },
      {
        name: 'US Users to US Site',
        conditions: [
          {
            type: 'location',
            operator: 'equals',
            value: 'United States'
          }
        ],
        action: {
          type: 'redirect',
          value: 'https://us.yoursite.com'
        }
      },
      {
        name: 'Business Hours Only',
        conditions: [
          {
            type: 'time',
            operator: 'between',
            value: [9, 17]
          }
        ],
        action: {
          type: 'redirect',
          value: 'https://yoursite.com/contact'
        }
      },
      {
        name: 'iOS Users to App Store',
        conditions: [
          {
            type: 'user_agent',
            operator: 'contains',
            value: 'iPhone'
          }
        ],
        action: {
          type: 'redirect',
          value: 'https://apps.apple.com/app/your-app'
        }
      }
    ];
  }

  // Analytics and tracking
  async trackScan(configId: string, ruleId: string | null, context: ScanContext): Promise<void> {
    try {
      // Track the scan with analytics service
      console.log('Tracking smart QR scan:', {
        configId,
        ruleId,
        device: context.device.type,
        location: context.location.country,
        time: context.time
      });

      // Here you would typically send to your analytics service
      // await analyticsService.track('smart_qr_scan', { ... });
    } catch (error) {
      console.error('Failed to track smart QR scan:', error);
    }
  }

  // A/B Testing support
  createABTestRule(name: string, variantUrls: string[], traffic: number[]): SmartQRRule {
    if (variantUrls.length !== traffic.length) {
      throw new Error('Variant URLs and traffic percentages must have the same length');
    }

    const totalTraffic = traffic.reduce((sum, t) => sum + t, 0);
    if (Math.abs(totalTraffic - 100) > 0.01) {
      throw new Error('Traffic percentages must sum to 100');
    }

    return {
      id: crypto.randomUUID(),
      name,
      priority: 50,
      conditions: [], // No conditions - applies to all traffic
      action: {
        type: 'redirect',
        value: this.selectVariantUrl(variantUrls, traffic),
        metadata: { isABTest: true, variants: variantUrls, traffic }
      },
      enabled: true
    };
  }

  private selectVariantUrl(urls: string[], traffic: number[]): string {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (let i = 0; i < traffic.length; i++) {
      cumulative += traffic[i];
      if (random <= cumulative) {
        return urls[i];
      }
    }

    return urls[urls.length - 1]; // Fallback to last URL
  }
}

export const smartQRManager = new SmartQRManager();
