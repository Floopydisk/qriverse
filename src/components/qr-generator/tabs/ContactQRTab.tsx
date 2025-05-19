
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Facebook, Linkedin, Instagram, Twitter, Youtube } from "lucide-react";

interface ContactQRTabProps {
  fullName: string;
  setFullName: (fullName: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string; 
  setPhone: (phone: string) => void;
  organization: string;
  setOrganization: (organization: string) => void;
  title: string;
  setTitle: (title: string) => void;
  website: string;
  setWebsite: (website: string) => void;
  facebookUrl: string;
  setFacebookUrl: (url: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (url: string) => void;
  instagramUrl: string;
  setInstagramUrl: (url: string) => void;
  twitterUrl: string;
  setTwitterUrl: (url: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
}

export function ContactQRTab({
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  organization,
  setOrganization,
  title,
  setTitle,
  website,
  setWebsite,
  facebookUrl,
  setFacebookUrl,
  linkedinUrl,
  setLinkedinUrl,
  instagramUrl,
  setInstagramUrl,
  twitterUrl,
  setTwitterUrl,
  youtubeUrl,
  setYoutubeUrl
}: ContactQRTabProps) {
  return (
    <div className="space-y-4 mt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 234 567 8900"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Company Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Software Engineer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        
        {/* Social Media Fields */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-medium mb-2">Social Media Links</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="facebookUrl" className="flex items-center gap-1">
            <Facebook className="h-4 w-4" /> Facebook
          </Label>
          <Input
            id="facebookUrl"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            placeholder="https://facebook.com/username"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl" className="flex items-center gap-1">
            <Linkedin className="h-4 w-4" /> LinkedIn
          </Label>
          <Input
            id="linkedinUrl"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/username"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="instagramUrl" className="flex items-center gap-1">
            <Instagram className="h-4 w-4" /> Instagram
          </Label>
          <Input
            id="instagramUrl"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/username"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="twitterUrl" className="flex items-center gap-1">
            <Twitter className="h-4 w-4" /> Twitter
          </Label>
          <Input
            id="twitterUrl"
            value={twitterUrl}
            onChange={(e) => setTwitterUrl(e.target.value)}
            placeholder="https://twitter.com/username"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="youtubeUrl" className="flex items-center gap-1">
            <Youtube className="h-4 w-4" /> YouTube
          </Label>
          <Input
            id="youtubeUrl"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/c/channel"
          />
        </div>
      </div>
    </div>
  );
}
