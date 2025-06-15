
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { createQRCode, updateQRCode } from "@/lib/api";
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
  const [editId, setEditId] = useState<string | null>(null);
  const { toast } = useToast();

  // Real-time preview generation
  const generatePreview = useCallback(async (content: string) => {
    if (!content) {
      setQrDataUrl("");
      return;
    }

    try {
      const dataUrl = await generateQRCode(content, {
        darkColor,
        lightColor,
        width: 400,
        margin: 2
      });

      if (addLogo && logo) {
        addLogoToQR(dataUrl, content, logo, (finalQR) => {
          setQrDataUrl(finalQR);
        });
      } else {
        setQrDataUrl(dataUrl);
      }
    } catch (error) {
      console.error("Preview generation error:", error);
      setQrDataUrl("");
    }
  }, [darkColor, lightColor, addLogo, logo]);

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

      let finalDataUrl = dataUrl;
      
      if (addLogo && logo) {
        await new Promise((resolve) => {
          addLogoToQR(dataUrl, content, logo, (finalQR) => {
            finalDataUrl = finalQR;
            resolve(finalQR);
          });
        });
      }

      setQrDataUrl(finalDataUrl);

      return {
        dataUrl: finalDataUrl,
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
          frameStyle,
        },
        folder_id: null,
        scan_count: 0,
        active: true
      };

      let result;
      if (editId) {
        result = await updateQRCode(editId, qrCodeData);
      } else {
        result = await createQRCode(qrCodeData);
      }

      if (result) {
        toast({
          title: "Success",
          description: editId ? "QR code updated successfully" : "QR code saved successfully",
        });
        
        if (!editId) {
          // Reset the form only for new QR codes
          setName("");
          setQrDataUrl("");
          setLogo("");
        }
      }
    } catch (error) {
      console.error("Error saving QR code:", error);
      toast({
        title: "Error",
        description: editId ? "Failed to update QR code" : "Failed to save QR code",
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
    setFrameStyle,
    generatePreview,
    editId,
    setEditId
  };
};

export default useQrGenerator;
