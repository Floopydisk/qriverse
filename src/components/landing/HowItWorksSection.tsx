
import { QrCode, Users, Code, Mail, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HowItWorksSection = ({ scrolled }: { scrolled: boolean }) => {
  return (
    <section className={`py-20 bg-card/20 transition-all delay-900 duration-1000 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Create, customize, and track your QR codes in just a few simple steps
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
          <div className="flex-1 md:pr-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium text-sm">
                1
              </div>
              <h3 className="text-xl font-bold">Choose your QR code type</h3>
            </div>
            <p className="text-gray-400 ml-12">
              Select from URL, vCard, plain text, email, WiFi credentials, and more. Each type is optimized for its specific purpose.
            </p>
          </div>
          <div className="flex-1 bg-card rounded-xl border border-white/10 p-6 max-w-md">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-background p-3 rounded-lg flex flex-col items-center gap-2 border border-white/10">
                <QrCode className="h-6 w-6 text-primary" />
                <span className="text-xs">URL</span>
              </div>
              <div className="bg-background p-3 rounded-lg flex flex-col items-center gap-2 border border-white/10">
                <Users className="h-6 w-6 text-primary" />
                <span className="text-xs">vCard</span>
              </div>
              <div className="bg-background p-3 rounded-lg flex flex-col items-center gap-2 border border-white/10">
                <Code className="h-6 w-6 text-primary" />
                <span className="text-xs">Text</span>
              </div>
              <div className="bg-background p-3 rounded-lg flex flex-col items-center gap-2 border border-white/10">
                <Mail className="h-6 w-6 text-primary" />
                <span className="text-xs">Email</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
          <div className="flex-1 order-2 md:order-1 bg-card rounded-xl border border-white/10 p-6 max-w-md">
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-background rounded-lg border border-white/10">
                <p className="text-sm mb-1">Enter your URL:</p>
                <div className="flex gap-2">
                  <Input placeholder="https://example.com" />
                  <Button size="sm">Create</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-white/10">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-xs">SEO friendly</span>
                </div>
                <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-white/10">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-xs">High resolution</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 order-1 md:order-2 md:pl-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium text-sm">
                2
              </div>
              <h3 className="text-xl font-bold">Input your content</h3>
            </div>
            <p className="text-gray-400 ml-12">
              Enter the specific information for your QR code, such as your URL, contact information, or WiFi credentials. Our system validates your input to ensure it works correctly.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex-1 md:pr-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium text-sm">
                3
              </div>
              <h3 className="text-xl font-bold">Customize and download</h3>
            </div>
            <p className="text-gray-400 ml-12">
              Add your logo, change colors, or apply a frame to your QR code. Make it your own while ensuring it remains scannable. Download in multiple formats and start using it right away.
            </p>
          </div>
          <div className="flex-1 bg-card rounded-xl border border-white/10 p-6 max-w-md">
            <div className="flex gap-4">
              <QrCode className="h-28 w-28 text-primary bg-white p-3 rounded-lg" />
              <div className="flex flex-col gap-3 flex-1">
                <div className="p-2 bg-background rounded-lg border border-white/10 flex items-center justify-between">
                  <span className="text-xs">Colors</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-full bg-primary"></div>
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  </div>
                </div>
                <div className="p-2 bg-background rounded-lg border border-white/10 flex items-center justify-between">
                  <span className="text-xs">Format</span>
                  <div className="flex gap-1">
                    <span className="text-xs bg-primary/20 text-primary px-2 rounded">PNG</span>
                    <span className="text-xs bg-primary/10 text-primary/60 px-2 rounded">SVG</span>
                  </div>
                </div>
                <Button size="sm" className="mt-1">Download</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
