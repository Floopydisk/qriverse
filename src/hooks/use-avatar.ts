
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseAvatarUploadProps {
  userId: string;
}

interface AvatarUploadResult {
  error: Error | null;
  avatarUrl: string | null;
}

export function useAvatarUpload({ userId }: UseAvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const uploadAvatar = async (file: File): Promise<AvatarUploadResult> => {
    if (!userId) {
      return { error: new Error('User ID is required'), avatarUrl: null };
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 5MB",
        variant: "destructive",
      });
      return { error: new Error('File too large'), avatarUrl: null };
    }
    
    setIsUploading(true);
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Use the "profileavatars" bucket instead of "avatars"
      const { error: uploadError } = await supabase.storage
        .from('profileavatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('profileavatars')
        .getPublicUrl(filePath);
      
      // Update the user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath, updated_at: new Date().toISOString() })
        .eq('id', userId);
        
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully",
      });
      
      return { error: null, avatarUrl: data.publicUrl };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar image",
        variant: "destructive",
      });
      return { error: error as Error, avatarUrl: null };
    } finally {
      setIsUploading(false);
    }
  };
  
  return { uploadAvatar, isUploading };
}
