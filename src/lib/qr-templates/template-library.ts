
export interface QRTemplate {
  id: string;
  name: string;
  category: 'business' | 'personal' | 'event' | 'marketing' | 'social';
  description: string;
  preview: string;
  style: {
    darkColor: string;
    lightColor: string;
    eyeColor: string;
    pattern: string;
    template: string;
    eyeRadius: number;
    useGradient?: boolean;
    gradientType?: 'linear' | 'radial';
    gradientStartColor?: string;
    gradientEndColor?: string;
    gradientTarget?: 'foreground' | 'background';
  };
  isPremium: boolean;
}

export const QR_TEMPLATES: QRTemplate[] = [
  {
    id: 'classic-black',
    name: 'Classic Black',
    category: 'business',
    description: 'Simple and professional black QR code',
    preview: '/templates/classic-black.png',
    style: {
      darkColor: '#000000',
      lightColor: '#FFFFFF',
      eyeColor: '#000000',
      pattern: 'square',
      template: 'square',
      eyeRadius: 0
    },
    isPremium: false
  },
  {
    id: 'gradient-blue',
    name: 'Gradient Blue',
    category: 'business',
    description: 'Professional blue gradient for corporate use',
    preview: '/templates/gradient-blue.png',
    style: {
      darkColor: '#1E40AF',
      lightColor: '#FFFFFF',
      eyeColor: '#1E40AF',
      pattern: 'rounded',
      template: 'rounded',
      eyeRadius: 8,
      useGradient: true,
      gradientType: 'linear',
      gradientStartColor: '#3B82F6',
      gradientEndColor: '#1E40AF',
      gradientTarget: 'foreground'
    },
    isPremium: true
  },
  {
    id: 'neon-green',
    name: 'Neon Green',
    category: 'marketing',
    description: 'Eye-catching neon green for marketing campaigns',
    preview: '/templates/neon-green.png',
    style: {
      darkColor: '#10B981',
      lightColor: '#000000',
      eyeColor: '#059669',
      pattern: 'dots',
      template: 'rounded',
      eyeRadius: 12,
      useGradient: true,
      gradientType: 'radial',
      gradientStartColor: '#34D399',
      gradientEndColor: '#059669',
      gradientTarget: 'foreground'
    },
    isPremium: true
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    category: 'event',
    description: 'Sophisticated purple design for special events',
    preview: '/templates/elegant-purple.png',
    style: {
      darkColor: '#7C3AED',
      lightColor: '#FFFFFF',
      eyeColor: '#6D28D9',
      pattern: 'fluid',
      template: 'rounded',
      eyeRadius: 16,
      useGradient: true,
      gradientType: 'linear',
      gradientStartColor: '#8B5CF6',
      gradientEndColor: '#5B21B6',
      gradientTarget: 'foreground'
    },
    isPremium: true
  },
  {
    id: 'social-orange',
    name: 'Social Orange',
    category: 'social',
    description: 'Vibrant orange perfect for social media',
    preview: '/templates/social-orange.png',
    style: {
      darkColor: '#EA580C',
      lightColor: '#FFFFFF',
      eyeColor: '#DC2626',
      pattern: 'circle',
      template: 'rounded',
      eyeRadius: 20,
      useGradient: true,
      gradientType: 'linear',
      gradientStartColor: '#FB923C',
      gradientEndColor: '#C2410C',
      gradientTarget: 'foreground'
    },
    isPremium: true
  },
  {
    id: 'minimalist-gray',
    name: 'Minimalist Gray',
    category: 'personal',
    description: 'Clean and minimal gray design',
    preview: '/templates/minimalist-gray.png',
    style: {
      darkColor: '#374151',
      lightColor: '#F9FAFB',
      eyeColor: '#111827',
      pattern: 'square',
      template: 'rounded',
      eyeRadius: 4
    },
    isPremium: false
  }
];

export const getTemplatesByCategory = (category: string): QRTemplate[] => {
  return QR_TEMPLATES.filter(template => template.category === category);
};

export const getPremiumTemplates = (): QRTemplate[] => {
  return QR_TEMPLATES.filter(template => template.isPremium);
};

export const getFreeTemplates = (): QRTemplate[] => {
  return QR_TEMPLATES.filter(template => !template.isPremium);
};

export const getTemplateById = (id: string): QRTemplate | undefined => {
  return QR_TEMPLATES.find(template => template.id === id);
};
