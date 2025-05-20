
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { createQRCode, updateQRCode } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { generateQRCode, addLogoToQR, handleQRCodeStorage } from "@/utils/qr-generator";

interface UseQRGeneratorProps {
  user: { id: string } | null;
  editId: string | null;
}

export function useQRGenerator({ user, editId }: UseQRGeneratorProps) {
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [name, setName] = useState("");
  const [darkColor, setDarkColor] = useState("#10B981");
  const [lightColor, setLightColor] = useState("#FFFFFF");
  const [logo, setLogo] = useState<string | null>(null);
  const [addLogo, setAddLogo] = useState(false);

  const createQRCodeMutation = useMutation({
    mutationFn: createQRCode,
    onSuccess: async (data) => {
      if (qrDataUrl && user) {
        try {
          const storagePath = await handleQRCodeStorage(user.id, data.id, qrDataUrl);
          
          await updateQRCode(data.id, {
            options: {
              ...(typeof data.options === 'object' && data.options !== null ? data.options : {}),
              storagePath
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
      if (qrDataUrl && editId && user) {
        try {
          await handleQRCodeStorage(user.id, editId, qrDataUrl);
          
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

  const validateAndGenerate = async (
    content: string, 
    validationMessage: string
  ) => {
    if (!content) {
      toast({
        title: "Error",
        description: validationMessage,
        variant: "destructive",
      });
      return null;
    }

    try {
      const dataUrl = await generateQRCode(content, {
        darkColor,
        lightColor
      });
      
      setQrDataUrl(dataUrl);
      
      if (addLogo && logo) {
        return new Promise<{ dataUrl: string, content: string, type: string }>((resolve) => {
          addLogoToQR(dataUrl, content, logo, (finalQR, finalContent, type) => {
            setQrDataUrl(finalQR);
            resolve({ 
              dataUrl: finalQR, 
              content: finalContent, 
              type 
            });
          });
        });
      } else {
        const type = content.startsWith("http") ? "url" : "text";
        toast({
          title: "Success",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} QR code generated successfully`,
        });
        
        return {
          dataUrl,
          content,
          type
        };
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
      return null;
    }
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
        folder_id: null,
        scan_count: 0,
        active: true
      });
    }
  };

  return {
    // State
    qrDataUrl,
    setQrDataUrl,
    name,
    setName,
    darkColor,
    setDarkColor,
    lightColor,
    setLightColor,
    logo,
    setLogo,
    addLogo,
    setAddLogo,
    
    // Functions
    validateAndGenerate,
    saveQRCodeToDatabase,
    
    // Mutations
    createQRCodeMutation,
    updateQRCodeMutation,
  };
}
