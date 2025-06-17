/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  error: Error | null;
  path: string | null;
}

export async function saveMediaToSupabase(
  file: Blob,
  userId: string,
  bucketName: string = 'qrcodes',
  baseFolderName: string = 'user'
): Promise<UploadResult> {
  try {
    // Create a unique filename using timestamp
    const timestamp = new Date().getTime();
    const extension = "png";
    const filename = `qrcode-${timestamp}.${extension}`;
    
    // Construct the storage path: user_userId/filename
    const filePath = `${baseFolderName}_${userId}/${filename}`;

    // Check if bucket exists, create if not
    const { error: bucketError } = await supabase.storage.getBucket(bucketName);
    if (bucketError && bucketError.message.includes('does not exist')) {
      await supabase.storage.createBucket(bucketName, {
        public: true
      });
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: 'image/png',
        upsert: false
      });

    if (error) {
      console.error('Error uploading media to Supabase:', error);
      return { error, path: null };
    }

    console.log('Media uploaded successfully:', data);
    return { error: null, path: filePath };
  } catch (error: any) {
    console.error('An unexpected error occurred during upload:', error);
    return { error: error as Error, path: null };
  }
}

export async function getPublicUrl(
  path: string,
  bucketName: string = 'qrcodes'
): Promise<string | null> {
  try {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting public URL:', error);
    return null;
  }
}

export async function downloadQRCode(
  path: string,
  filename: string = 'qrcode.png',
  bucketName: string = 'qrcodes'
): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(path);
    
    if (error || !data) {
      console.error('Error downloading file:', error);
      return false;
    }
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    return true;
  } catch (error) {
    console.error('Error in download process:', error);
    return false;
  }
}

// Helper to add padding around logo in QR code
export function createPaddedLogo(originalLogo: HTMLImageElement, paddingPercentage: number = 15): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const padding = (paddingPercentage / 100);
    
    // Calculate dimensions with padding
    const size = Math.max(originalLogo.width, originalLogo.height);
    const paddedSize = size * (1 + padding * 2); // Add padding on both sides
    
    canvas.width = paddedSize;
    canvas.height = paddedSize;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Draw transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, paddedSize, paddedSize);
    
    // Center the logo with padding
    const xOffset = (paddedSize - originalLogo.width) / 2;
    const yOffset = (paddedSize - originalLogo.height) / 2;
    
    ctx.drawImage(originalLogo, xOffset, yOffset);
    
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        throw new Error('Failed to create blob from canvas');
      }
    }, 'image/png');
  });
}
