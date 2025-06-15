
import { Label } from "@/components/ui/label";

const FRAME_OPTIONS = [
  { key: "none", name: "None" },
  { key: "rounded", name: "Rounded Corners" },
  { key: "circle", name: "Circle" },
  { key: "border", name: "Border" },
  // Add more as needed
];

interface QRFrameSelectorProps {
  frameStyle: string;
  setFrameStyle: (style: string) => void;
}

export function QRFrameSelector({ frameStyle, setFrameStyle }: QRFrameSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>QR Frame</Label>
      <div className="flex items-center gap-4">
        {FRAME_OPTIONS.map(option => (
          <button
            key={option.key}
            onClick={() => setFrameStyle(option.key)}
            className={`relative h-12 w-12 flex items-center justify-center border rounded transition focus:ring-2
              ${frameStyle === option.key ? "border-green-500 ring-2 ring-green-400" : "border-gray-300"}
              bg-muted hover:bg-accent`}
            aria-label={option.name}
            type="button"
          >
            {option.key === "none" && <span className="block w-7 h-7 bg-gray-300 rounded-sm" />}
            {option.key === "rounded" && <span className="block w-7 h-7 bg-gray-300 rounded-lg" />}
            {option.key === "circle" && <span className="block w-7 h-7 bg-gray-300 rounded-full" />}
            {option.key === "border" && (
              <span className="block w-7 h-7 rounded-sm border-4 border-green-500 bg-gray-300" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
