
import { Label } from "@/components/ui/label";
import { Square, Circle, Diamond, Hexagon, Star, Triangle } from "lucide-react";

const PATTERN_OPTIONS = [
  { key: "square", name: "Square", icon: <Square size={16} /> },
  { key: "circle", name: "Circle", icon: <Circle size={16} /> },
  { key: "rounded", name: "Rounded", icon: <Square size={16} /> },
  { key: "diamond", name: "Diamond", icon: <Diamond size={16} /> },
  { key: "hexagon", name: "Hexagon", icon: <Hexagon size={16} /> },
  { key: "star", name: "Star", icon: <Star size={16} /> },
];

interface QRPatternSelectorProps {
  pattern: string;
  setPattern: (pattern: string) => void;
}

export function QRPatternSelector({ pattern, setPattern }: QRPatternSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>QR Pattern</Label>
      <div className="grid grid-cols-3 gap-2">
        {PATTERN_OPTIONS.map(option => (
          <button
            key={option.key}
            onClick={() => setPattern(option.key)}
            className={`relative h-12 w-full flex flex-col items-center justify-center border rounded-lg transition focus:ring-2 text-xs
              ${pattern === option.key ? "border-green-500 ring-2 ring-green-400 bg-green-50" : "border-gray-300"}
              bg-muted hover:bg-accent`}
            aria-label={option.name}
            type="button"
          >
            <div className="flex items-center gap-1">
              {option.icon}
              <span className="text-xs">{option.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
