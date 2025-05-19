
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WifiQRTabProps {
  ssid: string;
  setSsid: (ssid: string) => void;
  encryption: string;
  setEncryption: (encryption: string) => void;
  password: string;
  setPassword: (password: string) => void;
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}

export function WifiQRTab({
  ssid,
  setSsid,
  encryption,
  setEncryption,
  password,
  setPassword,
  hidden,
  setHidden
}: WifiQRTabProps) {
  return (
    <div className="space-y-4 mt-0">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ssid">Network Name (SSID)</Label>
          <Input
            id="ssid"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
            placeholder="Enter network name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="encryption">Security Type</Label>
          <Select value={encryption} onValueChange={setEncryption}>
            <SelectTrigger>
              <SelectValue placeholder="Select security type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WPA">WPA/WPA2</SelectItem>
              <SelectItem value="WEP">WEP</SelectItem>
              <SelectItem value="nopass">No Password</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {encryption !== "nopass" && (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter network password"
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hidden"
            checked={hidden}
            onCheckedChange={(checked) => setHidden(checked as boolean)}
          />
          <Label htmlFor="hidden">Hidden network</Label>
        </div>
      </div>
    </div>
  );
}
