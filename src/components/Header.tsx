
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
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

      {/* Mobile menu with slide animation */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-background/95 backdrop-blur-xl border-l border-border transform transition-transform duration-300 ease-in-out md:hidden shadow-xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <nav className="space-y-6">
            <NavLinks />
          </nav>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={toggleMenu}
        />
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
      href="https://wa.me"
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground/80 hover:text-primary transition-colors"
    >
      WhatsApp Link
    </a>
  </div>
);

export default Header;
