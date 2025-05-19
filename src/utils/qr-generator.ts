
import QRCode from "qrcode";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Utility functions for QR code generation

export const determineType = (content: string): string => {
  if (content.startsWith('WIFI:')) return 'wifi';
  if (content.startsWith('BEGIN:VCARD')) return 'contact';
  if (content.startsWith('SMSTO:')) return 'sms';
  if (content.startsWith('MAILTO:')) return 'email';
  if (content.includes('twitter.com/intent/tweet')) return 'twitter';
  if (content.startsWith('bitcoin:')) return 'bitcoin';
  if (content.startsWith('http')) return 'url';
  return 'text';
};

export const addLogoToQR = async (
  qrDataUrl: string, 
  content: string, 
  logo: string,
  callback: (finalQR: string, content: string, type: string) => void
) => {
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
        const type = determineType(content);
        
        callback(finalQR, content, type);
      }
    };
    logoImg.src = logo;
  };
  qrImage.src = qrDataUrl;
};

export const generateQRCode = async (
  content: string,
  options: {
    darkColor: string;
    lightColor: string;
    width?: number;
    margin?: number;
  }
): Promise<string> => {
  const { darkColor, lightColor, width = 400, margin = 2 } = options;
  
  return QRCode.toDataURL(content, {
    width,
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });
};

export const handleQRCodeStorage = async (
  userId: string,
  qrCodeId: string,
  qrDataUrl: string
) => {
  try {
    const filename = `${qrCodeId}.png`;
    const { error: folderError } = await supabase.storage.from('qrcodes').list(`user_${userId}`);
    
    if (folderError && folderError.message.includes('Not found')) {
      await supabase.storage.from('qrcodes').upload(`user_${userId}/.folder_metadata`, '');
    }
    
    const response = await fetch(qrDataUrl);
    const blob = await response.blob();
    
    const { error } = await supabase.storage
      .from('qrcodes')
      .upload(`user_${userId}/${filename}`, blob, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (error) throw error;
    
    return `user_${userId}/${filename}`;
  } catch (error) {
    console.error("Error uploading QR code:", error);
    throw error;
  }
};
