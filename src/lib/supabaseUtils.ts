
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
