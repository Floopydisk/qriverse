
import { useToast } from "@/hooks/use-toast";
import useQrGenerator from "@/hooks/use-qr-generator";

export function useQRGenerationLogic(
  qrGenerator: ReturnType<typeof useQrGenerator>,
  formData: {
    text: string;
    ssid: string;
    password: string;
    encryption: string;
    hidden: boolean;
    fullName: string;
    email: string;
    phone: string;
    organization: string;
    title: string;
    website: string;
    facebookUrl: string;
    linkedinUrl: string;
    instagramUrl: string;
    twitterUrl: string;
    youtubeUrl: string;
    smsPhone: string;
    smsMessage: string;
    emailTo: string;
    emailSubject: string;
    emailBody: string;
    twitterText: string;
    twitterShareUrl: string;
    twitterHashtags: string;
    bitcoinAddress: string;
    bitcoinAmount: string;
    bitcoinLabel: string;
    bitcoinMessage: string;
  }
) {
  const { toast } = useToast();

  const generateTextQR = async () => {
    const result = await qrGenerator.validateAndGenerate(
      formData.text,
      "Please enter some text to generate a QR code"
    );
    
    if (result) {
      qrGenerator.saveQRCodeToDatabase(result.dataUrl, result.content, result.type);
    }
  };

  const generateWifiQR = async () => {
    if (!formData.ssid) {
      toast({
        title: "Error",
        description: "Please enter the network name (SSID)",
        variant: "destructive",
      });
      return;
    }

    try {
      const wifiString = `WIFI:T:${formData.encryption};S:${formData.ssid};P:${formData.password};H:${
        formData.hidden ? "true" : "false"
      };;`;
      
      const result = await qrGenerator.validateAndGenerate(
        wifiString,
        "Please enter the network name (SSID)"
      );
      
      if (result) {
        qrGenerator.saveQRCodeToDatabase(result.dataUrl, result.content, "wifi");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const generateContactQR = async () => {
    if (!formData.fullName) {
      toast({
        title: "Error",
        description: "Please enter at least a name",
        variant: "destructive",
      });
      return;
    }

    try {
      const vCardLines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${formData.fullName}`,
        formData.email ? `EMAIL:${formData.email}` : "",
        formData.phone ? `TEL:${formData.phone}` : "",
        formData.organization ? `ORG:${formData.organization}` : "",
        formData.title ? `TITLE:${formData.title}` : "",
        formData.website ? `URL:${formData.website}` : "",
        formData.facebookUrl ? `X-SOCIALPROFILE;type=facebook:${formData.facebookUrl}` : "",
        formData.linkedinUrl ? `X-SOCIALPROFILE;type=linkedin:${formData.linkedinUrl}` : "",
        formData.instagramUrl ? `X-SOCIALPROFILE;type=instagram:${formData.instagramUrl}` : "",
        formData.twitterUrl ? `X-SOCIALPROFILE;type=twitter:${formData.twitterUrl}` : "",
        formData.youtubeUrl ? `X-SOCIALPROFILE;type=youtube:${formData.youtubeUrl}` : "",
        "END:VCARD"
      ].filter(Boolean).join("\n");
      
      const result = await qrGenerator.validateAndGenerate(
        vCardLines,
        "Please enter at least a name"
      );
      
      if (result) {
        qrGenerator.saveQRCodeToDatabase(result.dataUrl, result.content, "contact");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const generateSmsQR = async () => {
    if (!formData.smsPhone) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      const smsString = `SMSTO:${formData.smsPhone}:${formData.smsMessage}`;
      
      const result = await qrGenerator.validateAndGenerate(
        smsString,
        "Please enter a phone number"
      );
      
      if (result) {
        qrGenerator.saveQRCodeToDatabase(result.dataUrl, result.content, "sms");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const generateEmailQR = async () => {
    if (!formData.emailTo) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      let emailString = `MAILTO:${formData.emailTo}`;
      
      if (formData.emailSubject || formData.emailBody) {
        emailString += '?';
        if (formData.emailSubject) emailString += `subject=${encodeURIComponent(formData.emailSubject)}`;
        if (formData.emailSubject && formData.emailBody) emailString += '&';
        if (formData.emailBody) emailString += `body=${encodeURIComponent(formData.emailBody)}`;
      }
      
      const result = await qrGenerator.validateAndGenerate(
        emailString,
        "Please enter an email address"
      );
      
      if (result) {
        qrGenerator.saveQRCodeToDatabase(result.dataUrl, result.content, "email");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const generateTwitterQR = async () => {
    if (!formData.twitterText && !formData.twitterShareUrl && !formData.twitterHashtags) {
      toast({
        title: "Error",
        description: "Please enter at least one Twitter field",
        variant: "destructive",
      });
      return;
    }

    try {
      let twitterString = "https://twitter.com/intent/tweet?";
      
      if (formData.twitterText) twitterString += `text=${encodeURIComponent(formData.twitterText)}`;
      if (formData.twitterText && formData.twitterShareUrl) twitterString += '&';
      if (formData.twitterShareUrl) twitterString += `url=${encodeURIComponent(formData.twitterShareUrl)}`;
      if ((formData.twitterText || formData.twitterShareUrl) && formData.twitterHashtags) twitterString += '&';
      if (formData.twitterHashtags) twitterString += `hashtags=${encodeURIComponent(formData.twitterHashtags.replace(/#/g, '').replace(/\s+/g, ','))}`;
      
      const result = await qrGenerator.validateAndGenerate(
        twitterString,
        "Please enter at least one Twitter field"
      );
      
      if (result) {
        qrGenerator.saveQRCodeToDatabase(result.dataUrl, result.content, "twitter");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const generateBitcoinQR = async () => {
    if (!formData.bitcoinAddress) {
      toast({
        title: "Error",
        description: "Please enter a Bitcoin address",
        variant: "destructive",
      });
      return;
    }

    try {
      let bitcoinString = `bitcoin:${formData.bitcoinAddress}`;
      
      if (formData.bitcoinAmount || formData.bitcoinLabel || formData.bitcoinMessage) {
        bitcoinString += '?';
        if (formData.bitcoinAmount) bitcoinString += `amount=${formData.bitcoinAmount}`;
        if (formData.bitcoinAmount && (formData.bitcoinLabel || formData.bitcoinMessage)) bitcoinString += '&';
        if (formData.bitcoinLabel) bitcoinString += `label=${encodeURIComponent(formData.bitcoinLabel)}`;
        if ((formData.bitcoinAmount || formData.bitcoinLabel) && formData.bitcoinMessage) bitcoinString += '&';
        if (formData.bitcoinMessage) bitcoinString += `message=${encodeURIComponent(formData.bitcoinMessage)}`;
      }
      
      const result = await qrGenerator.validateAndGenerate(
        bitcoinString,
        "Please enter a Bitcoin address"
      );
      
      if (result) {
        qrGenerator.saveQRCodeToDatabase(result.dataUrl, result.content, "bitcoin");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = (activeTab: string) => {
    if (activeTab === "url" || activeTab === "text") {
      generateTextQR();
    } else if (activeTab === "wifi") {
      generateWifiQR();
    } else if (activeTab === "vcard") {
      generateContactQR();
    } else if (activeTab === "sms") {
      generateSmsQR();
    } else if (activeTab === "email") {
      generateEmailQR();
    } else if (activeTab === "twitter") {
      generateTwitterQR();
    } else if (activeTab === "bitcoin") {
      generateBitcoinQR();
    }
  };

  return {
    handleGenerate,
    generateTextQR,
    generateWifiQR,
    generateContactQR,
    generateSmsQR,
    generateEmailQR,
    generateTwitterQR,
    generateBitcoinQR
  };
}
