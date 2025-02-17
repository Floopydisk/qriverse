
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

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
            <NavLinks />
          </nav>
        </div>
      </div>

      {/* Side Panel for Mobile */}
      {isOpen && (
        <>
          {/* Dark Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 md:hidden" 
            onClick={toggleMenu}
          />
          
          {/* Side Panel */}
          <div className="fixed inset-y-0 right-0 w-64 bg-black/80 backdrop-blur-xl border-l border-white/10 transform transition-transform duration-300 ease-in-out md:hidden">
            <div className="p-6">
              <nav className="space-y-6">
                <NavLinks />
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

const NavLinks = () => (
  <div className="flex md:flex-row flex-col md:items-center md:space-x-6 space-y-4 md:space-y-0">
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
    <a
      href="https://https://whatsapplinkgen.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      Link Generator
    </a>
  </div>
);

export default Header;
