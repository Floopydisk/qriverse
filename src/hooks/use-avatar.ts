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
      
      // Generate a unique filename and create user-specific folder
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Get current user to ensure they're authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.id !== userId) {
        throw new Error("User not authenticated or unauthorized");
      }
      
      // Upload to the avatars bucket (user folder structure ensures proper RLS)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // This allows overwriting existing avatars
        });
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }

      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: filePath, // Store the storage path, not the full URL
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }
      
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully"
      });
      
      return filePath; // Return the storage path
    } catch (error: any) {
      console.error("Avatar upload error:", error);
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
    
    // If it's already a full URL (from external providers like Google), return as is
    if (path.startsWith('http')) {
      return path;
    }
    
    // Otherwise, get the public URL from Supabase storage
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
