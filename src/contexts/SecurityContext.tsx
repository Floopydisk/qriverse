
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { encryptionManager, PIIEncryption } from '@/lib/security/encryption';
import { SecureStorage } from '@/lib/security/secure-storage';
import { DataSanitizer } from '@/lib/security/data-sanitization';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface SecurityContextType {
  isSecurityInitialized: boolean;
  initializeSecurity: (password?: string) => Promise<boolean>;
  encryptSensitiveData: (data: string) => Promise<string | null>;
  decryptSensitiveData: (encryptedData: string) => Promise<string | null>;
  sanitizeInput: (input: string, options?: any) => string;
  secureStore: (key: string, value: any) => Promise<boolean>;
  secureRetrieve: <T = any>(key: string) => Promise<T | null>;
  clearSecureData: () => void;
  securitySettings: SecuritySettings;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
}

interface SecuritySettings {
  enableEncryption: boolean;
  enableDataSanitization: boolean;
  enableSecureStorage: boolean;
  encryptionLevel: 'basic' | 'enhanced' | 'maximum';
  sanitizationLevel: 'basic' | 'strict' | 'paranoid';
}

const defaultSecuritySettings: SecuritySettings = {
  enableEncryption: true,
  enableDataSanitization: true,
  enableSecureStorage: true,
  encryptionLevel: 'enhanced',
  sanitizationLevel: 'strict',
};

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [isSecurityInitialized, setIsSecurityInitialized] = useState(false);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize security when user logs in
    if (user && !isSecurityInitialized) {
      initializeSecurity();
    }
  }, [user, isSecurityInitialized]);

  useEffect(() => {
    // Load security settings from storage
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const stored = localStorage.getItem('security_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        setSecuritySettings({ ...defaultSecuritySettings, ...settings });
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    }
  };

  const initializeSecurity = async (password?: string): Promise<boolean> => {
    try {
      // Initialize secure storage
      const storageInitialized = await SecureStorage.initialize(password);
      if (!storageInitialized) {
        throw new Error('Failed to initialize secure storage');
      }

      // Initialize PII encryption if user is authenticated
      if (user && password) {
        const piiInitialized = await PIIEncryption.initializePIIEncryption(password);
        if (!piiInitialized) {
          console.warn('PII encryption initialization failed');
        }
      }

      setIsSecurityInitialized(true);
      
      toast({
        title: "Security Initialized",
        description: "Advanced security features are now active.",
      });

      return true;
    } catch (error) {
      console.error('Security initialization failed:', error);
      toast({
        title: "Security Warning",
        description: "Failed to initialize security features. Some data may not be encrypted.",
        variant: "destructive",
      });
      return false;
    }
  };

  const encryptSensitiveData = async (data: string): Promise<string | null> => {
    if (!securitySettings.enableEncryption) {
      return data;
    }

    try {
      const encrypted = await PIIEncryption.encryptPIIField(data);
      return encrypted ? JSON.stringify(encrypted) : null;
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  };

  const decryptSensitiveData = async (encryptedData: string): Promise<string | null> => {
    if (!securitySettings.enableEncryption) {
      return encryptedData;
    }

    try {
      const parsed = JSON.parse(encryptedData);
      return await PIIEncryption.decryptPIIField(parsed);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  };

  const sanitizeInput = (input: string, options: any = {}): string => {
    if (!securitySettings.enableDataSanitization) {
      return input;
    }

    const sanitizationOptions = {
      allowHTML: false,
      maxLength: 10000,
      stripWhitespace: true,
      ...options,
    };

    switch (securitySettings.sanitizationLevel) {
      case 'paranoid':
        return DataSanitizer.sanitizeString(input, {
          ...sanitizationOptions,
          allowHTML: false,
          maxLength: 1000,
        });
      case 'strict':
        return DataSanitizer.sanitizeString(input, sanitizationOptions);
      case 'basic':
      default:
        return DataSanitizer.sanitizeString(input, {
          ...sanitizationOptions,
          allowHTML: options.allowHTML || false,
        });
    }
  };

  const secureStore = async (key: string, value: any): Promise<boolean> => {
    if (!securitySettings.enableSecureStorage) {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }

    return await SecureStorage.setItem(key, value);
  };

  const secureRetrieve = async <T = any>(key: string): Promise<T | null> => {
    if (!securitySettings.enableSecureStorage) {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }

    return await SecureStorage.getItem<T>(key);
  };

  const clearSecureData = () => {
    SecureStorage.clear();
    PIIEncryption.clearPIIEncryption();
    
    // Clear security-related localStorage items
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sec_') || key.startsWith('enc_') || key.startsWith('pii_')) {
        localStorage.removeItem(key);
      }
    });

    setIsSecurityInitialized(false);
    
    toast({
      title: "Security Data Cleared",
      description: "All encrypted data has been removed from this device.",
    });
  };

  const updateSecuritySettings = (newSettings: Partial<SecuritySettings>) => {
    const updatedSettings = { ...securitySettings, ...newSettings };
    setSecuritySettings(updatedSettings);
    
    // Save to localStorage
    localStorage.setItem('security_settings', JSON.stringify(updatedSettings));
    
    toast({
      title: "Security Settings Updated",
      description: "Your security preferences have been saved.",
    });
  };

  const contextValue: SecurityContextType = {
    isSecurityInitialized,
    initializeSecurity,
    encryptSensitiveData,
    decryptSensitiveData,
    sanitizeInput,
    secureStore,
    secureRetrieve,
    clearSecureData,
    securitySettings,
    updateSecuritySettings,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};
