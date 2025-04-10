
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Menu, X, QrCode, BarCode, LayoutDashboard, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import Logo from "./Logo";

const Header = () => {
  const location = useLocation();
  const isMobile = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30 transition-all duration-300",
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

        {/* Desktop Navigation */}
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
                        <BarCode className="h-4 w-4 mr-1" />
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

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/profile" className="md:flex items-center hidden">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
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

      {/* Mobile Navigation Menu */}
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
                <BarCode className="h-5 w-5 mr-3" />
                Barcode
              </Link>
              <Link
                to="/profile"
                className="flex items-center px-4 py-3 text-lg font-medium"
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </Link>
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
