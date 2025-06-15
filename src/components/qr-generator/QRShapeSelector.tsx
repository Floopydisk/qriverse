
import { Label } from "@/components/ui/label";

const SHAPE_OPTIONS = [
  { key: "square", name: "Square", icon: "⬜" },
  { key: "circle", name: "Circle", icon: "⭕" },
  { key: "rounded", name: "Rounded", icon: "▢" },
  { key: "hexagon", name: "Hexagon", icon: "⬡" },
  { key: "diamond", name: "Diamond", icon: "◇" },
];

interface QRShapeSelectorProps {
  shape: string;
  setShape: (shape: string) => void;
}

export function QRShapeSelector({ shape, setShape }: QRShapeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>QR Code Shape</Label>
      <div className="grid grid-cols-5 gap-2">
        {SHAPE_OPTIONS.map(option => (
          <button
            key={option.key}
            onClick={() => setShape(option.key)}
            className={`relative h-12 w-full flex flex-col items-center justify-center border rounded transition focus:ring-2 text-xs
              ${shape === option.key ? "border-green-500 ring-2 ring-green-400 bg-green-50" : "border-gray-300"}
              bg-muted hover:bg-accent`}
            aria-label={option.name}
            type="button"
          >
            <span className="text-lg">{option.icon}</span>
            <span className="text-xs mt-1">{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
