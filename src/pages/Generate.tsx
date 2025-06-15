import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Button } from "@/components/ui/button";
import { Scan, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { fetchQRCode } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

// Import TabsContent from UI tabs component
import { TabsContent } from "@/components/ui/tabs";

// Import QR Generator Components
import { QRNameInput } from "@/components/qr-generator/QRNameInput";
import { QRStyleOptions } from "@/components/qr-generator/QRStyleOptions";
import QRTabSelector from "@/components/qr-generator/QRTabSelector";
import { QRCodePreview } from "@/components/qr-generator/QRCodePreview";
import { TextQRTab } from "@/components/qr-generator/tabs/TextQRTab";
import { WifiQRTab } from "@/components/qr-generator/tabs/WifiQRTab";
import { ContactQRTab } from "@/components/qr-generator/tabs/ContactQRTab";
import { SmsQRTab } from "@/components/qr-generator/tabs/SmsQRTab";
import { EmailQRTab } from "@/components/qr-generator/tabs/EmailQRTab";
import { TwitterQRTab } from "@/components/qr-generator/tabs/TwitterQRTab";
import { BitcoinQRTab } from "@/components/qr-generator/tabs/BitcoinQRTab";
import { QRFrameSelector } from "@/components/qr-generator/QRFrameSelector";

import useQrGenerator from "@/hooks/use-qr-generator";

const Generate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { user } = useAuth();
  const { toast } = useToast();

  // QR Generator hook
  const qrGenerator = useQrGenerator();
  
  // Text/URL
  const [text, setText] = useState("");
  
  // Wifi
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  
  // Contact
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [title, setTitle] = useState("");
  const [website, setWebsite] = useState("");
  
  // Contact - Social Media Links
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  
  // SMS
  const [smsPhone, setSmsPhone] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  
  // Email
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  
  // Twitter
  const [twitterText, setTwitterText] = useState("");
  const [twitterShareUrl, setTwitterShareUrl] = useState("");
  const [twitterHashtags, setTwitterHashtags] = useState("");
  
  // Bitcoin
  const [bitcoinAddress, setBitcoinAddress] = useState("");
  const [bitcoinAmount, setBitcoinAmount] = useState("");
  const [bitcoinLabel, setBitcoinLabel] = useState("");
  const [bitcoinMessage, setBitcoinMessage] = useState("");

  const [activeTab, setActiveTab] = useState("url");
  
  const { data: qrCodeData, isLoading: isLoadingQrCode } = useQuery({
    queryKey: ['qrCode', editId],
    queryFn: () => editId ? fetchQRCode(editId) : null,
    enabled: !!editId
  });

  // Set edit ID when in edit mode
  useEffect(() => {
    if (editId) {
      qrGenerator.setEditId(editId);
    }
  }, [editId, qrGenerator]);

  // Load QR code data for editing
  useEffect(() => {
    if (qrCodeData) {
      qrGenerator.setName(qrCodeData.name || "");
      if (qrCodeData.options && typeof qrCodeData.options === 'object') {
        const options = qrCodeData.options as Record<string, any>;
        qrGenerator.setQrDataUrl(options.dataUrl || "");
        qrGenerator.setDarkColor(options.darkColor || "#10B981");
        qrGenerator.setLightColor(options.lightColor || "#FFFFFF");
        qrGenerator.setAddLogo(options.hasLogo || false);
        qrGenerator.setFrameStyle(options.frameStyle || "none");
      }

      if (qrCodeData.type === "url" || qrCodeData.type === "text") {
        setActiveTab(qrCodeData.type);
        setText(qrCodeData.content || "");
      } else if (qrCodeData.type === "wifi") {
        setActiveTab("wifi");
        try {
          const wifiString = qrCodeData.content;
          const ssidMatch = wifiString.match(/S:(.*?);/);
          const passwordMatch = wifiString.match(/P:(.*?);/);
          const encryptionMatch = wifiString.match(/T:(.*?);/);
          const hiddenMatch = wifiString.match(/H:(.*?);/);
          
          if (ssidMatch) setSsid(ssidMatch[1]);
          if (passwordMatch) setPassword(passwordMatch[1]);
          if (encryptionMatch) setEncryption(encryptionMatch[1]);
          if (hiddenMatch) setHidden(hiddenMatch[1] === "true");
        } catch (err) {
          console.error("Failed to parse WiFi QR code:", err);
        }
      } else if (qrCodeData.type === "contact") {
        setActiveTab("vcard");
        try {
          const vCardString = qrCodeData.content;
          const fnMatch = vCardString.match(/FN:(.*?)(?:\r?\n|$)/);
          const emailMatch = vCardString.match(/EMAIL:(.*?)(?:\r?\n|$)/);
          const telMatch = vCardString.match(/TEL:(.*?)(?:\r?\n|$)/);
          const orgMatch = vCardString.match(/ORG:(.*?)(?:\r?\n|$)/);
          const titleMatch = vCardString.match(/TITLE:(.*?)(?:\r?\n|$)/);
          const urlMatch = vCardString.match(/URL:(.*?)(?:\r?\n|$)/);
          
          const fbMatch = vCardString.match(/X-SOCIALPROFILE;type=facebook:(.*?)(?:\r?\n|$)/);
          const liMatch = vCardString.match(/X-SOCIALPROFILE;type=linkedin:(.*?)(?:\r?\n|$)/);
          const igMatch = vCardString.match(/X-SOCIALPROFILE;type=instagram:(.*?)(?:\r?\n|$)/);
          const twMatch = vCardString.match(/X-SOCIALPROFILE;type=twitter:(.*?)(?:\r?\n|$)/);
          const ytMatch = vCardString.match(/X-SOCIALPROFILE;type=youtube:(.*?)(?:\r?\n|$)/);
          
          if (fnMatch) setFullName(fnMatch[1]);
          if (emailMatch) setEmail(emailMatch[1]);
          if (telMatch) setPhone(telMatch[1]);
          if (orgMatch) setOrganization(orgMatch[1]);
          if (titleMatch) setTitle(titleMatch[1]);
          if (urlMatch) setWebsite(urlMatch[1]);
          
          if (fbMatch) setFacebookUrl(fbMatch[1]);
          if (liMatch) setLinkedinUrl(liMatch[1]);
          if (igMatch) setInstagramUrl(igMatch[1]);
          if (twMatch) setTwitterUrl(twMatch[1]);
          if (ytMatch) setYoutubeUrl(ytMatch[1]);
          
        } catch (err) {
          console.error("Failed to parse contact QR code:", err);
        }
      } else if (qrCodeData.type === "sms") {
        setActiveTab("sms");
        try {
          const smsString = qrCodeData.content;
          const phoneMatch = smsString.match(/SMSTO:(.*?):/);
          const messageMatch = smsString.match(/SMSTO:.*?:(.*)/);
          
          if (phoneMatch) setSmsPhone(phoneMatch[1]);
          if (messageMatch) setSmsMessage(messageMatch[1]);
        } catch (err) {
          console.error("Failed to parse SMS QR code:", err);
        }
      } else if (qrCodeData.type === "email") {
        setActiveTab("email");
        try {
          const emailString = qrCodeData.content;
          const toMatch = emailString.match(/MAILTO:(.*?)(?:\?|$)/);
          const subjectMatch = emailString.match(/[?&]subject=(.*?)(?:&|$)/);
          const bodyMatch = emailString.match(/[?&]body=(.*?)(?:&|$)/);
          
          if (toMatch) setEmailTo(toMatch[1]);
          if (subjectMatch) setEmailSubject(decodeURIComponent(subjectMatch[1]));
          if (bodyMatch) setEmailBody(decodeURIComponent(bodyMatch[1]));
        } catch (err) {
          console.error("Failed to parse email QR code:", err);
        }
      } else if (qrCodeData.type === "twitter") {
        setActiveTab("twitter");
        try {
          const twitterString = qrCodeData.content;
          const textMatch = twitterString.match(/[?&]text=(.*?)(?:&|$)/);
          const urlMatch = twitterString.match(/[?&]url=(.*?)(?:&|$)/);
          const hashtagsMatch = twitterString.match(/[?&]hashtags=(.*?)(?:&|$)/);
          
          if (textMatch) setTwitterText(decodeURIComponent(textMatch[1]));
          if (urlMatch) setTwitterShareUrl(decodeURIComponent(urlMatch[1]));
          if (hashtagsMatch) setTwitterHashtags(decodeURIComponent(hashtagsMatch[1]));
        } catch (err) {
          console.error("Failed to parse Twitter QR code:", err);
        }
      } else if (qrCodeData.type === "bitcoin") {
        setActiveTab("bitcoin");
        try {
          const bitcoinString = qrCodeData.content;
          const addressMatch = bitcoinString.match(/bitcoin:(.*?)(?:\?|$)/);
          const amountMatch = bitcoinString.match(/[?&]amount=(.*?)(?:&|$)/);
          const labelMatch = bitcoinString.match(/[?&]label=(.*?)(?:&|$)/);
          const messageMatch = bitcoinString.match(/[?&]message=(.*?)(?:&|$)/);
          
          if (addressMatch) setBitcoinAddress(addressMatch[1]);
          if (amountMatch) setBitcoinAmount(amountMatch[1]);
          if (labelMatch) setBitcoinLabel(decodeURIComponent(labelMatch[1]));
          if (messageMatch) setBitcoinMessage(decodeURIComponent(messageMatch[1]));
        } catch (err) {
          console.error("Failed to parse Bitcoin QR code:", err);
        }
      }
    }
  }, [qrCodeData, qrGenerator]);

  // Real-time preview generation
  useEffect(() => {
    const generateCurrentPreview = () => {
      let content = "";
      
      if (activeTab === "url" || activeTab === "text") {
        content = text;
      } else if (activeTab === "wifi") {
        if (ssid) {
          content = `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden ? "true" : "false"};;`;
        }
      } else if (activeTab === "vcard") {
        if (fullName) {
          const vCardLines = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${fullName}`,
            email ? `EMAIL:${email}` : "",
            phone ? `TEL:${phone}` : "",
            organization ? `ORG:${organization}` : "",
            title ? `TITLE:${title}` : "",
            website ? `URL:${website}` : "",
            facebookUrl ? `X-SOCIALPROFILE;type=facebook:${facebookUrl}` : "",
            linkedinUrl ? `X-SOCIALPROFILE;type=linkedin:${linkedinUrl}` : "",
            instagramUrl ? `X-SOCIALPROFILE;type=instagram:${instagramUrl}` : "",
            twitterUrl ? `X-SOCIALPROFILE;type=twitter:${twitterUrl}` : "",
            youtubeUrl ? `X-SOCIALPROFILE;type=youtube:${youtubeUrl}` : "",
            "END:VCARD"
          ].filter(Boolean).join("\n");
          content = vCardLines;
        }
      } else if (activeTab === "sms") {
        if (smsPhone) {
          content = `SMSTO:${smsPhone}:${smsMessage}`;
        }
      } else if (activeTab === "email") {
        if (emailTo) {
          let emailString = `MAILTO:${emailTo}`;
          if (emailSubject || emailBody) {
            emailString += '?';
            if (emailSubject) emailString += `subject=${encodeURIComponent(emailSubject)}`;
            if (emailSubject && emailBody) emailString += '&';
            if (emailBody) emailString += `body=${encodeURIComponent(emailBody)}`;
          }
          content = emailString;
        }
      } else if (activeTab === "twitter") {
        if (twitterText || twitterShareUrl || twitterHashtags) {
          let twitterString = "https://twitter.com/intent/tweet?";
          if (twitterText) twitterString += `text=${encodeURIComponent(twitterText)}`;
          if (twitterText && twitterShareUrl) twitterString += '&';
          if (twitterShareUrl) twitterString += `url=${encodeURIComponent(twitterShareUrl)}`;
          if ((twitterText || twitterShareUrl) && twitterHashtags) twitterString += '&';
          if (twitterHashtags) twitterString += `hashtags=${encodeURIComponent(twitterHashtags.replace(/#/g, '').replace(/\s+/g, ','))}`;
          content = twitterString;
        }
      } else if (activeTab === "bitcoin") {
        if (bitcoinAddress) {
          let bitcoinString = `bitcoin:${bitcoinAddress}`;
          if (bitcoinAmount || bitcoinLabel || bitcoinMessage) {
            bitcoinString += '?';
            if (bitcoinAmount) bitcoinString += `amount=${bitcoinAmount}`;
            if (bitcoinAmount && (bitcoinLabel || bitcoinMessage)) bitcoinString += '&';
            if (bitcoinLabel) bitcoinString += `label=${encodeURIComponent(bitcoinLabel)}`;
            if ((bitcoinAmount || bitcoinLabel) && bitcoinMessage) bitcoinString += '&';
            if (bitcoinMessage) bitcoinString += `message=${encodeURIComponent(bitcoinMessage)}`;
          }
          content = bitcoinString;
        }
      }

      qrGenerator.generatePreview(content);
    };

    generateCurrentPreview();
  }, [
    activeTab, text, ssid, password, encryption, hidden, fullName, email, phone, 
    organization, title, website, facebookUrl, linkedinUrl, instagramUrl, 
    twitterUrl, youtubeUrl, smsPhone, smsMessage, emailTo, emailSubject, emailBody,
    twitterText, twitterShareUrl, twitterHashtags, bitcoinAddress, bitcoinAmount,
    bitcoinLabel, bitcoinMessage, qrGenerator.darkColor, qrGenerator.lightColor,
    qrGenerator.addLogo, qrGenerator.logo, qrGenerator
  ]);

  const generateTextQR = async () => {
    const result = await qrGenerator.validateAndGenerate(
      text,
      "Please enter some text to generate a QR code"
    );
    
    if (result) {
      qrGenerator.saveQRCodeToDatabase(result.dataUrl, result.content, result.type);
    }
  };

  const generateWifiQR = async () => {
    if (!ssid) {
      toast({
        title: "Error",
        description: "Please enter the network name (SSID)",
        variant: "destructive",
      });
      return;
    }

    try {
      const wifiString = `WIFI:T:${encryption};S:${ssid};P:${password};H:${
        hidden ? "true" : "false"
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
    if (!fullName) {
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
        `FN:${fullName}`,
        email ? `EMAIL:${email}` : "",
        phone ? `TEL:${phone}` : "",
        organization ? `ORG:${organization}` : "",
        title ? `TITLE:${title}` : "",
        website ? `URL:${website}` : "",
        facebookUrl ? `X-SOCIALPROFILE;type=facebook:${facebookUrl}` : "",
        linkedinUrl ? `X-SOCIALPROFILE;type=linkedin:${linkedinUrl}` : "",
        instagramUrl ? `X-SOCIALPROFILE;type=instagram:${instagramUrl}` : "",
        twitterUrl ? `X-SOCIALPROFILE;type=twitter:${twitterUrl}` : "",
        youtubeUrl ? `X-SOCIALPROFILE;type=youtube:${youtubeUrl}` : "",
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
    if (!smsPhone) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      const smsString = `SMSTO:${smsPhone}:${smsMessage}`;
      
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
    if (!emailTo) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      let emailString = `MAILTO:${emailTo}`;
      
      if (emailSubject || emailBody) {
        emailString += '?';
        if (emailSubject) emailString += `subject=${encodeURIComponent(emailSubject)}`;
        if (emailSubject && emailBody) emailString += '&';
        if (emailBody) emailString += `body=${encodeURIComponent(emailBody)}`;
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
    if (!twitterText && !twitterShareUrl && !twitterHashtags) {
      toast({
        title: "Error",
        description: "Please enter at least one Twitter field",
        variant: "destructive",
      });
      return;
    }

    try {
      let twitterString = "https://twitter.com/intent/tweet?";
      
      if (twitterText) twitterString += `text=${encodeURIComponent(twitterText)}`;
      if (twitterText && twitterShareUrl) twitterString += '&';
      if (twitterShareUrl) twitterString += `url=${encodeURIComponent(twitterShareUrl)}`;
      if ((twitterText || twitterShareUrl) && twitterHashtags) twitterString += '&';
      if (twitterHashtags) twitterString += `hashtags=${encodeURIComponent(twitterHashtags.replace(/#/g, '').replace(/\s+/g, ','))}`;
      
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
    if (!bitcoinAddress) {
      toast({
        title: "Error",
        description: "Please enter a Bitcoin address",
        variant: "destructive",
      });
      return;
    }

    try {
      let bitcoinString = `bitcoin:${bitcoinAddress}`;
      
      if (bitcoinAmount || bitcoinLabel || bitcoinMessage) {
        bitcoinString += '?';
        if (bitcoinAmount) bitcoinString += `amount=${bitcoinAmount}`;
        if (bitcoinAmount && (bitcoinLabel || bitcoinMessage)) bitcoinString += '&';
        if (bitcoinLabel) bitcoinString += `label=${encodeURIComponent(bitcoinLabel)}`;
        if ((bitcoinAmount || bitcoinLabel) && bitcoinMessage) bitcoinString += '&';
        if (bitcoinMessage) bitcoinString += `message=${encodeURIComponent(bitcoinMessage)}`;
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

  const handleGenerate = () => {
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

  const handleScanQRClick = () => {
    navigate("/scan");
  };

  const getCurrentQRData = () => {
    switch (activeTab) {
      case "url":
      case "text":
        return {
          url: activeTab === "url" ? text : "",
          text: activeTab === "text" ? text : "",
          name: qrGenerator.name
        };
      case "email":
        return {
          email: emailTo,
          emailSubject,
          emailBody,
          name: qrGenerator.name
        };
      case "sms":
        return {
          phone: smsPhone,
          message: smsMessage,
          name: qrGenerator.name
        };
      default:
        return { name: qrGenerator.name };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <FloatingCircles />
      <Header />
      <main className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  QR Generator
                </h1>
                <Button variant="outline" size="sm" onClick={handleScanQRClick} className="gap-2">
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
                <div className="space-y-6 mt-6">
                  <TabsContent value="url" className="mt-0 space-y-0">
                    <TextQRTab text={text} setText={setText} isUrl={true} />
                  </TabsContent>
                  
                  <TabsContent value="text" className="mt-0 space-y-0">
                    <TextQRTab text={text} setText={setText} isUrl={false} />
                  </TabsContent>
                  
                  <TabsContent value="email" className="mt-0 space-y-0">
                    <EmailQRTab
                      emailTo={emailTo}
                      setEmailTo={setEmailTo}
                      emailSubject={emailSubject}
                      setEmailSubject={setEmailSubject}
                      emailBody={emailBody}
                      setEmailBody={setEmailBody}
                    />
                  </TabsContent>
                  
                  <TabsContent value="wifi" className="mt-0 space-y-0">
                    <WifiQRTab 
                      ssid={ssid}
                      setSsid={setSsid}
                      encryption={encryption}
                      setEncryption={setEncryption}
                      password={password}
                      setPassword={setPassword}
                      hidden={hidden}
                      setHidden={setHidden}
                    />
                  </TabsContent>
                  
                  <TabsContent value="phone" className="mt-0 space-y-0">
                    <SmsQRTab 
                      smsPhone={smsPhone}
                      setSmsPhone={setSmsPhone}
                      smsMessage={smsMessage}
                      setSmsMessage={setSmsMessage}
                    />
                  </TabsContent>

                  <TabsContent value="sms" className="mt-0 space-y-0">
                    <SmsQRTab 
                      smsPhone={smsPhone}
                      setSmsPhone={setSmsPhone}
                      smsMessage={smsMessage}
                      setSmsMessage={setSmsMessage}
                    />
                  </TabsContent>

                  <TabsContent value="vcard" className="mt-0 space-y-0">
                    <ContactQRTab
                      fullName={fullName}
                      setFullName={setFullName}
                      email={email}
                      setEmail={setEmail}
                      phone={phone}
                      setPhone={setPhone}
                      organization={organization}
                      setOrganization={setOrganization}
                      title={title}
                      setTitle={setTitle}
                      website={website}
                      setWebsite={setWebsite}
                      facebookUrl={facebookUrl}
                      setFacebookUrl={setFacebookUrl}
                      linkedinUrl={linkedinUrl}
                      setLinkedinUrl={setLinkedinUrl}
                      instagramUrl={instagramUrl}
                      setInstagramUrl={setInstagramUrl}
                      twitterUrl={twitterUrl}
                      setTwitterUrl={setTwitterUrl}
                      youtubeUrl={youtubeUrl}
                      setYoutubeUrl={setYoutubeUrl}
                    />
                  </TabsContent>

                  <TabsContent value="twitter" className="mt-0 space-y-0">
                    <TwitterQRTab 
                      twitterText={twitterText}
                      setTwitterText={setTwitterText}
                      twitterShareUrl={twitterShareUrl}
                      setTwitterShareUrl={setTwitterShareUrl}
                      twitterHashtags={twitterHashtags}
                      setTwitterHashtags={setTwitterHashtags}
                    />
                  </TabsContent>

                  <TabsContent value="bitcoin" className="mt-0 space-y-0">
                    <BitcoinQRTab 
                      bitcoinAddress={bitcoinAddress}
                      setBitcoinAddress={setBitcoinAddress}
                      bitcoinAmount={bitcoinAmount}
                      setBitcoinAmount={setBitcoinAmount}
                      bitcoinLabel={bitcoinLabel}
                      setBitcoinLabel={setBitcoinLabel}
                      bitcoinMessage={bitcoinMessage}
                      setBitcoinMessage={setBitcoinMessage}
                    />
                  </TabsContent>
                </div>
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
              <QRFrameSelector
                frameStyle={qrGenerator.frameStyle}
                setFrameStyle={qrGenerator.setFrameStyle}
              />

              <Button 
                className="w-full h-12 text-lg font-semibold"
                onClick={handleGenerate}
                disabled={qrGenerator.isGenerating}
              >
                <QrCode className="mr-2 h-5 w-5" />
                {qrGenerator.isGenerating ? "Generating..." : (editId ? "Update QR Code" : "Generate QR Code")}
              </Button>
            </div>

            {/* Right Column - Preview */}
            <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
              <QRCodePreview 
                qrDataUrl={qrGenerator.qrDataUrl}
                activeTab={activeTab}
                text={activeTab === "text" || activeTab === "url" ? text : ""}
                frameStyle={qrGenerator.frameStyle}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Generate;
