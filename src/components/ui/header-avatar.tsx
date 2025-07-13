/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAvatar } from "@/hooks/use-avatar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchUserProfile } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Home, Scan } from "lucide-react";
import { useEffect, useState } from "react";


const navigationItems = [
  { path: "/dashboard", label: "Return to Dashboard", icon: Home },
  // { path: "/dynamic-qr", label: "Dynamic QR", icon: QrCode },
  // { path: "/generate", label: "Create QR", icon: QrCode },
  // { path: "/barcode", label: "Create Barcode", icon: Barcode },
];

const HeaderAvatar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { getAvatarUrl } = useAvatar();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleSignOut() {
        try {
            await signOut();
            navigate("/");
            setMobileMenuOpen(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }

  useEffect(() => {
    const getUserProfile = async () => {
      if (user) {
        try {
          const profile = await fetchUserProfile();
          setProfileData(profile);
          
          if (profile?.avatar_url) {
            const url = getAvatarUrl(profile.avatar_url);
            setAvatarUrl(url);
          }
          
          if (profile?.username) {
            setDisplayName(profile.username);
          } else if (profile?.full_name) {
            setDisplayName(profile.full_name);
          } else {
            setDisplayName('User');
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    getUserProfile();
  }, [user, getAvatarUrl]);

  return (
    <div className="sticky top-0 z-10 backdrop-blur-sm ">
      <div className="flex justify-end p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-muted text-primary-foreground">
                  {(displayName || user.email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="xl:inline">Hi, {displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {navigationItems.map((item) => (
              <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => navigate("/scan")}>
                <Scan className="h-4 w-4 mr-2"/>
                Scan Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
);

};

export default HeaderAvatar;