
import { QRAdvancedColorOptions } from "./QRAdvancedColorOptions";
import { QRPatternSelector } from "./QRPatternSelector";
import { QRTemplateSelector } from "./QRTemplateSelector";

interface QRStyleOptionsProps {
  darkColor: string;
  setDarkColor: (color: string) => void;
  lightColor: string;
  setLightColor: (color: string) => void;
  eyeColor: string;
  setEyeColor: (color: string) => void;
  patternColor: string;
  setPatternColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  pattern: string;
  setPattern: (pattern: string) => void;
  template: string;
  setTemplate: (template: string) => void;
  eyeRadius: number;
  setEyeRadius: (radius: number) => void;
  // Gradient props
  useGradient: boolean;
  setUseGradient: (use: boolean) => void;
  gradientType: 'linear' | 'radial';
  setGradientType: (type: 'linear' | 'radial') => void;
  gradientDirection: string;
  setGradientDirection: (direction: string) => void;
  gradientStartColor: string;
  setGradientStartColor: (color: string) => void;
  gradientEndColor: string;
  setGradientEndColor: (color: string) => void;
  gradientTarget: 'foreground' | 'background';
  setGradientTarget: (target: 'foreground' | 'background') => void;
  // Transparency props
  backgroundTransparent: boolean;
  setBackgroundTransparent: (transparent: boolean) => void;
  foregroundTransparent: boolean;
  setForegroundTransparent: (transparent: boolean) => void;
  backgroundOpacity: number;
  setBackgroundOpacity: (opacity: number) => void;
  foregroundOpacity: number;
  setForegroundOpacity: (opacity: number) => void;
}

export function QRStyleOptions({
  darkColor,
  setDarkColor,
  lightColor,
  setLightColor,
  eyeColor,
  setEyeColor,
  patternColor,
  setPatternColor,
  backgroundColor,
  setBackgroundColor,
  pattern,
  setPattern,
  template,
  setTemplate,
  eyeRadius,
  setEyeRadius,
  // Gradient props
  useGradient,
  setUseGradient,
  gradientType,
  setGradientType,
  gradientDirection,
  setGradientDirection,
  gradientStartColor,
  setGradientStartColor,
  gradientEndColor,
  setGradientEndColor,
  gradientTarget,
  setGradientTarget,
  // Transparency props
  backgroundTransparent,
  setBackgroundTransparent,
  foregroundTransparent,
  setForegroundTransparent,
  backgroundOpacity,
  setBackgroundOpacity,
  foregroundOpacity,
  setForegroundOpacity
}: QRStyleOptionsProps) {
  return (
    <div className="space-y-6">
      <QRPatternSelector
        pattern={pattern}
        setPattern={setPattern}
      />
      
      <QRTemplateSelector
        template={template}
        setTemplate={setTemplate}
      />
      
      <QRAdvancedColorOptions
        eyeColor={eyeColor}
        setEyeColor={setEyeColor}
        patternColor={patternColor}
        setPatternColor={setPatternColor}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        eyeRadius={eyeRadius}
        setEyeRadius={setEyeRadius}
        // Gradient props
        useGradient={useGradient}
        setUseGradient={setUseGradient}
        gradientType={gradientType}
        setGradientType={setGradientType}
        gradientDirection={gradientDirection}
        setGradientDirection={setGradientDirection}
        gradientStartColor={gradientStartColor}
        setGradientStartColor={setGradientStartColor}
        gradientEndColor={gradientEndColor}
        setGradientEndColor={setGradientEndColor}
        gradientTarget={gradientTarget}
        setGradientTarget={setGradientTarget}
        // Transparency props
        backgroundTransparent={backgroundTransparent}
        setBackgroundTransparent={setBackgroundTransparent}
        foregroundTransparent={foregroundTransparent}
        setForegroundTransparent={setForegroundTransparent}
        backgroundOpacity={backgroundOpacity}
        setBackgroundOpacity={setBackgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        setForegroundOpacity={setForegroundOpacity}
      />
    </div>
  );
}
