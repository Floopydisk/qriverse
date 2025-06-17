
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface QRAdvancedColorOptionsProps {
  eyeColor: string;
  setEyeColor: (color: string) => void;
  patternColor: string;
  setPatternColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  eyeRadius?: number;
  setEyeRadius?: (radius: number) => void;
  // Gradient options
  useGradient?: boolean;
  setUseGradient?: (use: boolean) => void;
  gradientType?: 'linear' | 'radial';
  setGradientType?: (type: 'linear' | 'radial') => void;
  gradientDirection?: string;
  setGradientDirection?: (direction: string) => void;
  gradientStartColor?: string;
  setGradientStartColor?: (color: string) => void;
  gradientEndColor?: string;
  setGradientEndColor?: (color: string) => void;
  gradientTarget?: 'foreground' | 'background';
  setGradientTarget?: (target: 'foreground' | 'background') => void;
  // Transparency options
  backgroundTransparent?: boolean;
  setBackgroundTransparent?: (transparent: boolean) => void;
  foregroundTransparent?: boolean;
  setForegroundTransparent?: (transparent: boolean) => void;
  backgroundOpacity?: number;
  setBackgroundOpacity?: (opacity: number) => void;
  foregroundOpacity?: number;
  setForegroundOpacity?: (opacity: number) => void;
}

export function QRAdvancedColorOptions({ 
  eyeColor, 
  setEyeColor, 
  patternColor, 
  setPatternColor,
  backgroundColor,
  setBackgroundColor,
  eyeRadius = 0,
  setEyeRadius,
  // Gradient props
  useGradient = false,
  setUseGradient,
  gradientType = 'linear',
  setGradientType,
  gradientDirection = '0deg',
  setGradientDirection,
  gradientStartColor = '#000000',
  setGradientStartColor,
  gradientEndColor = '#666666',
  setGradientEndColor,
  gradientTarget = 'foreground',
  setGradientTarget,
  // Transparency props
  backgroundTransparent = false,
  setBackgroundTransparent,
  foregroundTransparent = false,
  setForegroundTransparent,
  backgroundOpacity = 100,
  setBackgroundOpacity,
  foregroundOpacity = 100,
  setForegroundOpacity
}: QRAdvancedColorOptionsProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="advanced-colors">
        <AccordionTrigger className="text-base font-semibold">
          Advanced Colors
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6 pt-2">
            {/* Basic Colors */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Basic Colors</h4>
              
              <div className="space-y-2">
                <Label htmlFor="eyeColor">Eye Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="eyeColor"
                    value={eyeColor}
                    onChange={(e) => setEyeColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={eyeColor}
                    onChange={(e) => setEyeColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patternColor">Pattern Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="patternColor"
                    value={patternColor}
                    onChange={(e) => setPatternColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                    disabled={useGradient && gradientTarget === 'foreground'}
                  />
                  <Input
                    type="text"
                    value={patternColor}
                    onChange={(e) => setPatternColor(e.target.value)}
                    className="flex-1"
                    disabled={useGradient && gradientTarget === 'foreground'}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="backgroundColor"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                    disabled={useGradient && gradientTarget === 'background'}
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1"
                    disabled={useGradient && gradientTarget === 'background'}
                  />
                </div>
              </div>

              {setEyeRadius && (
                <div className="space-y-2">
                  <Label htmlFor="eyeRadius">Eye Radius: {eyeRadius}</Label>
                  <Slider
                    id="eyeRadius"
                    min={0}
                    max={50}
                    step={1}
                    value={[eyeRadius]}
                    onValueChange={(value) => setEyeRadius(value[0])}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Gradient Options */}
            {setUseGradient && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="useGradient" className="text-sm font-medium">Enable Gradient</Label>
                  <Switch
                    id="useGradient"
                    checked={useGradient}
                    onCheckedChange={setUseGradient}
                  />
                </div>

                {useGradient && (
                  <div className="space-y-4 ml-4">
                    <div className="space-y-2">
                      <Label>Apply Gradient To</Label>
                      <Select value={gradientTarget} onValueChange={setGradientTarget}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="foreground">QR Code Pattern</SelectItem>
                          <SelectItem value="background">Background</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Gradient Type</Label>
                      <Select value={gradientType} onValueChange={setGradientType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear">Linear</SelectItem>
                          <SelectItem value="radial">Radial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {gradientType === 'linear' && setGradientDirection && (
                      <div className="space-y-2">
                        <Label>Direction</Label>
                        <Select value={gradientDirection} onValueChange={setGradientDirection}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0deg">Top to Bottom</SelectItem>
                            <SelectItem value="90deg">Left to Right</SelectItem>
                            <SelectItem value="180deg">Bottom to Top</SelectItem>
                            <SelectItem value="270deg">Right to Left</SelectItem>
                            <SelectItem value="45deg">Diagonal ↗</SelectItem>
                            <SelectItem value="135deg">Diagonal ↘</SelectItem>
                            <SelectItem value="225deg">Diagonal ↙</SelectItem>
                            <SelectItem value="315deg">Diagonal ↖</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Start Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={gradientStartColor}
                          onChange={(e) => setGradientStartColor?.(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={gradientStartColor}
                          onChange={(e) => setGradientStartColor?.(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>End Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={gradientEndColor}
                          onChange={(e) => setGradientEndColor?.(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={gradientEndColor}
                          onChange={(e) => setGradientEndColor?.(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transparency Options */}
            {setBackgroundTransparent && setForegroundTransparent && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground">Transparency</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="backgroundTransparent" className="text-sm">Transparent Background</Label>
                    <Switch
                      id="backgroundTransparent"
                      checked={backgroundTransparent}
                      onCheckedChange={setBackgroundTransparent}
                    />
                  </div>

                  {!backgroundTransparent && setBackgroundOpacity && (
                    <div className="space-y-2 ml-4">
                      <Label>Background Opacity: {backgroundOpacity}%</Label>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[backgroundOpacity]}
                        onValueChange={(value) => setBackgroundOpacity(value[0])}
                        className="w-full"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="foregroundTransparent" className="text-sm">Transparent QR Code</Label>
                    <Switch
                      id="foregroundTransparent"
                      checked={foregroundTransparent}
                      onCheckedChange={setForegroundTransparent}
                    />
                  </div>

                  {!foregroundTransparent && setForegroundOpacity && (
                    <div className="space-y-2 ml-4">
                      <Label>QR Code Opacity: {foregroundOpacity}%</Label>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[foregroundOpacity]}
                        onValueChange={(value) => setForegroundOpacity(value[0])}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
