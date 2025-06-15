import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createQRCode } from "@/lib/api";
import { generateQRCode, addLogoToQR } from "@/utils/qr-generator";

const useQrGenerator = (initialData = {}) => {
  const [name, setName] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [darkColor, setDarkColor] = useState("#10B981");
  const [lightColor, setLightColor] = useState("#FFFFFF");
  const [logo, setLogo] = useState("");
  const [addLogo, setAddLogo] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [frameStyle, setFrameStyle] = useState("none");
  const { toast } = useToast();

  const validateAndGenerate = async (content, errorMessage) => {
    if (!content) {
      toast({
        title: "Error",
        description: errorMessage || "Please enter some content to generate a QR code",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    try {
      const dataUrl = await generateQRCode(content, {
        darkColor,
        lightColor,
        width: 400,
        margin: 2
      });

      setQrDataUrl(dataUrl);

      return {
        dataUrl,
        content,
        type: determineContentType(content),
      };
    } catch (error) {
      console.error("QR generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveQRCodeToDatabase = async (dataUrl, content, type) => {
    if (!name) {
      toast({
        title: "Error",
        description: "Please give your QR code a name",
        variant: "destructive",
      });
      return;
    }

    try {
      const qrCodeData = {
        name,
        type,
        content,
        options: {
          dataUrl,
          darkColor,
          lightColor,
          hasLogo: addLogo,
          frameStyle, // <-- include frame style in db options
        },
        folder_id: null,
        scan_count: 0,
        active: true
      };

      const result = await createQRCode(qrCodeData);

      if (result) {
        toast({
          title: "Success",
          description: "QR code saved successfully",
        });
        // Reset the form
        setName("");
        setQrDataUrl("");
        setLogo("");
      }
    } catch (error) {
      console.error("Error saving QR code:", error);
      toast({
        title: "Error",
        description: "Failed to save QR code",
        variant: "destructive",
      });
    }
  };

  const determineContentType = (content) => {
    if (content.startsWith("WIFI:")) return "wifi";
    if (content.startsWith("BEGIN:VCARD")) return "contact";
    if (content.startsWith("SMSTO:")) return "sms";
    if (content.startsWith("MAILTO:")) return "email";
    if (content.includes("twitter.com/intent/tweet")) return "twitter";
    if (content.startsWith("bitcoin:")) return "bitcoin";
    if (content.startsWith("http")) return "url";
    return "text";
  };

  return {
    name,
    setName,
    qrDataUrl,
    setQrDataUrl,
    darkColor,
    setDarkColor,
    lightColor,
    setLightColor,
    logo,
    setLogo,
    addLogo,
    setAddLogo,
    isGenerating,
    validateAndGenerate,
    saveQRCodeToDatabase,
    frameStyle,
    setFrameStyle
  };
};

export default useQrGenerator;
