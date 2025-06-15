
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface QRAdvancedColorOptionsProps {
  eyeColor: string;
  setEyeColor: (color: string) => void;
  patternColor: string;
  setPatternColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
}

export function QRAdvancedColorOptions({ 
  eyeColor, 
  setEyeColor, 
  patternColor, 
  setPatternColor,
  backgroundColor,
  setBackgroundColor
}: QRAdvancedColorOptionsProps) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Advanced Colors</Label>
      
      <div className="grid grid-cols-1 gap-4">
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
            />
            <Input
              type="text"
              value={patternColor}
              onChange={(e) => setPatternColor(e.target.value)}
              className="flex-1"
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
            />
            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
