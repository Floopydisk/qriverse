
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
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
            <NavLinks />
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <nav className="px-4 pt-2 pb-4 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="flex flex-col space-y-2">
              <NavLinks />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

const NavLinks = () => (
  <>
    <Link
      to="/generate"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      Generate QR
    </Link>
    <Link
      to="/scan"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      Scan QR
    </Link>
    <Link
      to="/wifi"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      WiFi QR
    </Link>
    <Link
      to="/barcode"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      Barcode
    </Link>
  </>
);

export default Header;
