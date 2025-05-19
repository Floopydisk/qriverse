
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useAvatar() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      setError(null);
      
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        setError("File must be an image");
        toast({
          title: "Error",
          description: "File must be an image",
          variant: "destructive",
        });
        return null;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        toast({
          title: "Error",
          description: "Image size must be less than 2MB",
          variant: "destructive",
        });
        return null;
      }
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload to the avatars bucket instead of profileavatars
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the URL of the uploaded avatar
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully"
      });
      
      return filePath; // Return the storage path
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const getAvatarUrl = (path: string | null): string | null => {
    if (!path) return null;
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);
      
    return data?.publicUrl || null;
  };

  return {
    uploadAvatar,
    getAvatarUrl,
    isUploading,
    error,
  };
}
