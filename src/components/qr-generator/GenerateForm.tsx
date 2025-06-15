
import { Button } from "@/components/ui/button";
import { QrCode, Scan } from "lucide-react";
import { QRNameInput } from "@/components/qr-generator/QRNameInput";
import { QRStyleOptions } from "@/components/qr-generator/QRStyleOptions";
import QRTabSelector from "@/components/qr-generator/QRTabSelector";
import { QRFrameSelector } from "@/components/qr-generator/QRFrameSelector";
import { QRShapeSelector } from "@/components/qr-generator/QRShapeSelector";
import { EnhancedLogoOptions } from "@/components/qr-generator/EnhancedLogoOptions";
import { QRContentTabs } from "@/components/qr-generator/QRContentTabs";
import useQrGenerator from "@/hooks/use-qr-generator";

interface GenerateFormProps {
  qrGenerator: ReturnType<typeof useQrGenerator>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGenerate: () => void;
  onScanClick: () => void;
  editId: string | null;
  getCurrentQRData: () => any;
  // ... keep existing code (all form state props)
  text: string;
  setText: (text: string) => void;
  ssid: string;
  setSsid: (ssid: string) => void;
  password: string;
  setPassword: (password: string) => void;
  encryption: string;
  setEncryption: (encryption: string) => void;
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  organization: string;
  setOrganization: (org: string) => void;
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
  smsPhone: string;
  setSmsPhone: (phone: string) => void;
  smsMessage: string;
  setSmsMessage: (message: string) => void;
  emailTo: string;
  setEmailTo: (email: string) => void;
  emailSubject: string;
  setEmailSubject: (subject: string) => void;
  emailBody: string;
  setEmailBody: (body: string) => void;
  twitterText: string;
  setTwitterText: (text: string) => void;
  twitterShareUrl: string;
  setTwitterShareUrl: (url: string) => void;
  twitterHashtags: string;
  setTwitterHashtags: (hashtags: string) => void;
  bitcoinAddress: string;
  setBitcoinAddress: (address: string) => void;
  bitcoinAmount: string;
  setBitcoinAmount: (amount: string) => void;
  bitcoinLabel: string;
  setBitcoinLabel: (label: string) => void;
  bitcoinMessage: string;
  setBitcoinMessage: (message: string) => void;
}

export function GenerateForm({
  qrGenerator,
  activeTab,
  setActiveTab,
  onGenerate,
  onScanClick,
  editId,
  getCurrentQRData,
  ...formProps
}: GenerateFormProps) {
  return (
    <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          QR Generator
        </h1>
        <Button variant="outline" size="sm" onClick={onScanClick} className="gap-2">
          <Scan className="h-4 w-4" />
          Scan QR
        </Button>
      </div>
      
      <QRNameInput name={qrGenerator.name} setName={qrGenerator.setName} />
      
      <QRTabSelector 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        qrData={getCurrentQRData()}
      >
        <QRContentTabs {...formProps} />
      </QRTabSelector>
      
      <QRStyleOptions
        darkColor={qrGenerator.darkColor}
        setDarkColor={qrGenerator.setDarkColor}
        lightColor={qrGenerator.lightColor}
        setLightColor={qrGenerator.setLightColor}
        logo={qrGenerator.logo}
        setLogo={qrGenerator.setLogo}
        addLogo={qrGenerator.addLogo}
        setAddLogo={qrGenerator.setAddLogo}
      />
      
      <QRShapeSelector
        shape={qrGenerator.shape}
        setShape={qrGenerator.setShape}
      />
      
      <EnhancedLogoOptions
        logo={qrGenerator.logo}
        setLogo={qrGenerator.setLogo}
        addLogo={qrGenerator.addLogo}
        setAddLogo={qrGenerator.setAddLogo}
        logoStyle={qrGenerator.logoStyle}
        setLogoStyle={qrGenerator.setLogoStyle}
        logoSize={qrGenerator.logoSize}
        setLogoSize={qrGenerator.setLogoSize}
        preserveAspectRatio={qrGenerator.preserveAspectRatio}
        setPreserveAspectRatio={qrGenerator.setPreserveAspectRatio}
      />
      
      <QRFrameSelector
        frameStyle={qrGenerator.frameStyle}
        setFrameStyle={qrGenerator.setFrameStyle}
      />

      <Button 
        className="w-full h-12 text-lg font-semibold"
        onClick={onGenerate}
        disabled={qrGenerator.isGenerating}
      >
        <QrCode className="mr-2 h-5 w-5" />
        {qrGenerator.isGenerating ? "Generating..." : (editId ? "Update QR Code" : "Generate QR Code")}
      </Button>
    </div>
  );
}
