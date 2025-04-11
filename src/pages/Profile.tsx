import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserProfile, updateUserProfile, fetchUserQRCodes, QRCode } from "@/lib/api";
import { User, Mail, Key, Trash2, Upload, LogOut, AlertCircle } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [deletionConfirmPassword, setDeletionConfirmPassword] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const profile = await fetchUserProfile(user.id);
        setProfile(profile);
        setFullName(profile?.full_name || "");
        setUsername(profile?.username || "");
        setEmail(user.email || "");
        
        if (profile?.avatar_url) {
          const { data, error } = await supabase.storage
            .from('avatars')
            .download(profile.avatar_url);
          
          if (data && !error) {
            const url = URL.createObjectURL(data);
            setAvatarUrl(url);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
    
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [user]);

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) return;
    
    try {
      setUploading(true);
      
      const { error: bucketError } = await supabase.storage.getBucket('avatars');
      
      if (bucketError && bucketError.message.includes('does not exist')) {
        await supabase.storage.createBucket('avatars', {
          public: true
        });
      }
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        });
      
      if (error) throw error;
      
      await updateUserProfile(user.id, {
        avatar_url: filePath
      });
      
      const url = URL.createObjectURL(file);
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
      setAvatarUrl(url);
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully"
      });
      
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      await updateUserProfile(user.id, {
        full_name: fullName,
        username: username
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
      
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEmail = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        email: email 
      });
      
      if (error) throw error;
      
      toast({
        title: "Email Update Initiated",
        description: "Please check your new email for a confirmation link"
      });
      
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully"
      });
      
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      
      // Verify password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || "",
        password: deletionConfirmPassword,
      });
      
      if (signInError) {
        toast({
          title: "Error",
          description: "Incorrect password. Please try again.",
          variant: "destructive",
        });
        setIsDeleting(false);
        return;
      }
      
      // Step 1: Delete QR codes from database and storage
      const qrCodes = await fetchUserQRCodes();
      
      // Delete QR code files from storage
      for (const qrCode of qrCodes) {
        if (qrCode.options && typeof qrCode.options === 'object' && 'storagePath' in qrCode.options) {
          await supabase.storage
            .from('qrcodes')
            .remove([qrCode.options.storagePath as string]);
        }
      }
      
      // Delete all files in the user's folder
      const { data: files } = await supabase.storage
        .from('qrcodes')
        .list(`user_${user.id}`);
        
      if (files && files.length > 0) {
        const filePaths = files.map(file => `user_${user.id}/${file.name}`);
        await supabase.storage.from('qrcodes').remove(filePaths);
      }
      
      // Step 2: Delete folders
      await supabase
        .from('folders')
        .delete()
        .eq('user_id', user.id);
      
      // Step 3: Delete QR codes
      await supabase
        .from('qr_codes')
        .delete()
        .eq('user_id', user.id);
      
      // Step 4: Delete avatar if exists
      if (profile?.avatar_url) {
        await supabase.storage
          .from('avatars')
          .remove([profile.avatar_url]);
      }
      
      // Step 5: Delete user profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      // Step 6: Delete the actual user account
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        // If admin delete fails, try to delete via regular auth
        await supabase.auth.deleteUser();
      }
      
      // Step 7: Sign out and redirect
      await signOut();
      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted",
      });
      navigate('/');
      
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setDeletionConfirmPassword("");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <FloatingCircles />
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile information and avatar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Avatar className="h-24 w-24">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={fullName || "Profile"} />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {fullName ? fullName.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={uploading}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload Avatar"}
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={uploadAvatar}
                      disabled={uploading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: Square image, 500x500 pixels or larger
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpdateProfile}>Update Profile</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Email Address</CardTitle>
                <CardDescription>Update your email address</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpdateEmail}>Update Email</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpdatePassword} disabled={!newPassword || newPassword !== confirmPassword}>
                  Update Password
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-destructive/50">
              <CardHeader className="text-destructive">
                <CardTitle>Delete Account</CardTitle>
                <CardDescription>Permanently delete your account and all associated data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This action cannot be undone. It will permanently delete your account, all QR codes, folders, 
                  and any other data associated with your account.
                </p>
                
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All of your data will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        Please enter your password to confirm:
                      </p>
                      <Input
                        type="password"
                        placeholder="Password"
                        value={deletionConfirmPassword}
                        onChange={(e) => setDeletionConfirmPassword(e.target.value)}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteAccount();
                        }}
                        disabled={!deletionConfirmPassword || isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <span className="mr-2">Deleting</span>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                          </>
                        ) : (
                          "Delete Account"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
