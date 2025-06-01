
import { QrCode, Users, Code, Mail, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HowItWorksSection = ({ scrolled }: { scrolled: boolean }) => {
  return (
    <section className={`py-20 3xl:py-28 4xl:py-36 bg-card/20 transition-all delay-900 duration-1000 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 3xl:mb-20 4xl:mb-24">
          <h2 className="text-3xl 3xl:text-4xl 4xl:text-5xl font-bold mb-4 3xl:mb-6 4xl:mb-8">How It Works</h2>
          <p className="text-gray-400 text-lg 3xl:text-xl 4xl:text-2xl max-w-2xl 3xl:max-w-4xl 4xl:max-w-5xl mx-auto">
            Create, customize, and track your QR codes in just a few simple steps
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 3xl:gap-16 4xl:gap-20 mb-12 3xl:mb-16 4xl:mb-20">
          <div className="flex-1 md:pr-10 3xl:pr-14 4xl:pr-16">
            <div className="flex items-center gap-4 3xl:gap-6 4xl:gap-8 mb-4 3xl:mb-6 4xl:mb-8">
              <div className="flex items-center justify-center w-8 h-8 3xl:w-10 3xl:h-10 4xl:w-12 4xl:h-12 rounded-full bg-primary text-primary-foreground font-medium text-sm 3xl:text-base 4xl:text-lg">
                1
              </div>
              <h3 className="text-xl 3xl:text-2xl 4xl:text-3xl font-bold">Choose your QR code type</h3>
            </div>
            <p className="text-gray-400 3xl:text-lg 4xl:text-xl ml-12 3xl:ml-16 4xl:ml-20">
              Select from URL, vCard, plain text, email, WiFi credentials, and more. Each type is optimized for its specific purpose.
            </p>
          </div>
          <div className="flex-1 bg-card rounded-xl 3xl:rounded-2xl 4xl:rounded-3xl border border-white/10 p-6 3xl:p-8 4xl:p-10 max-w-md 3xl:max-w-lg 4xl:max-w-xl">
            <div className="grid grid-cols-4 gap-4 3xl:gap-6 4xl:gap-8">
              <div className="bg-background p-3 3xl:p-4 4xl:p-5 rounded-lg 3xl:rounded-xl 4xl:rounded-2xl flex flex-col items-center gap-2 3xl:gap-3 4xl:gap-4 border border-white/10">
                <QrCode className="h-6 w-6 3xl:h-7 3xl:w-7 4xl:h-8 4xl:w-8 text-primary" />
                <span className="text-xs 3xl:text-sm 4xl:text-base">URL</span>
              </div>
              <div className="bg-background p-3 3xl:p-4 4xl:p-5 rounded-lg 3xl:rounded-xl 4xl:rounded-2xl flex flex-col items-center gap-2 3xl:gap-3 4xl:gap-4 border border-white/10">
                <Users className="h-6 w-6 3xl:h-7 3xl:w-7 4xl:h-8 4xl:w-8 text-primary" />
                <span className="text-xs 3xl:text-sm 4xl:text-base">vCard</span>
              </div>
              <div className="bg-background p-3 3xl:p-4 4xl:p-5 rounded-lg 3xl:rounded-xl 4xl:rounded-2xl flex flex-col items-center gap-2 3xl:gap-3 4xl:gap-4 border border-white/10">
                <Code className="h-6 w-6 3xl:h-7 3xl:w-7 4xl:h-8 4xl:w-8 text-primary" />
                <span className="text-xs 3xl:text-sm 4xl:text-base">Text</span>
              </div>
              <div className="bg-background p-3 3xl:p-4 4xl:p-5 rounded-lg 3xl:rounded-xl 4xl:rounded-2xl flex flex-col items-center gap-2 3xl:gap-3 4xl:gap-4 border border-white/10">
                <Mail className="h-6 w-6 3xl:h-7 3xl:w-7 4xl:h-8 4xl:w-8 text-primary" />
                <span className="text-xs 3xl:text-sm 4xl:text-base">Email</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 3xl:gap-16 4xl:gap-20 mb-12 3xl:mb-16 4xl:mb-20">
          <div className="flex-1 order-2 md:order-1 bg-card rounded-xl 3xl:rounded-2xl 4xl:rounded-3xl border border-white/10 p-6 3xl:p-8 4xl:p-10 max-w-md 3xl:max-w-lg 4xl:max-w-xl">
            <div className="flex flex-col gap-4 3xl:gap-6 4xl:gap-8">
              <div className="p-4 3xl:p-5 4xl:p-6 bg-background rounded-lg 3xl:rounded-xl 4xl:rounded-2xl border border-white/10">
                <p className="text-sm 3xl:text-base 4xl:text-lg mb-1 3xl:mb-2 4xl:mb-3">Enter your URL:</p>
                <div className="flex gap-2 3xl:gap-3 4xl:gap-4">
                  <Input placeholder="https://example.com" className="3xl:text-base 4xl:text-lg" />
                  <Button size="sm" className="3xl:text-base 4xl:text-lg 3xl:px-4 3xl:py-2 4xl:px-5 4xl:py-3">Create</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 3xl:gap-6 4xl:gap-8">
                <div className="flex items-center gap-2 3xl:gap-3 4xl:gap-4 bg-background p-3 3xl:p-4 4xl:p-5 rounded-lg 3xl:rounded-xl 4xl:rounded-2xl border border-white/10">
                  <Check className="h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6 text-primary" />
                  <span className="text-xs 3xl:text-sm 4xl:text-base">SEO friendly</span>
                </div>
                <div className="flex items-center gap-2 3xl:gap-3 4xl:gap-4 bg-background p-3 3xl:p-4 4xl:p-5 rounded-lg 3xl:rounded-xl 4xl:rounded-2xl border border-white/10">
                  <Check className="h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6 text-primary" />
                  <span className="text-xs 3xl:text-sm 4xl:text-base">High resolution</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 order-1 md:order-2 md:pl-10 3xl:pl-14 4xl:pl-16">
            <div className="flex items-center gap-4 3xl:gap-6 4xl:gap-8 mb-4 3xl:mb-6 4xl:mb-8">
              <div className="flex items-center justify-center w-8 h-8 3xl:w-10 3xl:h-10 4xl:w-12 4xl:h-12 rounded-full bg-primary text-primary-foreground font-medium text-sm 3xl:text-base 4xl:text-lg">
                2
              </div>
              <h3 className="text-xl 3xl:text-2xl 4xl:text-3xl font-bold">Input your content</h3>
            </div>
            <p className="text-gray-400 3xl:text-lg 4xl:text-xl ml-12 3xl:ml-16 4xl:ml-20">
              Enter the specific information for your QR code, such as your URL, contact information, or WiFi credentials. Our system validates your input to ensure it works correctly.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 3xl:gap-16 4xl:gap-20">
          <div className="flex-1 md:pr-10 3xl:pr-14 4xl:pr-16">
            <div className="flex items-center gap-4 3xl:gap-6 4xl:gap-8 mb-4 3xl:mb-6 4xl:mb-8">
              <div className="flex items-center justify-center w-8 h-8 3xl:w-10 3xl:h-10 4xl:w-12 4xl:h-12 rounded-full bg-primary text-primary-foreground font-medium text-sm 3xl:text-base 4xl:text-lg">
                3
              </div>
              <h3 className="text-xl 3xl:text-2xl 4xl:text-3xl font-bold">Customize and download</h3>
            </div>
            <p className="text-gray-400 3xl:text-lg 4xl:text-xl ml-12 3xl:ml-16 4xl:ml-20">
              Add your logo, change colors, or apply a frame to your QR code. Make it your own while ensuring it remains scannable. Download in multiple formats and start using it right away.
            </p>
          </div>
          <div className="flex-1 bg-card rounded-xl 3xl:rounded-2xl 4xl:rounded-3xl border border-white/10 p-6 3xl:p-8 4xl:p-10 max-w-md 3xl:max-w-lg 4xl:max-w-xl">
            <div className="flex gap-4 3xl:gap-6 4xl:gap-8">
              <QrCode className="h-28 w-28 3xl:h-32 3xl:w-32 4xl:h-36 4xl:w-36 text-primary bg-white p-3 3xl:p-4 4xl:p-5 rounded-lg 3xl:rounded-xl 4xl:rounded-2xl" />
              <div className="flex flex-col gap-3 3xl:gap-4 4xl:gap-5 flex-1">
                <div className="p-2 3xl:p-3 4xl:p-4 bg-background rounded-lg 3xl:rounded-xl 4xl:rounded-2xl border border-white/10 flex items-center justify-between">
                  <span className="text-xs 3xl:text-sm 4xl:text-base">Colors</span>
                  <div className="flex gap-1 3xl:gap-2 4xl:gap-3">
                    <div className="w-4 h-4 3xl:w-5 3xl:h-5 4xl:w-6 4xl:h-6 rounded-full bg-primary"></div>
                    <div className="w-4 h-4 3xl:w-5 3xl:h-5 4xl:w-6 4xl:h-6 rounded-full bg-blue-500"></div>
                    <div className="w-4 h-4 3xl:w-5 3xl:h-5 4xl:w-6 4xl:h-6 rounded-full bg-red-500"></div>
                  </div>
                </div>
                <div className="p-2 3xl:p-3 4xl:p-4 bg-background rounded-lg 3xl:rounded-xl 4xl:rounded-2xl border border-white/10 flex items-center justify-between">
                  <span className="text-xs 3xl:text-sm 4xl:text-base">Format</span>
                  <div className="flex gap-1 3xl:gap-2 4xl:gap-3">
                    <span className="text-xs 3xl:text-sm 4xl:text-base bg-primary/20 text-primary px-2 3xl:px-3 4xl:px-4 rounded">PNG</span>
                    <span className="text-xs 3xl:text-sm 4xl:text-base bg-primary/10 text-primary/60 px-2 3xl:px-3 4xl:px-4 rounded">SVG</span>
                  </div>
                </div>
                <Button size="sm" className="mt-1 3xl:text-base 4xl:text-lg 3xl:px-4 3xl:py-2 4xl:px-5 4xl:py-3">Download</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
