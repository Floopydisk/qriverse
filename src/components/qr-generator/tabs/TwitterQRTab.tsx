
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TwitterQRTabProps {
  twitterText: string;
  setTwitterText: (text: string) => void;
  twitterShareUrl: string;
  setTwitterShareUrl: (url: string) => void;
  twitterHashtags: string;
  setTwitterHashtags: (hashtags: string) => void;
}

export function TwitterQRTab({
  twitterText,
  setTwitterText,
  twitterShareUrl,
  setTwitterShareUrl,
  twitterHashtags,
  setTwitterHashtags
}: TwitterQRTabProps) {
  return (
    <div className="space-y-4 mt-0">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="twitterText">Tweet Text</Label>
          <Textarea
            id="twitterText"
            value={twitterText}
            onChange={(e) => setTwitterText(e.target.value)}
            placeholder="Enter your tweet text"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitterShareUrl">URL (optional)</Label>
          <Input
            id="twitterShareUrl"
            value={twitterShareUrl}
            onChange={(e) => setTwitterShareUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitterHashtags">Hashtags (separate with spaces)</Label>
          <Input
            id="twitterHashtags"
            value={twitterHashtags}
            onChange={(e) => setTwitterHashtags(e.target.value)}
            placeholder="#qrcode #twitter"
          />
        </div>
      </div>
    </div>
  );
}
