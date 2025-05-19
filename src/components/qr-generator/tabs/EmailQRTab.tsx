
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EmailQRTabProps {
  emailTo: string;
  setEmailTo: (email: string) => void;
  emailSubject: string;
  setEmailSubject: (subject: string) => void;
  emailBody: string;
  setEmailBody: (body: string) => void;
}

export function EmailQRTab({
  emailTo,
  setEmailTo,
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody
}: EmailQRTabProps) {
  return (
    <div className="space-y-4 mt-0">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="emailTo">Email Address</Label>
          <Input
            id="emailTo"
            type="email"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="recipient@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emailSubject">Subject</Label>
          <Input
            id="emailSubject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Email subject"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emailBody">Message</Label>
          <Textarea
            id="emailBody"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder="Enter your message here"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
