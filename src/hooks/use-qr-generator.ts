import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createQRCode } from "@/lib/api";

const useQrGenerator = () => {
  const [qrName, setQrName] = useState("");
  const [selectedTab, setSelectedTab] = useState("text");
  const [textContent, setTextContent] = useState("");
  const [urlContent, setUrlContent] = useState("");
  const [emailContent, setEmailContent] = useState({
    email: "",
    subject: "",
    body: "",
  });
  const [phoneContent, setPhoneContent] = useState("");
  const [smsContent, setSmsContent] = useState({
    phone: "",
    message: "",
  });
  const [wifiContent, setWifiContent] = useState({
    ssid: "",
    password: "",
    encryption: "WPA",
  });
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [cornerDotType, setCornerDotType] = useState("square");
  const [cornerSquareType, setCornerSquareType] = useState("square");
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoWidth, setLogoWidth] = useState(40);
  const [logoHeight, setLogoHeight] = useState(40);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const getContent = () => {
    switch (selectedTab) {
      case "text":
        return textContent;
      case "url":
        return urlContent;
      case "email":
        return `mailto:${emailContent.email}?subject=${encodeURIComponent(
          emailContent.subject
        )}&body=${encodeURIComponent(emailContent.body)}`;
      case "phone":
        return `tel:${phoneContent}`;
      case "sms":
        return `sms:${smsContent.phone}?body=${encodeURIComponent(
          smsContent.message
        )}`;
      case "wifi":
        return `wifi:T:${wifiContent.encryption};S:${
          wifiContent.ssid
        };P:${wifiContent.password};;`;
      default:
        return "";
    }
  };

  // Fix the createQRCode call to remove user_id from the data passed
  const handleSaveQRCode = async () => {
    if (!qrName) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your QR code before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const qrCodeData = {
        name: qrName,
        type: selectedTab,
        content: getContent(),
        options: {
          foregroundColor: foregroundColor,
          backgroundColor: backgroundColor,
          cornerDotType: cornerDotType,
          cornerSquareType: cornerSquareType,
          logoImage: logoImage,
          logoWidth: logoWidth,
          logoHeight: logoHeight,
        },
        folder_id: selectedFolder || null,
        scan_count: 0,
        active: true
      };
      
      const savedQRCode = await createQRCode(qrCodeData);
      
      if (savedQRCode) {
        toast({
          title: "Success",
          description: "QR code created successfully!",
        });
        
        // Reset the state
        setQrName("");
        setSelectedTab("text");
        setTextContent("");
        setUrlContent("");
        setEmailContent({ email: "", subject: "", body: "" });
        setPhoneContent("");
        setSmsContent({ phone: "", message: "" });
        setWifiContent({ ssid: "", password: "", encryption: "WPA" });
        setForegroundColor("#000000");
        setBackgroundColor("#ffffff");
        setCornerDotType("square");
        setCornerSquareType("square");
        setLogoImage(null);
        setLogoWidth(40);
        setLogoHeight(40);
        setSelectedFolder(null);
      }
    } catch (error) {
      console.error("Error creating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to create QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    qrName,
    setQrName,
    selectedTab,
    setSelectedTab,
    textContent,
    setTextContent,
    urlContent,
    setUrlContent,
    emailContent,
    setEmailContent,
    phoneContent,
    setPhoneContent,
    smsContent,
    setSmsContent,
    wifiContent,
    setWifiContent,
    foregroundColor,
    setForegroundColor,
    backgroundColor,
    setBackgroundColor,
    cornerDotType,
    setCornerDotType,
    cornerSquareType,
    setCornerSquareType,
    logoImage,
    setLogoImage,
    logoWidth,
    setLogoWidth,
    logoHeight,
    setLogoHeight,
    selectedFolder,
    setSelectedFolder,
    isSaving,
    handleSaveQRCode,
    getContent,
  };
};

export default useQrGenerator;
