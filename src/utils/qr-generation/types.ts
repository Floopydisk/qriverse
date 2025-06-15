
export interface QRStyleOptions {
  width?: number;
  margin?: number;
  darkColor: string;
  lightColor: string;
  eyeColor?: string;
  pattern?: 'square' | 'circle' | 'rounded' | 'diamond' | 'hexagon' | 'star' | 'dots' | 'fluid';
  template?: 'square' | 'circle' | 'rounded' | 'hexagon' | 'diamond' | 'scan-me';
  cornerRadius?: number;
  eyeRadius?: number;
  qrStyle?: 'squares' | 'dots' | 'fluid';
  eyeStyle?: 'square' | 'circle';
  // Gradient options
  useGradient?: boolean;
  gradientType?: 'linear' | 'radial';
  gradientDirection?: string;
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientTarget?: 'foreground' | 'background';
  // Transparency options
  backgroundTransparent?: boolean;
  foregroundTransparent?: boolean;
  backgroundOpacity?: number;
  foregroundOpacity?: number;
}

export type QRMappedStyle = 'squares' | 'dots' | 'fluid';
export type QREyeStyle = 'square' | 'circle';
