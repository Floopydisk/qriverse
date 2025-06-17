/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Barcode, QrCode, User, LogOut, Settings, Home, Menu } from "lucide-react";
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
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/dynamic-qr", label: "Dynamic QR", icon: QrCode },
    { path: "/generate", label: "Create QR", icon: QrCode },
    { path: "/barcode", label: "Create Barcode", icon: Barcode },
  ];

  const guestNavigationItems = [
    { path: "/guides", label: "Guides" },
    { path: "/scan", label: "Scan" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHomePage
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-xl font-bold text-foreground">QrLabs</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Desktop Navigation */}
              <div className="hidden lg:flex lg:items-center lg:gap-2">
                {navigationItems.map((item) => (
                  <Button key={item.path} variant="ghost" size="sm" asChild>
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4 mr-1" />
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </div>

              {/* Mobile Navigation Sheet */}
              <div className="lg:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 px-4">
                    <SheetHeader className="pb-6">
                      <SheetTitle className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={avatarUrl || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {(displayName || user.email || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>Hi, {displayName}</span>
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex flex-col space-y-2">
                      {navigationItems.map((item) => (
                        <Button
                          key={item.path}
                          variant="ghost"
                          className="justify-start h-12 text-base"
                          onClick={() => handleNavigation(item.path)}
                        >
                          <item.icon className="h-5 w-5 mr-3" />
                          {item.label}
                        </Button>
                      ))}
                      
                      <div className="border-t pt-4 mt-4">
                        <Button
                          variant="ghost"
                          className="justify-start h-12 text-base w-full"
                          onClick={() => handleNavigation("/profile")}
                        >
                          <Settings className="h-5 w-5 mr-3" />
                          Settings
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start h-12 text-base w-full text-red-600 hover:text-red-700"
                          onClick={handleSignOut}
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          Sign out
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop User Menu */}
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {(displayName || user.email || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden xl:inline">Hi, {displayName}</span>
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
            </>
          ) : (
            <>
              {/* Guest Navigation */}
              <div className="hidden md:flex md:items-center md:gap-2">
                {guestNavigationItems.map((item) => (
                  <Button key={item.path} variant="ghost" size="sm" asChild>
                    <Link to={item.path}>
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </div>

              {/* Mobile Guest Menu */}
              <div className="md:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 px-4">
                    <SheetHeader className="pb-6">
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex flex-col space-y-2">
                      {guestNavigationItems.map((item) => (
                        <Button
                          key={item.path}
                          variant="ghost"
                          className="justify-start h-12 text-base"
                          onClick={() => handleNavigation(item.path)}
                        >
                          {item.label}
                        </Button>
                      ))}
                      
                      <div className="border-t pt-4 mt-4">
                        <Button
                          className="w-full h-12 text-base"
                          onClick={() => handleNavigation("/signin")}
                        >
                          <User className="h-5 w-5 mr-3" />
                          Sign in
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <Button size="sm" className="hidden md:flex items-center" asChild>
                <Link to="/signin">
                  <User className="h-4 w-4 mr-1" />
                  Sign in
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
