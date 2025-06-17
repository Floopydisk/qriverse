
import { supabase } from '@/integrations/supabase/client';

export interface PasswordProtection {
  enabled: boolean;
  password: string;
  hint?: string;
}

export interface GeofenceProtection {
  enabled: boolean;
  allowedCountries?: string[];
  allowedRegions?: string[];
  allowedCities?: string[];
  blockedCountries?: string[];
  blockedRegions?: string[];
  blockedCities?: string[];
  radius?: number; // in kilometers
  centerLat?: number;
  centerLng?: number;
}

export interface TimeBasedProtection {
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  allowedDays?: number[]; // 0-6 (Sunday-Saturday)
  allowedHours?: { start: number; end: number }; // 0-23
  timezone?: string;
}

export interface UsageLimits {
  enabled: boolean;
  maxScans?: number;
  maxScansPerDay?: number;
  maxScansPerUser?: number;
}

export interface QRProtectionSettings {
  password?: PasswordProtection;
  geofence?: GeofenceProtection;
  timeBased?: TimeBasedProtection;
  usageLimits?: UsageLimits;
}

class QRProtectionManager {
  
  // Password protection methods
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const inputHash = await this.hashPassword(password);
    return inputHash === hash;
  }

  // Geofencing methods
  async getUserLocation(): Promise<{ lat: number; lng: number; country?: string; city?: string } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          try {
            // Get location details from IP-based service as fallback
            const response = await fetch('https://ipapi.co/json/');
            const locationData = await response.json();
            
            resolve({
              lat,
              lng,
              country: locationData.country_name,
              city: locationData.city
            });
          } catch (error) {
            console.error('Failed to get location details:', error);
            resolve({ lat, lng });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async checkGeofence(
    userLocation: { lat: number; lng: number; country?: string; city?: string },
    geofence: GeofenceProtection
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (!geofence.enabled) {
      return { allowed: true };
    }

    // Check country restrictions
    if (geofence.allowedCountries && geofence.allowedCountries.length > 0) {
      if (!userLocation.country || !geofence.allowedCountries.includes(userLocation.country)) {
        return { allowed: false, reason: 'Location not in allowed countries' };
      }
    }

    if (geofence.blockedCountries && geofence.blockedCountries.length > 0) {
      if (userLocation.country && geofence.blockedCountries.includes(userLocation.country)) {
        return { allowed: false, reason: 'Location is in blocked countries' };
      }
    }

    // Check city restrictions
    if (geofence.allowedCities && geofence.allowedCities.length > 0) {
      if (!userLocation.city || !geofence.allowedCities.includes(userLocation.city)) {
        return { allowed: false, reason: 'Location not in allowed cities' };
      }
    }

    if (geofence.blockedCities && geofence.blockedCities.length > 0) {
      if (userLocation.city && geofence.blockedCities.includes(userLocation.city)) {
        return { allowed: false, reason: 'Location is in blocked cities' };
      }
    }

    // Check radius restrictions
    if (geofence.radius && geofence.centerLat && geofence.centerLng) {
      const distance = this.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        geofence.centerLat,
        geofence.centerLng
      );

      if (distance > geofence.radius) {
        return { allowed: false, reason: `Location is ${distance.toFixed(1)}km away, maximum allowed is ${geofence.radius}km` };
      }
    }

    return { allowed: true };
  }

  // Time-based protection methods
  checkTimeRestrictions(timeBased: TimeBasedProtection): { allowed: boolean; reason?: string } {
    if (!timeBased.enabled) {
      return { allowed: true };
    }

    const now = new Date();
    const userTimezone = timeBased.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));

    // Check date range
    if (timeBased.startDate && timeBased.endDate) {
      const startDate = new Date(timeBased.startDate);
      const endDate = new Date(timeBased.endDate);

      if (userTime < startDate || userTime > endDate) {
        return { allowed: false, reason: 'QR code is not active during this time period' };
      }
    }

    // Check allowed days
    if (timeBased.allowedDays && timeBased.allowedDays.length > 0) {
      const currentDay = userTime.getDay();
      if (!timeBased.allowedDays.includes(currentDay)) {
        return { allowed: false, reason: 'QR code is not accessible on this day of the week' };
      }
    }

    // Check allowed hours
    if (timeBased.allowedHours) {
      const currentHour = userTime.getHours();
      const { start, end } = timeBased.allowedHours;

      if (start <= end) {
        // Same day range (e.g., 9 AM to 5 PM)
        if (currentHour < start || currentHour >= end) {
          return { allowed: false, reason: `QR code is only accessible between ${start}:00 and ${end}:00` };
        }
      } else {
        // Overnight range (e.g., 10 PM to 6 AM)
        if (currentHour < start && currentHour >= end) {
          return { allowed: false, reason: `QR code is only accessible between ${start}:00 and ${end}:00` };
        }
      }
    }

    return { allowed: true };
  }

  // Usage limits methods
  async checkUsageLimits(
    qrCodeId: string,
    userIdentifier: string,
    usageLimits: UsageLimits
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (!usageLimits.enabled) {
      return { allowed: true };
    }

    try {
      // Check total scans
      if (usageLimits.maxScans) {
        const { count: totalScans } = await supabase
          .from('qr_scans')
          .select('*', { count: 'exact', head: true })
          .eq('qr_code_id', qrCodeId);

        if (totalScans && totalScans >= usageLimits.maxScans) {
          return { allowed: false, reason: 'Maximum scan limit reached' };
        }
      }

      // Check daily scans
      if (usageLimits.maxScansPerDay) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count: dailyScans } = await supabase
          .from('qr_scans')
          .select('*', { count: 'exact', head: true })
          .eq('qr_code_id', qrCodeId)
          .gte('created_at', today.toISOString());

        if (dailyScans && dailyScans >= usageLimits.maxScansPerDay) {
          return { allowed: false, reason: 'Daily scan limit reached' };
        }
      }

      // Check per-user scans
      if (usageLimits.maxScansPerUser) {
        const { count: userScans } = await supabase
          .from('qr_scans')
          .select('*', { count: 'exact', head: true })
          .eq('qr_code_id', qrCodeId)
          .eq('ip_address', userIdentifier); // Using IP as user identifier

        if (userScans && userScans >= usageLimits.maxScansPerUser) {
          return { allowed: false, reason: 'Maximum scans per user reached' };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking usage limits:', error);
      return { allowed: true }; // Allow access if check fails
    }
  }

  // Main validation method
  async validateQRAccess(
    qrCodeId: string,
    protection: QRProtectionSettings,
    userInputs?: {
      password?: string;
      userIdentifier?: string;
    }
  ): Promise<{ allowed: boolean; reason?: string; requiresPassword?: boolean; requiresLocation?: boolean }> {
    try {
      // Check password protection
      if (protection.password?.enabled) {
        if (!userInputs?.password) {
          return { allowed: false, requiresPassword: true, reason: 'Password required' };
        }

        const isPasswordValid = await this.verifyPassword(
          userInputs.password,
          protection.password.password
        );

        if (!isPasswordValid) {
          return { allowed: false, reason: 'Invalid password' };
        }
      }

      // Check time-based restrictions
      if (protection.timeBased) {
        const timeCheck = this.checkTimeRestrictions(protection.timeBased);
        if (!timeCheck.allowed) {
          return timeCheck;
        }
      }

      // Check usage limits
      if (protection.usageLimits && userInputs?.userIdentifier) {
        const usageCheck = await this.checkUsageLimits(
          qrCodeId,
          userInputs.userIdentifier,
          protection.usageLimits
        );
        if (!usageCheck.allowed) {
          return usageCheck;
        }
      }

      // Check geofencing (requires user location)
      if (protection.geofence?.enabled) {
        const userLocation = await this.getUserLocation();
        if (!userLocation) {
          return { allowed: false, requiresLocation: true, reason: 'Location access required' };
        }

        const geofenceCheck = await this.checkGeofence(userLocation, protection.geofence);
        if (!geofenceCheck.allowed) {
          return geofenceCheck;
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error validating QR access:', error);
      return { allowed: false, reason: 'Validation error occurred' };
    }
  }
}

export const qrProtectionManager = new QRProtectionManager();
