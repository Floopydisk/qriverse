
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Upload } from "lucide-react";
import { useAvatar } from "@/hooks/use-avatar";

interface AvatarUploadProps {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  onAvatarChange: (url: string) => void;
}

export default function AvatarUpload({ userId, fullName, avatarUrl, onAvatarChange }: AvatarUploadProps) {
  const { uploadAvatar, isUploading, getAvatarUrl } = useAvatar();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    const newAvatarPath = await uploadAvatar(file, userId);
    
    if (newAvatarPath) {
      // Get the public URL from the new path
      const publicUrl = getAvatarUrl(newAvatarPath);
      if (publicUrl) {
        onAvatarChange(newAvatarPath);
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <Avatar className="h-24 w-24 border-2 border-primary/20">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={fullName || "Profile"} />
        ) : (
          <AvatarFallback className="text-lg bg-primary/10">
            {fullName ? fullName.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={() => document.getElementById('avatar-upload')?.click()}
          disabled={isUploading}
          className="w-full sm:w-auto"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload Avatar"}
        </Button>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
          disabled={isUploading}
        />
        <p className="text-xs text-muted-foreground">
          Recommended: Square image, 500x500 pixels or larger
        </p>
      </div>
    </div>
  );
}
