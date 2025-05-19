
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TextQRTabProps {
  text: string;
  setText: (text: string) => void;
}

export function TextQRTab({ text, setText }: TextQRTabProps) {
  return (
    <div className="space-y-4 mt-0">
      <div className="relative">
        <Label htmlFor="qrContent">Content</Label>
        <Input
          id="qrContent"
          type="text"
          placeholder="Enter text or URL"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  );
}
