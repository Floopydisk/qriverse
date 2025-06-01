
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TextQRTabProps {
  text: string;
  setText: (text: string) => void;
  isUrl?: boolean;
}

export function TextQRTab({ text, setText, isUrl = false }: TextQRTabProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="qrContent" className="text-sm font-medium">
          {isUrl ? "Website URL" : "Text Content"}
        </Label>
        {isUrl ? (
          <Input
            id="qrContent"
            type="url"
            placeholder="https://example.com"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full"
          />
        ) : (
          <Textarea
            id="qrContent"
            placeholder="Enter your text content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[100px] resize-none"
          />
        )}
        <p className="text-xs text-muted-foreground">
          {isUrl ? "Enter a valid website URL" : "Enter any text you want to encode in the QR code"}
        </p>
      </div>
    </div>
  );
}
