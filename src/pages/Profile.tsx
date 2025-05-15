
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

// Import refactored components
import ProfileInfoForm from "@/components/profile/ProfileInfoForm";
import EmailForm from "@/components/profile/EmailForm";
import PasswordForm from "@/components/profile/PasswordForm";
import DeleteAccountDialog from "@/components/profile/DeleteAccountDialog";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const profile = await fetchUserProfile(user.id);
        setProfile(profile);
        
        if (profile?.avatar_url) {
          // Update to use the 'profileavatars' bucket instead of 'avatars'
          const { data } = supabase.storage
            .from('profileavatars')
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
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 pt-24 pb-12 max-w-[1400px]">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
          
          <div className="space-y-8">
            <ProfileInfoForm 
              userId={user.id} 
              initialFullName={profile?.full_name || ""}
              initialUsername={profile?.username || ""}
              avatarUrl={avatarUrl}
              onAvatarChange={setAvatarUrl}
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
