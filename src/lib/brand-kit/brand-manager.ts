
export interface BrandColor {
  id: string;
  name: string;
  hex: string;
  isPrimary?: boolean;
}

export interface BrandFont {
  id: string;
  name: string;
  family: string;
  weight: string;
}

export interface BrandLogo {
  id: string;
  name: string;
  url: string;
  type: 'primary' | 'secondary' | 'icon';
}

export interface BrandKit {
  id: string;
  name: string;
  userId: string;
  colors: BrandColor[];
  fonts: BrandFont[];
  logos: BrandLogo[];
  createdAt: string;
  updatedAt: string;
}

export interface BrandKitTemplate {
  id: string;
  name: string;
  description: string;
  colors: Omit<BrandColor, 'id'>[];
  fonts: Omit<BrandFont, 'id'>[];
}

export const DEFAULT_BRAND_TEMPLATES: BrandKitTemplate[] = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional blue color scheme for corporate brands',
    colors: [
      { name: 'Primary Blue', hex: '#1E40AF', isPrimary: true },
      { name: 'Light Blue', hex: '#3B82F6' },
      { name: 'Dark Blue', hex: '#1E3A8A' },
      { name: 'Gray', hex: '#6B7280' },
      { name: 'White', hex: '#FFFFFF' }
    ],
    fonts: [
      { name: 'Heading', family: 'Inter', weight: '600' },
      { name: 'Body', family: 'Inter', weight: '400' }
    ]
  },
  {
    id: 'modern-green',
    name: 'Modern Green',
    description: 'Fresh green palette for eco-friendly and tech brands',
    colors: [
      { name: 'Primary Green', hex: '#10B981', isPrimary: true },
      { name: 'Light Green', hex: '#34D399' },
      { name: 'Dark Green', hex: '#059669' },
      { name: 'Neutral', hex: '#374151' },
      { name: 'Light Gray', hex: '#F3F4F6' }
    ],
    fonts: [
      { name: 'Heading', family: 'Poppins', weight: '700' },
      { name: 'Body', family: 'Poppins', weight: '400' }
    ]
  },
  {
    id: 'creative-purple',
    name: 'Creative Purple',
    description: 'Vibrant purple scheme for creative and artistic brands',
    colors: [
      { name: 'Primary Purple', hex: '#7C3AED', isPrimary: true },
      { name: 'Light Purple', hex: '#A78BFA' },
      { name: 'Dark Purple', hex: '#5B21B6' },
      { name: 'Pink Accent', hex: '#EC4899' },
      { name: 'Off White', hex: '#FAFAFA' }
    ],
    fonts: [
      { name: 'Heading', family: 'Montserrat', weight: '800' },
      { name: 'Body', family: 'Open Sans', weight: '400' }
    ]
  }
];

class BrandKitManager {
  private brandKits: Map<string, BrandKit> = new Map();

  createBrandKit(name: string, userId: string): BrandKit {
    const brandKit: BrandKit = {
      id: crypto.randomUUID(),
      name,
      userId,
      colors: [],
      fonts: [],
      logos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.brandKits.set(brandKit.id, brandKit);
    return brandKit;
  }

  getBrandKit(id: string): BrandKit | undefined {
    return this.brandKits.get(id);
  }

  getUserBrandKits(userId: string): BrandKit[] {
    return Array.from(this.brandKits.values()).filter(kit => kit.userId === userId);
  }

  updateBrandKit(id: string, updates: Partial<BrandKit>): BrandKit | undefined {
    const brandKit = this.brandKits.get(id);
    if (!brandKit) return undefined;

    const updatedKit = {
      ...brandKit,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.brandKits.set(id, updatedKit);
    return updatedKit;
  }

  deleteBrandKit(id: string): boolean {
    return this.brandKits.delete(id);
  }

  addColorToBrandKit(brandKitId: string, color: Omit<BrandColor, 'id'>): BrandKit | undefined {
    const brandKit = this.brandKits.get(brandKitId);
    if (!brandKit) return undefined;

    const newColor: BrandColor = {
      ...color,
      id: crypto.randomUUID()
    };

    brandKit.colors.push(newColor);
    brandKit.updatedAt = new Date().toISOString();

    return brandKit;
  }

  addLogoToBrandKit(brandKitId: string, logo: Omit<BrandLogo, 'id'>): BrandKit | undefined {
    const brandKit = this.brandKits.get(brandKitId);
    if (!brandKit) return undefined;

    const newLogo: BrandLogo = {
      ...logo,
      id: crypto.randomUUID()
    };

    brandKit.logos.push(newLogo);
    brandKit.updatedAt = new Date().toISOString();

    return brandKit;
  }

  applyTemplateToKit(brandKitId: string, templateId: string): BrandKit | undefined {
    const brandKit = this.brandKits.get(brandKitId);
    const template = DEFAULT_BRAND_TEMPLATES.find(t => t.id === templateId);
    
    if (!brandKit || !template) return undefined;

    brandKit.colors = template.colors.map(color => ({
      ...color,
      id: crypto.randomUUID()
    }));

    brandKit.fonts = template.fonts.map(font => ({
      ...font,
      id: crypto.randomUUID()
    }));

    brandKit.updatedAt = new Date().toISOString();

    return brandKit;
  }

  extractColorsFromImage(imageData: ImageData): BrandColor[] {
    // Simple color extraction algorithm
    const colorMap = new Map<string, number>();
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];

      if (alpha > 128) { // Only consider non-transparent pixels
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }
    }

    // Get most frequent colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sortedColors.map((color, index) => ({
      id: crypto.randomUUID(),
      name: `Color ${index + 1}`,
      hex: color[0],
      isPrimary: index === 0
    }));
  }
}

export const brandKitManager = new BrandKitManager();
