import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const handleLogout = () => {
    signOut();
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">BarQR</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <nav className="hidden md:flex items-center space-x-6">
            {user ? <AuthenticatedNav /> : <UnauthenticatedNav />}
            
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar>
                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || user?.email} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => navigate('/signin')}>Sign In</Button>
              )}
            </div>
          </nav>
        </div>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 md:hidden" 
            onClick={toggleMenu}
          />
          
          <div className="fixed inset-y-0 right-0 w-64 bg-black/80 backdrop-blur-xl border-l border-white/10 transform transition-transform duration-300 ease-in-out md:hidden">
            <div className="p-6">
              <nav className="space-y-6">
                {user ? <MobileAuthenticatedNav /> : <MobileUnauthenticatedNav />}
                
                <div className="pt-4 border-t border-white/10">
                  {user ? (
                    <>
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar>
                          <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || user?.email} />
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-foreground truncate">
                            {user?.user_metadata?.full_name || user?.email}
                          </p>
                          <p className="text-xs text-foreground/70 truncate">{user?.email}</p>
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => navigate('/signin')}
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

const AuthenticatedNav = () => (
  <div className="flex items-center space-x-6">
    <Link
      to="/dashboard"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      Dashboard
    </Link>
    <Link
      to="/generate"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      Generate QR
    </Link>
    <Link
      to="/barcode"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      Barcode
    </Link>
  </div>
);

const UnauthenticatedNav = () => (
  <div className="flex items-center space-x-6">
    <Link
      to="/"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      Home
    </Link>
  </div>
);

const MobileAuthenticatedNav = () => (
  <div className="flex flex-col space-y-4">
    <Link
      to="/dashboard"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      Dashboard
    </Link>
    <Link
      to="/generate"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      Generate QR
    </Link>
    <Link
      to="/barcode"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      Barcode
    </Link>
  </div>
);

const MobileUnauthenticatedNav = () => (
  <div className="flex flex-col space-y-4">
    <Link
      to="/"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      Home
    </Link>
  </div>
);

export default Header;
