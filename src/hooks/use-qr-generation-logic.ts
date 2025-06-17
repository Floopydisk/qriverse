
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
    if (!formData.text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate a QR code",
        variant: "destructive",
      });
      return;
    }

    await qrGenerator.generatePreview(formData.text);
    const result = await qrGenerator.saveQRCode(formData.text, "text");
    
    if (result) {
      toast({
        title: "Success",
        description: "QR code generated successfully",
      });
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
      
      await qrGenerator.generatePreview(wifiString);
      const result = await qrGenerator.saveQRCode(wifiString, "wifi");
      
      if (result) {
        toast({
          title: "Success",
          description: "WiFi QR code generated successfully",
        });
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
      
      await qrGenerator.generatePreview(vCardLines);
      const result = await qrGenerator.saveQRCode(vCardLines, "contact");
      
      if (result) {
        toast({
          title: "Success",
          description: "Contact QR code generated successfully",
        });
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
      
      await qrGenerator.generatePreview(smsString);
      const result = await qrGenerator.saveQRCode(smsString, "sms");
      
      if (result) {
        toast({
          title: "Success",
          description: "SMS QR code generated successfully",
        });
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
      
      await qrGenerator.generatePreview(emailString);
      const result = await qrGenerator.saveQRCode(emailString, "email");
      
      if (result) {
        toast({
          title: "Success",
          description: "Email QR code generated successfully",
        });
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
      
      await qrGenerator.generatePreview(twitterString);
      const result = await qrGenerator.saveQRCode(twitterString, "twitter");
      
      if (result) {
        toast({
          title: "Success",
          description: "Twitter QR code generated successfully",
        });
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
      
      await qrGenerator.generatePreview(bitcoinString);
      const result = await qrGenerator.saveQRCode(bitcoinString, "bitcoin");
      
      if (result) {
        toast({
          title: "Success",
          description: "Bitcoin QR code generated successfully",
        });
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
