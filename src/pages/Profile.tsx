
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile, UserProfile } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AvatarUpload from "@/components/profile/AvatarUpload";
import { ProfileInfoForm } from "@/components/profile/ProfileInfoForm";
import EmailForm from "@/components/profile/EmailForm";
import PasswordForm from "@/components/profile/PasswordForm";
import DeleteAccountDialog from "@/components/profile/DeleteAccountDialog";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const profile = await fetchUserProfile();
        setProfile(profile);
        
        if (profile?.avatar_url) {
          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(profile.avatar_url);
            
          if (data?.publicUrl) {
            setAvatarUrl(data.publicUrl);
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
  }, [user, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
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
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 pt-24 pb-12 max-w-[1400px]">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
          
          <div className="space-y-8">
            <ProfileInfoForm 
              profile={profile}
              onProfileUpdated={() => {
                // Refresh profile data
                fetchUserProfile().then(updatedProfile => {
                  setProfile(updatedProfile);
                  toast({
                    title: "Profile Updated",
                    description: "Your profile has been successfully updated",
                  });
                });
              }}
            />
            
            <EmailForm initialEmail={user.email || ""} />
            
            <PasswordForm />
            
            <DeleteAccountDialog 
              userId={user.id}
              userEmail={user.email || ""}
              profile={profile}
              signOut={signOut}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
