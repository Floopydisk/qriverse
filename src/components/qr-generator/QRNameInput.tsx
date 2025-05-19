
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface QRNameInputProps {
  name: string;
  setName: (name: string) => void;
}

export function QRNameInput({ name, setName }: QRNameInputProps) {
  return (
    <div className="relative">
      <Label htmlFor="qrName">QR Code Name</Label>
      <Input
        id="qrName"
        type="text"
        placeholder="Enter a name for your QR code"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-1"
      />
    </div>
  );
}
