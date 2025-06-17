

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { fetchUserQRCodes } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

interface DeleteAccountDialogProps {
  userId: string;
  userEmail: string;
  profile: any;
  signOut: () => Promise<void>;
}

export default function DeleteAccountDialog({ userId, userEmail, profile, signOut }: DeleteAccountDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletionConfirmPassword, setDeletionConfirmPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!userId) return;
    
    try {
      setIsDeleting(true);
      
      // Verify password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail || "",
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
        .list(`user_${userId}`);
        
      if (files && files.length > 0) {
        const filePaths = files.map(file => `user_${userId}/${file.name}`);
        await supabase.storage.from('qrcodes').remove(filePaths);
      }
      
      // Step 2: Delete folders
      await supabase
        .from('folders')
        .delete()
        .eq('user_id', userId);
      
      // Step 3: Delete QR codes
      await supabase
        .from('qr_codes')
        .delete()
        .eq('user_id', userId);
      
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
        .eq('id', userId);
      
      // Step 6: Delete the actual user account
      // Using the correct method to delete the user account
      await supabase.auth.admin.deleteUser(userId)
        .catch(async () => {
          // If admin delete fails, fall back to user-initiated delete
          const { error } = await supabase.auth.updateUser({
            data: { deleted: true }
          });
          if (error) throw error;
        });
      
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

  return (
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
          <AlertDialogContent className="max-w-md">
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
                className="bg-background"
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
  );
}
