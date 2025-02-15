
import { Github, Gitlab, Mail, User } from "lucide-react";
import ./Footer.css;

const Footer = () => {
  return (
    <footer className="w-full py-6 bg-background/80 backdrop-blur-md border-t border-border mt-auto"> 
    <div className="container mx-auto px-4">
        <div className="status-container">
          <span className="green-dot"></span> All systems are working
        </div> 
        <div className="flex justify-center space-x-6">
          <a
            href="https://github.com/Floopydisk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/60 hover:text-primary transition-colors"
          >
            <Github className="h-6 w-6" />
          </a>
          <a
            href="https://gitlab.com/Flopydisk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/60 hover:text-primary transition-colors"
          >
            <Gitlab className="h-6 w-6" />
          </a>
          <a
            href="mailto:sibukunodunsi@gmail.com"
            className="text-foreground/60 hover:text-primary transition-colors"
          >
            <Mail className="h-6 w-6" />
          </a>
          <a
            href="https://ibukunodunsi.vercel.app"
            className="text-foreground/60 hover:text-primary transition-colors"
          >
            <User className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
