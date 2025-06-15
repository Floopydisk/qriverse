
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { createQRCode, updateQRCode } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { generateQRCode, addLogoToQR, handleQRCodeStorage } from "@/utils/qr-generator";

const useQrGenerator = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form state
  const [name, setName] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [darkColor, setDarkColor] = useState("#10B981");
  const [lightColor, setLightColor] = useState("#FFFFFF");
  const [addLogo, setAddLogo] = useState(false);
  const [logo, setLogo] = useState("");
  const [frameStyle, setFrameStyle] = useState("none");
  const [isGenerating, setIsGenerating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const generatePreview = useCallback(async (content: string) => {
    if (!content.trim()) {
      setQrDataUrl("");
      return;
    }

    try {
      const qrCode = await generateQRCode(content, {
        darkColor,
        lightColor,
        width: 400,
        margin: 2
      });

      if (addLogo && logo) {
        addLogoToQR(qrCode, content, logo, (finalQR) => {
          setQrDataUrl(finalQR);
        });
      } else {
        setQrDataUrl(qrCode);
      }
    } catch (error) {
      console.error("Error generating QR preview:", error);
    }
  }, [darkColor, lightColor, addLogo, logo]);

  const saveQRCode = useCallback(async (content: string, type: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save QR codes",
        variant: "destructive",
      });
      return null;
    }

    if (!name.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a name for your QR code",
        variant: "destructive",
      });
      return null;
    }

    if (!qrDataUrl) {
      toast({
        title: "Error",
        description: "Please generate a QR code first", 
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);

    try {
      // Upload QR code image to storage
      let storagePath = "";
      try {
        storagePath = await handleQRCodeStorage(user.id, editId || 'temp', qrDataUrl);
      } catch (storageError) {
        console.error("Storage upload failed:", storageError);
        // Continue without storage path - fallback to data URL
      }

      const qrCodeData = {
        name: name.trim(),
        type,
        content,
        options: {
          darkColor,
          lightColor,
          hasLogo: addLogo,
          frameStyle,
          dataUrl: qrDataUrl, // Keep as fallback
          storagePath: storagePath || undefined // Only set if upload succeeded
        }
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
        return result;
      } else {
        throw new Error("Failed to save QR code");
      }
    } catch (error) {
      console.error("Error saving QR code:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save QR code",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, name, qrDataUrl, darkColor, lightColor, addLogo, frameStyle, editId, toast]);

  return {
    // State
    name,
    qrDataUrl,
    darkColor,
    lightColor,
    addLogo,
    logo,
    frameStyle,
    isGenerating,
    editId,

    // Setters
    setName,
    setQrDataUrl,
    setDarkColor,
    setLightColor,
    setAddLogo,
    setLogo,
    setFrameStyle,
    setEditId,

    // Actions
    generatePreview,
    saveQRCode
  };
};

export default useQrGenerator;
