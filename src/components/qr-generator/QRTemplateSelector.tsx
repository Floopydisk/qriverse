
import { Label } from "@/components/ui/label";
import { Camera, Circle, Diamond, Hexagon, Square, SquareSlash } from "lucide-react";

const TEMPLATE_OPTIONS = [
  { key: "square", name: "Square", icon: <Square size={20} /> },
  { key: "circle", name: "Circle", icon: <Circle size={20} /> },
  { key: "rounded", name: "Rounded", icon: <SquareSlash size={20} /> },
  { key: "hexagon", name: "Hexagon", icon: <Hexagon size={20} /> },
  { key: "diamond", name: "Diamond", icon: <Diamond size={20} /> },
  { key: "scan-me", name: "Scan Me Frame", icon: <Camera size={20} /> },
];

interface QRTemplateSelectorProps {
  template: string;
  setTemplate: (template: string) => void;
}

export function QRTemplateSelector({ template, setTemplate }: QRTemplateSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Template</Label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {TEMPLATE_OPTIONS.map(option => (
          <button
            key={option.key}
            onClick={() => setTemplate(option.key)}
            className={`relative h-16 w-full flex flex-col items-center justify-center border rounded-lg transition focus:ring-2 text-xs
              ${template === option.key ? "border-green-500 ring-2 ring-green-400 bg-green-50" : "border-gray-300"}
              bg-muted hover:bg-accent`}
            aria-label={option.name}
            type="button"
          >
            <div className="text-lg">{option.icon}</div>
            <span className="text-xs mt-1 text-center px-1">{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
