
import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Menu, X, QrCode, Barcode, LayoutDashboard, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import Logo from "./Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30 transition-all duration-300 w-full",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg shadow-sm py-3"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="text-xl font-bold">QRGen</span>
        </Link>

        {!isMobile && (
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              {user ? (
                <>
                  <NavigationMenuItem>
                    <Link to="/dashboard">
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-1" />
                        Dashboard
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link to="/generate">
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        Generate QR
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link to="/barcode">
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        <Barcode className="h-4 w-4 mr-1" />
                        Barcode
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </>
              ) : (
                <>
                  <NavigationMenuItem>
                    <Link to="/">
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        Home
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/generate">
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        Generate QR
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="md:flex items-center hidden">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="flex items-center" onClick={() => navigate("/profile")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center text-red-500" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {isMobile ? (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X /> : <Menu />}
                </Button>
              ) : null}
            </>
          ) : (
            <>
              <Link to="/signin" className="hidden md:block">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
              {isMobile ? (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X /> : <Menu />}
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>

      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 top-[72px] bg-background/95 backdrop-blur-sm z-20 flex flex-col p-6 pt-10 space-y-6 md:hidden">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-3 text-lg font-medium"
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
              <Link
                to="/generate"
                className="flex items-center px-4 py-3 text-lg font-medium"
              >
                <QrCode className="h-5 w-5 mr-3" />
                Generate QR
              </Link>
              <Link
                to="/barcode"
                className="flex items-center px-4 py-3 text-lg font-medium"
              >
                <Barcode className="h-5 w-5 mr-3" />
                Barcode
              </Link>
              <Link
                to="/profile"
                className="flex items-center px-4 py-3 text-lg font-medium"
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-3 text-lg font-medium text-red-500"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="flex items-center px-4 py-3 text-lg font-medium"
              >
                Home
              </Link>
              <Link
                to="/generate"
                className="flex items-center px-4 py-3 text-lg font-medium"
              >
                Generate QR
              </Link>
              <Link
                to="/signin"
                className="flex items-center px-4 py-3 text-lg font-medium bg-primary text-primary-foreground rounded-md justify-center mt-4"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
