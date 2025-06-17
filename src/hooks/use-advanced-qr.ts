
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { QRTemplate, getTemplateById, QR_TEMPLATES } from '@/lib/qr-templates/template-library';
import { BrandKit, brandKitManager } from '@/lib/brand-kit/brand-manager';
import { QRProtectionSettings, qrProtectionManager } from '@/lib/qr-security/qr-protection';
import { MultiURLConfig, smartQRManager } from '@/lib/smart-qr/smart-qr-manager';
import { useAuth } from '@/hooks/use-auth';

export function useAdvancedQR() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Template management
  const [selectedTemplate, setSelectedTemplate] = useState<QRTemplate | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<QRTemplate[]>([]);
  
  // Brand kit management
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [selectedBrandKit, setSelectedBrandKit] = useState<BrandKit | null>(null);
  
  // Protection settings
  const [protectionSettings, setProtectionSettings] = useState<QRProtectionSettings>({});
  
  // Smart QR settings
  const [smartQRConfig, setSmartQRConfig] = useState<MultiURLConfig | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Load available templates on mount
  useEffect(() => {
    setAvailableTemplates(QR_TEMPLATES);
  }, []);

  // Load user's brand kits
  useEffect(() => {
    if (user) {
      const userBrandKits = brandKitManager.getUserBrandKits(user.id);
      setBrandKits(userBrandKits);
    }
  }, [user]);

  // Template functions
  const applyTemplate = useCallback((templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      setSelectedTemplate(template);
      toast({
        title: "Template Applied",
        description: `${template.name} template has been applied to your QR code.`,
      });
    }
  }, [toast]);

  const getTemplatesByCategory = useCallback((category: string) => {
    return availableTemplates.filter(template => template.category === category);
  }, [availableTemplates]);

  // Brand kit functions
  const createBrandKit = useCallback((name: string) => {
    if (!user) return null;
    
    const newBrandKit = brandKitManager.createBrandKit(name, user.id);
    setBrandKits(prev => [...prev, newBrandKit]);
    
    toast({
      title: "Brand Kit Created",
      description: `${name} brand kit has been created successfully.`,
    });
    
    return newBrandKit;
  }, [user, toast]);

  const applyBrandKit = useCallback((brandKitId: string) => {
    const brandKit = brandKitManager.getBrandKit(brandKitId);
    if (brandKit) {
      setSelectedBrandKit(brandKit);
      toast({
        title: "Brand Kit Applied",
        description: `${brandKit.name} brand kit has been applied.`,
      });
    }
  }, [toast]);

  const updateBrandKit = useCallback((brandKitId: string, updates: Partial<BrandKit>) => {
    const updatedBrandKit = brandKitManager.updateBrandKit(brandKitId, updates);
    if (updatedBrandKit) {
      setBrandKits(prev => prev.map(kit => kit.id === brandKitId ? updatedBrandKit : kit));
      toast({
        title: "Brand Kit Updated",
        description: "Brand kit has been updated successfully.",
      });
    }
  }, [toast]);

  // Protection functions
  const enablePasswordProtection = useCallback(async (password: string, hint?: string) => {
    setIsLoading(true);
    try {
      const hashedPassword = await qrProtectionManager.hashPassword(password);
      
      setProtectionSettings(prev => ({
        ...prev,
        password: {
          enabled: true,
          password: hashedPassword,
          hint
        }
      }));
      
      toast({
        title: "Password Protection Enabled",
        description: "Your QR code is now password protected.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable password protection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const enableGeofencing = useCallback((geofenceSettings: any) => {
    setProtectionSettings(prev => ({
      ...prev,
      geofence: {
        enabled: true,
        ...geofenceSettings
      }
    }));
    
    toast({
      title: "Geofencing Enabled",
      description: "Location-based restrictions have been applied.",
    });
  }, [toast]);

  const enableTimeRestrictions = useCallback((timeSettings: any) => {
    setProtectionSettings(prev => ({
      ...prev,
      timeBased: {
        enabled: true,
        ...timeSettings
      }
    }));
    
    toast({
      title: "Time Restrictions Enabled",
      description: "Time-based access controls have been applied.",
    });
  }, [toast]);

  // Smart QR functions
  const createSmartQR = useCallback((config: Omit<MultiURLConfig, 'id'>) => {
    const newConfig: MultiURLConfig = {
      ...config,
      id: crypto.randomUUID()
    };
    
    setSmartQRConfig(newConfig);
    
    toast({
      title: "Smart QR Created",
      description: "Your smart QR code with dynamic routing has been created.",
    });
    
    return newConfig;
  }, [toast]);

  const addSmartRule = useCallback((rule: any) => {
    if (!smartQRConfig) return;
    
    const updatedConfig = {
      ...smartQRConfig,
      rules: [...smartQRConfig.rules, { ...rule, id: crypto.randomUUID() }]
    };
    
    setSmartQRConfig(updatedConfig);
    
    toast({
      title: "Smart Rule Added",
      description: "New routing rule has been added to your smart QR code.",
    });
  }, [smartQRConfig, toast]);

  // Validation function
  const validateQRAccess = useCallback(async (qrCodeId: string, userInputs?: any) => {
    if (Object.keys(protectionSettings).length === 0) {
      return { allowed: true };
    }
    
    return await qrProtectionManager.validateQRAccess(qrCodeId, protectionSettings, userInputs);
  }, [protectionSettings]);

  return {
    // Template state
    selectedTemplate,
    availableTemplates,
    
    // Brand kit state
    brandKits,
    selectedBrandKit,
    
    // Protection state
    protectionSettings,
    
    // Smart QR state
    smartQRConfig,
    
    // Loading state
    isLoading,
    
    // Template functions
    applyTemplate,
    getTemplatesByCategory,
    
    // Brand kit functions
    createBrandKit,
    applyBrandKit,
    updateBrandKit,
    
    // Protection functions
    enablePasswordProtection,
    enableGeofencing,
    enableTimeRestrictions,
    
    // Smart QR functions
    createSmartQR,
    addSmartRule,
    
    // Validation
    validateQRAccess,
    
    // Setters
    setSelectedTemplate,
    setSelectedBrandKit,
    setProtectionSettings,
    setSmartQRConfig
  };
}
