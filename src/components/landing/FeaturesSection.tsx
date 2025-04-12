
import { QrCode, BarChart, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeaturesSection = ({ scrolled }: { scrolled: boolean }) => {
  const navigate = useNavigate();
  
  return (
    <section className={`py-24 relative transition-all delay-700 duration-1000 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything you need for QR success</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools you need to create, manage, and track your QR codes effectively.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Dynamic QR Codes</h3>
            <p className="text-gray-400 mb-4">
              Create QR codes that you can edit anytime without reprinting. Change destinations, update content, and fix typos instantly.
            </p>
            <Button variant="link" className="px-0 text-primary hover:text-primary/80" onClick={() => navigate("/generate")}>
              Create now <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-gray-400 mb-4">
              Track scans in real-time. Get insights on when, where, and how often your QR codes are being scanned to optimize your campaigns.
            </p>
            <Button variant="link" className="px-0 text-primary hover:text-primary/80" onClick={() => navigate("/guides")}>
              Learn more <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Custom Design</h3>
            <p className="text-gray-400 mb-4">
              Personalize your QR codes with colors, logos, and frames that match your brand identity while ensuring optimal scannability.
            </p>
            <Button variant="link" className="px-0 text-primary hover:text-primary/80" onClick={() => navigate("/signin")}>
              Try it now <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
