
import { Heart } from "lucide-react";
import FloatingCircles from "@/components/FloatingCircles";


const FooterAuth = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full pt-4 pb-4 border-t border-border">
      <FloatingCircles />
      <div className="container mx-auto px-4">

        <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
            <span>© {currentYear} QrLabs.</span>
            <span>All rights reserved.</span>
            <span className="hidden md:inline">|</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500" /> by QrLabs Team
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

export default FooterAuth;
