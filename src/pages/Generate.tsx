import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Download, 
  Upload, 
  Trash, 
  Scan, 
  Wifi, 
  Contact, 
  LinkIcon, 
  Text, 
  QrCode,
  MessageSquare,
  Mail,
  Twitter,
  Bitcoin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { createQRCode, fetchQRCode, updateQRCode } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Json } from "@/integrations/supabase/types";

const Generate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [darkColor, setDarkColor] = useState("#10B981");
  const [lightColor, setLightColor] = useState("#FFFFFF");
  const [logo, setLogo] = useState<string | null>(null);
  const [addLogo, setAddLogo] = useState(false);
  
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
  
  // SMS
  const [smsPhone, setSmsPhone] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  
  // Email
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  
  // Twitter
  const [twitterText, setTwitterText] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [twitterHashtags, setTwitterHashtags] = useState("");
  
  // Bitcoin
  const [bitcoinAddress, setBitcoinAddress] = useState("");
  const [bitcoinAmount, setBitcoinAmount] = useState("");
  const [bitcoinLabel, setBitcoinLabel] = useState("");
  const [bitcoinMessage, setBitcoinMessage] = useState("");

  const [activeTab, setActiveTab] = useState("text");
  
  const { data: qrCodeData, isLoading: isLoadingQrCode } = useQuery({
    queryKey: ['qrCode', editId],
    queryFn: () => editId ? fetchQRCode(editId) : null,
    enabled: !!editId
  });

  useEffect(() => {
    if (qrCodeData) {
      setName(qrCodeData.name || "");
      if (qrCodeData.options && typeof qrCodeData.options === 'object') {
        // Fix: Type guard to ensure we're working with an object
        const options = qrCodeData.options as Record<string, any>;
        setQrDataUrl(options.dataUrl || "");
        setDarkColor(options.darkColor || "#10B981");
        setLightColor(options.lightColor || "#FFFFFF");
        setAddLogo(options.hasLogo || false);
      }

      if (qrCodeData.type === "url" || qrCodeData.type === "text") {
        setActiveTab("text");
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
        setActiveTab("contact");
        try {
          const vCardString = qrCodeData.content;
          const fnMatch = vCardString.match(/FN:(.*?)(?:\r?\n|$)/);
          const emailMatch = vCardString.match(/EMAIL:(.*?)(?:\r?\n|$)/);
          const telMatch = vCardString.match(/TEL:(.*?)(?:\r?\n|$)/);
          const orgMatch = vCardString.match(/ORG:(.*?)(?:\r?\n|$)/);
          const titleMatch = vCardString.match(/TITLE:(.*?)(?:\r?\n|$)/);
          const urlMatch = vCardString.match(/URL:(.*?)(?:\r?\n|$)/);
          
          if (fnMatch) setFullName(fnMatch[1]);
          if (emailMatch) setEmail(emailMatch[1]);
          if (telMatch) setPhone(telMatch[1]);
          if (orgMatch) setOrganization(orgMatch[1]);
          if (titleMatch) setTitle(titleMatch[1]);
          if (urlMatch) setWebsite(urlMatch[1]);
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
          if (urlMatch) setTwitterUrl(decodeURIComponent(urlMatch[1]));
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
  }, [qrCodeData]);

  const createQRCodeMutation = useMutation({
    mutationFn: createQRCode,
    onSuccess: async (data) => {
      if (qrDataUrl) {
        try {
          const filename = `${data.id}.png`;
          const { error: folderError } = await supabase.storage.from('qrcodes').list(`user_${user?.id}`);
          
          if (folderError && folderError.message.includes('Not found')) {
            await supabase.storage.from('qrcodes').upload(`user_${user?.id}/.folder_metadata`, '');
          }
          
          const response = await fetch(qrDataUrl);
          const blob = await response.blob();
          
          const { error } = await supabase.storage
            .from('qrcodes')
            .upload(`user_${user?.id}/${filename}`, blob, {
              contentType: 'image/png',
              upsert: true
            });
            
          if (error) throw error;
          
          await updateQRCode(data.id, {
            options: {
              ...(typeof data.options === 'object' && data.options !== null ? data.options : {}),
              storagePath: `user_${user?.id}/${filename}`
            }
          });
          
          toast({
            title: "QR Code Saved",
            description: "Your QR code has been saved to your dashboard"
          });
        } catch (error) {
          console.error("Error uploading QR code:", error);
          toast({
            title: "QR Code Saved",
            description: "Your QR code was saved but the image upload failed"
          });
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save QR code",
        variant: "destructive",
      });
    }
  });

  const updateQRCodeMutation = useMutation({
    mutationFn: ({id, updates}: {id: string, updates: any}) => updateQRCode(id, updates),
    onSuccess: async (data) => {
      if (qrDataUrl && editId) {
        try {
          const response = await fetch(qrDataUrl);
          const blob = await response.blob();
          
          const filename = `${editId}.png`;
          const { error } = await supabase.storage
            .from('qrcodes')
            .upload(`user_${user?.id}/${filename}`, blob, {
              contentType: 'image/png',
              upsert: true
            });
            
          if (error) throw error;
          
          toast({
            title: "QR Code Updated",
            description: "Your QR code has been updated successfully"
          });
        } catch (error) {
          console.error("Error uploading QR code:", error);
          toast({
            title: "QR Code Updated",
            description: "Your QR code was updated but the image upload failed"
          });
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update QR code",
        variant: "destructive",
      });
    }
  });

  const generateTextQR = async () => {
    if (!text) {
      toast({
        title: "Error",
        description: "Please enter some text to generate a QR code",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 400,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrDataUrl(dataUrl);
      
      if (addLogo && logo) {
        addLogoToQR(dataUrl, text);
      } else {
        toast({
          title: "Success",
          description: "QR code generated successfully",
        });
        
        saveQRCodeToDatabase(dataUrl, text, text.startsWith("http") ? "url" : "text");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
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
      
      const dataUrl = await QRCode.toDataURL(wifiString, {
        width: 400,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrDataUrl(dataUrl);
      
      if (addLogo && logo) {
        addLogoToQR(dataUrl, wifiString);
      } else {
        toast({
          title: "Success",
          description: "WiFi QR code generated successfully",
        });
        
        saveQRCodeToDatabase(dataUrl, wifiString, "wifi");
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
      const vCardString = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${fullName}`,
        email ? `EMAIL:${email}` : "",
        phone ? `TEL:${phone}` : "",
        organization ? `ORG:${organization}` : "",
        title ? `TITLE:${title}` : "",
        website ? `URL:${website}` : "",
        "END:VCARD"
      ].filter(Boolean).join("\n");
      
      const dataUrl = await QRCode.toDataURL(vCardString, {
        width: 400,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrDataUrl(dataUrl);
      
      if (addLogo && logo) {
        addLogoToQR(dataUrl, vCardString);
      } else {
        toast({
          title: "Success",
          description: "Contact QR code generated successfully",
        });
        
        saveQRCodeToDatabase(dataUrl, vCardString, "contact");
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
      
      const dataUrl = await QRCode.toDataURL(smsString, {
        width: 400,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrDataUrl(dataUrl);
      
      if (addLogo && logo) {
        addLogoToQR(dataUrl, smsString);
      } else {
        toast({
          title: "Success",
          description: "SMS QR code generated successfully",
        });
        
        saveQRCodeToDatabase(dataUrl, smsString, "sms");
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
      
      const dataUrl = await QRCode.toDataURL(emailString, {
        width: 400,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrDataUrl(dataUrl);
      
      if (addLogo && logo) {
        addLogoToQR(dataUrl, emailString);
      } else {
        toast({
          title: "Success",
          description: "Email QR code generated successfully",
        });
        
        saveQRCodeToDatabase(dataUrl, emailString, "email");
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
    if (!twitterText && !twitterUrl && !twitterHashtags) {
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
      if (twitterText && twitterUrl) twitterString += '&';
      if (twitterUrl) twitterString += `url=${encodeURIComponent(twitterUrl)}`;
      if ((twitterText || twitterUrl) && twitterHashtags) twitterString += '&';
      if (twitterHashtags) twitterString += `hashtags=${encodeURIComponent(twitterHashtags.replace(/#/g, '').replace(/\s+/g, ','))}`;
      
      const dataUrl = await QRCode.toDataURL(twitterString, {
        width: 400,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrDataUrl(dataUrl);
      
      if (addLogo && logo) {
        addLogoToQR(dataUrl, twitterString);
      } else {
        toast({
          title: "Success",
          description: "Twitter QR code generated successfully",
        });
        
        saveQRCodeToDatabase(dataUrl, twitterString, "twitter");
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
      
      const dataUrl = await QRCode.toDataURL(bitcoinString, {
        width: 400,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrDataUrl(dataUrl);
      
      if (addLogo && logo) {
        addLogoToQR(dataUrl, bitcoinString);
      } else {
        toast({
          title: "Success",
          description: "Bitcoin QR code generated successfully",
        });
        
        saveQRCodeToDatabase(dataUrl, bitcoinString, "bitcoin");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const addLogoToQR = (qrDataUrl: string, content: string) => {
    if (!logo) return;
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const qrImage = new Image();
    
    qrImage.onload = () => {
      canvas.width = qrImage.width;
      canvas.height = qrImage.height;
      
      if (ctx) ctx.drawImage(qrImage, 0, 0);
      
      const logoImg = new Image();
      logoImg.onload = () => {
        // Calculate size and position preserving aspect ratio
        const maxLogoSize = qrImage.width * 0.25;
        
        // Get original logo dimensions
        const originalWidth = logoImg.width;
        const originalHeight = logoImg.height;
        
        // Calculate scaling factor to fit within maxLogoSize while preserving aspect ratio
        const scaleFactor = Math.min(
          maxLogoSize / originalWidth,
          maxLogoSize / originalHeight
        );
        
        // Calculate new dimensions
        const logoWidth = originalWidth * scaleFactor;
        const logoHeight = originalHeight * scaleFactor;
        
        // Center logo in QR code
        const logoX = (qrImage.width - logoWidth) / 2;
        const logoY = (qrImage.height - logoHeight) / 2;
        
        if (ctx) {
          // Add white padding around logo that's slightly larger than the logo
          const padding = 5;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(logoX - padding, logoY - padding, logoWidth + (padding * 2), logoHeight + (padding * 2));
          
          // Draw the logo with preserved aspect ratio
          ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
          
          const finalQR = canvas.toDataURL("image/png");
          setQrDataUrl(finalQR);
          
          toast({
            title: "Success",
            description: "QR code with logo generated successfully",
          });
          
          saveQRCodeToDatabase(finalQR, content, determineType(content));
        }
      };
      logoImg.src = logo;
    };
    qrImage.src = qrDataUrl;
  };

  const determineType = (content: string): string => {
    if (content.startsWith('WIFI:')) return 'wifi';
    if (content.startsWith('BEGIN:VCARD')) return 'contact';
    if (content.startsWith('SMSTO:')) return 'sms';
    if (content.startsWith('MAILTO:')) return 'email';
    if (content.includes('twitter.com/intent/tweet')) return 'twitter';
    if (content.startsWith('bitcoin:')) return 'bitcoin';
    if (content.startsWith('http')) return 'url';
    return 'text';
  };

  const saveQRCodeToDatabase = (dataUrl: string, content: string, type: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save QR codes",
        variant: "destructive",
      });
      return;
    }

    const qrName = name || `${type.toUpperCase()} QR - ${new Date().toLocaleString()}`;
    
    if (editId) {
      updateQRCodeMutation.mutate({
        id: editId,
        updates: {
          name: qrName,
          content: content,
          type: type,
          options: {
            darkColor,
            lightColor,
            hasLogo: addLogo,
            dataUrl: dataUrl
          }
        }
      });
    } else {
      // Fix: Rather than spread undefined data.options, create a new object
      createQRCodeMutation.mutate({
        name: qrName,
        content: content,
        type: type,
        options: {
          darkColor,
          lightColor,
          hasLogo: addLogo,
          dataUrl: dataUrl
        },
        user_id: user.id,
        folder_id: null
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setLogo(event.target.result);
          setAddLogo(true);
          toast({
            title: "Logo uploaded",
            description: "Your logo has been uploaded successfully",
          });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setAddLogo(false);
    toast({
      title: "Logo removed",
      description: "Your logo has been removed",
    });
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Success",
        description: "Text copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qrcode-${activeTab}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "QR code downloaded successfully",
    });
  };

  const handleGenerate = () => {
    if (activeTab === "text") {
      generateTextQR();
    } else if (activeTab === "wifi") {
      generateWifiQR();
    } else if (activeTab === "contact") {
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

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">
                  <span className="text-primary">QR Code</span> Generator
                </h1>
                <Button variant="outline" onClick={handleScanQRClick}>
                  <Scan className="mr-2 h-4 w-4" />
                  Scan QR
                </Button>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-4 mb-2">
                  <TabsTrigger value="text" className="flex items-center gap-1">
                    <Text className="h-4 w-4" />
                    <span className="hidden sm:inline">Text/URL</span>
                  </TabsTrigger>
                  <TabsTrigger value="wifi" className="flex items-center gap-1">
                    <Wifi className="h-4 w-4" />
                    <span className="hidden sm:inline">WiFi</span>
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="flex items-center gap-1">
                    <Contact className="h-4 w-4" />
                    <span className="hidden sm:inline">Contact</span>
                  </TabsTrigger>
                  <TabsTrigger value="more" className="flex items-center gap-1">
                    <span>More</span>
                  </TabsTrigger>
                </TabsList>

                {activeTab === "more" && (
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="sms" className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">SMS</span>
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span className="hidden sm:inline">Email</span>
                    </TabsTrigger>
                    <TabsTrigger value="twitter" className="flex items-center gap-1">
                      <Twitter className="h-4 w-4" />
                      <span className="hidden sm:inline">Twitter</span>
                    </TabsTrigger>
                    <TabsTrigger value="bitcoin" className="flex items-center gap-1">
                      <Bitcoin className="h-4 w-4" />
                      <span className="hidden sm:inline">Bitcoin</span>
                    </TabsTrigger>
                  </TabsList>
                )}
                
                <div className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="qrName">QR Code Name</Label>
                    <Input
                      id="qrName"
                      type="text"
                      placeholder="Enter a name for your QR code"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <TabsContent value="text" className="space-y-4 mt-0">
                    <div className="relative">
                      <Label htmlFor="qrContent">Content</Label>
                      <Input
                        id="qrContent"
                        type="text"
                        placeholder="Enter text or URL"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="wifi" className="space-y-4 mt-0">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ssid">Network Name (SSID)</Label>
                        <Input
                          id="ssid"
                          value={ssid}
                          onChange={(e) => setSsid(e.target.value)}
                          placeholder="Enter network name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="encryption">Security Type</Label>
                        <Select value={encryption} onValueChange={setEncryption}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select security type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WPA">WPA/WPA2</SelectItem>
                            <SelectItem value="WEP">WEP</SelectItem>
                            <SelectItem value="nopass">No Password</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {encryption !== "nopass" && (
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter network password"
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hidden"
                          checked={hidden}
                          onCheckedChange={(checked) => setHidden(checked as boolean)}
                        />
                        <Label htmlFor="hidden">Hidden network</Label>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="contact" className="space-y-4 mt-0">
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
                    </div>
                  </TabsContent>

                  <TabsContent value="sms" className="space-y-4 mt-0">
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
                  </TabsContent>

                  <TabsContent value="email" className="space-y-4 mt-0">
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
                  </TabsContent>

                  <TabsContent value="twitter" className="space-y-4 mt-0">
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
                        <Label htmlFor="twitterUrl">URL (optional)</Label>
                        <Input
                          id="twitterUrl"
                          value={twitterUrl}
                          onChange={(e) => setTwitterUrl(e.target.value)}
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
                  </TabsContent>

                  <TabsContent value="bitcoin" className="space-y-4 mt-0">
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
                  </TabsContent>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="darkColor">QR Code Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="darkColor"
                          value={darkColor}
                          onChange={(e) => setDarkColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={darkColor}
                          onChange={(e) => setDarkColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lightColor">Background Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="lightColor"
                          value={lightColor}
                          onChange={(e) => setLightColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={lightColor}
                          onChange={(e) => setLightColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="addLogo" 
                        checked={addLogo} 
                        onCheckedChange={(checked) => {
                          setAddLogo(checked === true);
                          if (checked === false) {
                            setLogo(null);
                          }
                        }}
                      />
                      <Label htmlFor="addLogo">Add Logo to Center</Label>
                    </div>
                    
                    {addLogo && (
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {logo ? "Change Logo" : "Upload Logo"}
                          </Button>
                          
                          {logo && (
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={removeLogo}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                        
                        {logo && (
                          <div className="flex justify-center">
                            <img
                              src={logo}
                              alt="Logo preview"
                              className="h-16 w-16 object-contain border rounded"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={handleGenerate}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    {editId ? "Update QR Code" : "Generate QR Code"}
                  </Button>
                </div>
              </Tabs>
            </div>

            {qrDataUrl && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-lg p-4 mx-auto w-fit">
                  <img
                    src={qrDataUrl}
                    alt="Generated QR Code"
                    className="w-64 h-64"
                  />
                </div>

                <div className="flex justify-center gap-4">
                  {activeTab === "text" && (
                    <Button
                      variant="outline"
                      className="w-40"
                      onClick={copyText}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Text
                    </Button>
                  )}
                  <Button
                    className="w-40"
                    onClick={downloadQR}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Generate;
