import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { useAuth } from "@/hooks/use-auth";
import { fetchQRCode } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import useQrGenerator from "@/hooks/use-qr-generator";
import { useQRGenerationLogic } from "@/hooks/use-qr-generation-logic";
import { GenerateForm } from "@/components/qr-generator/GenerateForm";
import { QRPreviewSection } from "@/components/qr-generator/QRPreviewSection";

const Generate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { user } = useAuth();
  const hasLoadedData = useRef(false);

  // QR Generator hook
  const qrGenerator = useQrGenerator();
  
  // Form state
  const [text, setText] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [title, setTitle] = useState("");
  const [website, setWebsite] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [twitterText, setTwitterText] = useState("");
  const [twitterShareUrl, setTwitterShareUrl] = useState("");
  const [twitterHashtags, setTwitterHashtags] = useState("");
  const [bitcoinAddress, setBitcoinAddress] = useState("");
  const [bitcoinAmount, setBitcoinAmount] = useState("");
  const [bitcoinLabel, setBitcoinLabel] = useState("");
  const [bitcoinMessage, setBitcoinMessage] = useState("");
  const [activeTab, setActiveTab] = useState("url");

  // Form data object for generation logic
  const formData = {
    text, ssid, password, encryption, hidden, fullName, email, phone,
    organization, title, website, facebookUrl, linkedinUrl, instagramUrl,
    twitterUrl, youtubeUrl, smsPhone, smsMessage, emailTo, emailSubject,
    emailBody, twitterText, twitterShareUrl, twitterHashtags, bitcoinAddress,
    bitcoinAmount, bitcoinLabel, bitcoinMessage
  };

  // Generation logic hook
  const { handleGenerate } = useQRGenerationLogic(qrGenerator, formData);

  const { data: qrCodeData, isLoading } = useQuery({
    queryKey: ['qrCode', editId],
    queryFn: () => editId ? fetchQRCode(editId) : null,
    enabled: !!editId
  });

  // Set edit ID when in edit mode
  useEffect(() => {
    if (editId) {
      qrGenerator.setEditId(editId);
      hasLoadedData.current = false; // Reset flag when switching to edit mode
    } else {
      hasLoadedData.current = false; // Reset flag when creating new QR
    }
  }, [editId, qrGenerator]);

  // Load QR code data for editing - only run once when data is first loaded
  useEffect(() => {
    if (qrCodeData && !hasLoadedData.current) {
      console.log("Loading QR code data for editing:", qrCodeData);
      hasLoadedData.current = true; // Set flag to prevent reloading
      
      qrGenerator.setName(qrCodeData.name || "");
      if (qrCodeData.options && typeof qrCodeData.options === 'object') {
        const options = qrCodeData.options as Record<string, any>;
        qrGenerator.setQrDataUrl(options.dataUrl || "");
        qrGenerator.setDarkColor(options.darkColor || "#000000");
        qrGenerator.setLightColor(options.lightColor || "#FFFFFF");
        qrGenerator.setAddLogo(options.hasLogo || false);
        qrGenerator.setTemplate(options.template || "square");
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
  }, [qrCodeData, qrGenerator]); // Only depend on qrCodeData and qrGenerator setters

  // Real-time preview generation - separate effect for preview updates
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
    bitcoinLabel, bitcoinMessage, qrGenerator
  ]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <FloatingCircles />
        <Header />
        <main className="container mx-auto px-4 pt-20 pb-12 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <FloatingCircles />
      <Header />
      <main className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <GenerateForm
              qrGenerator={qrGenerator}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onGenerate={() => handleGenerate(activeTab)}
              onScanClick={handleScanQRClick}
              editId={editId}
              getCurrentQRData={getCurrentQRData}
              text={text}
              setText={setText}
              ssid={ssid}
              setSsid={setSsid}
              password={password}
              setPassword={setPassword}
              encryption={encryption}
              setEncryption={setEncryption}
              hidden={hidden}
              setHidden={setHidden}
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
              smsPhone={smsPhone}
              setSmsPhone={setSmsPhone}
              smsMessage={smsMessage}
              setSmsMessage={setSmsMessage}
              emailTo={emailTo}
              setEmailTo={setEmailTo}
              emailSubject={emailSubject}
              setEmailSubject={setEmailSubject}
              emailBody={emailBody}
              setEmailBody={setEmailBody}
              twitterText={twitterText}
              setTwitterText={setTwitterText}
              twitterShareUrl={twitterShareUrl}
              setTwitterShareUrl={setTwitterShareUrl}
              twitterHashtags={twitterHashtags}
              setTwitterHashtags={setTwitterHashtags}
              bitcoinAddress={bitcoinAddress}
              setBitcoinAddress={setBitcoinAddress}
              bitcoinAmount={bitcoinAmount}
              setBitcoinAmount={setBitcoinAmount}
              bitcoinLabel={bitcoinLabel}
              setBitcoinLabel={setBitcoinLabel}
              bitcoinMessage={bitcoinMessage}
              setBitcoinMessage={setBitcoinMessage}
            />

            {/* Right Column - Preview */}
            <QRPreviewSection
              qrDataUrl={qrGenerator.qrDataUrl}
              activeTab={activeTab}
              text={text}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Generate;
