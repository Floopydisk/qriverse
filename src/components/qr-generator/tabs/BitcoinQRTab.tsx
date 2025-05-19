
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BitcoinQRTabProps {
  bitcoinAddress: string;
  setBitcoinAddress: (address: string) => void;
  bitcoinAmount: string;
  setBitcoinAmount: (amount: string) => void;
  bitcoinLabel: string;
  setBitcoinLabel: (label: string) => void;
  bitcoinMessage: string;
  setBitcoinMessage: (message: string) => void;
}

export function BitcoinQRTab({
  bitcoinAddress,
  setBitcoinAddress,
  bitcoinAmount,
  setBitcoinAmount,
  bitcoinLabel,
  setBitcoinLabel,
  bitcoinMessage,
  setBitcoinMessage
}: BitcoinQRTabProps) {
  return (
    <div className="space-y-4 mt-0">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bitcoinAddress">Bitcoin Address</Label>
          <Input
            id="bitcoinAddress"
            value={bitcoinAddress}
            onChange={(e) => setBitcoinAddress(e.target.value)}
            placeholder="Enter Bitcoin address"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bitcoinAmount">Amount (BTC)</Label>
          <Input
            id="bitcoinAmount"
            type="number"
            step="0.00000001"
            value={bitcoinAmount}
            onChange={(e) => setBitcoinAmount(e.target.value)}
            placeholder="0.001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bitcoinLabel">Label (optional)</Label>
          <Input
            id="bitcoinLabel"
            value={bitcoinLabel}
            onChange={(e) => setBitcoinLabel(e.target.value)}
            placeholder="Payment for services"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bitcoinMessage">Message (optional)</Label>
          <Textarea
            id="bitcoinMessage"
            value={bitcoinMessage}
            onChange={(e) => setBitcoinMessage(e.target.value)}
            placeholder="Thank you for your payment"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}
