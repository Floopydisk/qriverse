
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Barcode, QrCode, User, LogOut, Settings, Home } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "@/hooks/use-auth";
import { useAvatar } from "@/hooks/use-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchUserProfile } from "@/lib/api";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const { getAvatarUrl } = useAvatar();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  useEffect(() => {
    const getUserProfile = async () => {
      if (user?.id) {
        try {
          const profile = await fetchUserProfile(user.id);
          setProfileData(profile);
          
          if (profile?.avatar_url) {
            const url = getAvatarUrl(profile.avatar_url);
            setAvatarUrl(url);
          }
          
          if (profile?.username) {
            setUsername(profile.username);
          } else if (profile?.full_name) {
            setUsername(profile.full_name);
          } else {
            setUsername('User');
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    getUserProfile();
  }, [user, getAvatarUrl]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Add debugging console logs
  console.log("User authenticated:", !!user);
  console.log("Current path:", location.pathname);
  console.log("Is homepage:", isHomePage);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHomePage
          ? "bg-background/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-xl font-bold text-foreground">QR Gen</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden md:flex md:items-center md:gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">
                    <Home className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/generate">
                    <QrCode className="h-4 w-4 mr-1" />
                    Create QR
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/barcode">
                    <Barcode className="h-4 w-4 mr-1" />
                    Create Barcode
                  </Link>
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(username || user.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">Hi, {username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/generate")}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Create QR Code
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/barcode")}>
                    <Barcode className="h-4 w-4 mr-2" />
                    Create Barcode
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
            </>
          ) : (
            <Button size="sm" asChild className="!flex !items-center">
              <Link to="/signin">
                <User className="h-4 w-4 mr-1" />
                Sign in
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
