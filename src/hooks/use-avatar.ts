
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

interface UseAvatarUploadOptions {
  bucketName?: string;
  userId: string;
}

interface UploadAvatarResult {
  error: Error | null;
  avatarUrl: string | null;
}

export function useAvatarUpload({ bucketName = 'avatars', userId }: UseAvatarUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (file: File): Promise<UploadAvatarResult> => {
    if (!file || !userId) {
      return { error: new Error("Missing file or user ID"), avatarUrl: null };
    }
    
    try {
      setIsUploading(true);
      
      // Check if the bucket exists, create if not
      const { error: bucketError } = await supabase.storage.getBucket(bucketName);
      
      if (bucketError && bucketError.message.includes('does not exist')) {
        await supabase.storage.createBucket(bucketName, {
          public: true
        });
      }
      
      // Create a unique filename with proper extension
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = fileName;
      
      // Upload the file with upsert to replace any existing avatar
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      // Update the user profile
      await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', userId);
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully"
      });
      
      return { error: null, avatarUrl: data.publicUrl };
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload avatar",
        variant: "destructive"
      });
      
      return { error: error as Error, avatarUrl: null };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAvatar,
    isUploading
  };
}
