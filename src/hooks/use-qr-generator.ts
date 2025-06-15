
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { createQRCode, updateQRCode } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { generateStyledQR } from "@/utils/qr-styler";
import { integrateLogoIntoQR } from "@/utils/qr-logo-integration";
import { handleQRCodeStorage } from "@/utils/qr-generator";

const useQrGenerator = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form state
  const [name, setName] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#FFFFFF");
  const [eyeColor, setEyeColor] = useState("#000000");
  const [patternColor, setPatternColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [pattern, setPattern] = useState("square");
  const [eyeRadius, setEyeRadius] = useState(0);
  const [addLogo, setAddLogo] = useState(false);
  const [logo, setLogo] = useState("");
  const [template, setTemplate] = useState("square");
  const [logoStyle, setLogoStyle] = useState("integrated");
  const [logoSize, setLogoSize] = useState(0.25);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const generatePreview = useCallback(async (content: string) => {
    if (!content.trim()) {
      setQrDataUrl("");
      return;
    }

    try {
      // Generate styled QR code with react-qrcode-logo
      const qrCode = await generateStyledQR(content, {
        darkColor: patternColor,
        lightColor: backgroundColor,
        eyeColor,
        pattern: pattern as any,
        width: 400,
        margin: 2,
        template: template as any,
        cornerRadius: 20,
        eyeRadius,
        qrStyle: pattern === 'dots' ? 'dots' : pattern === 'fluid' ? 'fluid' : 'squares',
        eyeStyle: pattern === 'circle' || pattern === 'dots' ? 'circle' : 'square'
      });

      // Add logo if enabled
      if (addLogo && logo) {
        const finalQR = await integrateLogoIntoQR(qrCode, logo, {
          logoSize,
          preserveAspectRatio,
          logoStyle: logoStyle as any,
          padding: 8,
          borderRadius: 8,
          borderColor: backgroundColor,
          borderWidth: 4
        });
        setQrDataUrl(finalQR);
      } else {
        setQrDataUrl(qrCode);
      }
    } catch (error) {
      console.error("Error generating QR preview:", error);
    }
  }, [patternColor, backgroundColor, eyeColor, pattern, eyeRadius, addLogo, logo, template, logoStyle, logoSize, preserveAspectRatio]);

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
          eyeColor,
          patternColor,
          backgroundColor,
          pattern,
          eyeRadius,
          hasLogo: addLogo,
          template,
          logoStyle,
          logoSize,
          preserveAspectRatio,
          dataUrl: qrDataUrl, // Keep as fallback
          storagePath: storagePath || undefined // Only set if upload succeeded
        },
        folder_id: null,
        active: true,
        scan_count: 0
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
  }, [user, name, qrDataUrl, darkColor, lightColor, eyeColor, patternColor, backgroundColor, pattern, eyeRadius, addLogo, template, logoStyle, logoSize, preserveAspectRatio, editId, toast]);

  return {
    // State
    name,
    qrDataUrl,
    darkColor,
    lightColor,
    eyeColor,
    patternColor,
    backgroundColor,
    pattern,
    eyeRadius,
    addLogo,
    logo,
    template,
    logoStyle,
    logoSize,
    preserveAspectRatio,
    isGenerating,
    editId,

    // Setters
    setName,
    setQrDataUrl,
    setDarkColor,
    setLightColor,
    setEyeColor,
    setPatternColor,
    setBackgroundColor,
    setPattern,
    setEyeRadius,
    setAddLogo,
    setLogo,
    setTemplate,
    setLogoStyle,
    setLogoSize,
    setPreserveAspectRatio,
    setEditId,

    // Actions
    generatePreview,
    saveQRCode
  };
};

export default useQrGenerator;
