
import React from "react";
import { Link } from "react-router-dom";
import { Github, Gitlab, Mail, User, Globe, Twitter, Linkedin, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Logo from "./Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full pt-16 pb-8 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-4 space-y-5">
            <Link to="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <span className="text-xl font-bold">QRGen</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Create and manage QR codes for all your needs, with powerful tracking and analytics. Our platform makes it easy to generate, customize, and track QR codes for any purpose.
            </p>
            <div className="flex items-center space-x-3">
              <a
                href="https://twitter.com/barqrapp"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card hover:bg-primary hover:text-white transition-colors p-2 rounded-md"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/Floopydisk"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card hover:bg-primary hover:text-white transition-colors p-2 rounded-md"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/barqr"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card hover:bg-primary hover:text-white transition-colors p-2 rounded-md"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-medium">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/generate" className="text-muted-foreground hover:text-primary transition-colors">Generate QR</Link>
              </li>
              <li>
                <Link to="/barcode" className="text-muted-foreground hover:text-primary transition-colors">Create Barcode</Link>
              </li>
              <li>
                <Link to="/scan" className="text-muted-foreground hover:text-primary transition-colors">Scan Code</Link>
              </li>
              <li>
                <Link to="/guides" className="text-muted-foreground hover:text-primary transition-colors">Guides</Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-medium">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Cookie Policy</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">GDPR</a>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-4 space-y-4">
            <h3 className="font-medium">Subscribe to our newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Get the latest updates on our features and services directly to your inbox.
            </p>
            <div className="flex">
              <Input
                type="email"
                placeholder="Enter your email"
                className="rounded-r-none"
              />
              <Button className="rounded-l-none">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
            <span>© {currentYear} QRGen.</span>
            <span>All rights reserved.</span>
            <span className="hidden md:inline">|</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500" /> by QRGen Team
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-card/50 rounded-full px-3 py-1 text-xs border border-border/50">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-foreground/80">All systems operational</span>
            </div>
            
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">Status</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
