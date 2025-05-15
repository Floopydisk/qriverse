
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import AvatarUpload from "./AvatarUpload";

interface ProfileInfoFormProps {
  userId: string;
  initialFullName: string;
  initialUsername: string;
  avatarUrl: string | null;
  onAvatarChange: (url: string) => void;
}

export default function ProfileInfoForm({
  userId,
  initialFullName,
  initialUsername,
  avatarUrl,
  onAvatarChange
}: ProfileInfoFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [username, setUsername] = useState(initialUsername);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile(userId, {
        full_name: fullName,
        username: username
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
      
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your profile information and avatar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarUpload 
          userId={userId} 
          fullName={fullName} 
          avatarUrl={avatarUrl} 
          onAvatarChange={onAvatarChange} 
        />
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-background"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdateProfile}>Update Profile</Button>
      </CardFooter>
    </Card>
  );
}
