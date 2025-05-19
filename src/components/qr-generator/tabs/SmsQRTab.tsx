
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SmsQRTabProps {
  smsPhone: string;
  setSmsPhone: (phone: string) => void;
  smsMessage: string;
  setSmsMessage: (message: string) => void;
}

export function SmsQRTab({
  smsPhone,
  setSmsPhone,
  smsMessage,
  setSmsMessage
}: SmsQRTabProps) {
  return (
    <div className="space-y-4 mt-0">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="smsPhone">Phone Number</Label>
          <Input
            id="smsPhone"
            value={smsPhone}
            onChange={(e) => setSmsPhone(e.target.value)}
            placeholder="+1 234 567 8900"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="smsMessage">Message</Label>
          <Textarea
            id="smsMessage"
            value={smsMessage}
            onChange={(e) => setSmsMessage(e.target.value)}
            placeholder="Enter your message here"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
