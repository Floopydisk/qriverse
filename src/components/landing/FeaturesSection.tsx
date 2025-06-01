
import { QrCode, BarChart, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeaturesSection = ({ scrolled }: { scrolled: boolean }) => {
  const navigate = useNavigate();
  
  return (
    <section className={`py-24 3xl:py-32 4xl:py-40 relative transition-all delay-700 duration-1000 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 3xl:mb-20 4xl:mb-24">
          <h2 className="text-3xl 3xl:text-4xl 4xl:text-5xl font-bold mb-4 3xl:mb-6 4xl:mb-8">Everything you need for QR success</h2>
          <p className="text-gray-400 text-lg 3xl:text-xl 4xl:text-2xl max-w-2xl 3xl:max-w-4xl 4xl:max-w-5xl mx-auto">
            Our comprehensive platform provides all the tools you need to create, manage, and track your QR codes effectively.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 3xl:gap-12 4xl:gap-16">
          <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl 3xl:rounded-2xl 4xl:rounded-3xl p-6 3xl:p-8 4xl:p-10 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 3xl:w-16 3xl:h-16 4xl:w-20 4xl:h-20 bg-primary/20 rounded-lg 3xl:rounded-xl 4xl:rounded-2xl flex items-center justify-center mb-4 3xl:mb-6 4xl:mb-8">
              <QrCode className="h-6 w-6 3xl:h-8 3xl:w-8 4xl:h-10 4xl:w-10 text-primary" />
            </div>
            <h3 className="text-xl 3xl:text-2xl 4xl:text-3xl font-semibold mb-2 3xl:mb-3 4xl:mb-4">Dynamic QR Codes</h3>
            <p className="text-gray-400 3xl:text-lg 4xl:text-xl mb-4 3xl:mb-6 4xl:mb-8">
              Create QR codes that you can edit anytime without reprinting. Change destinations, update content, and fix typos instantly.
            </p>
            <Button variant="link" className="px-0 text-primary hover:text-primary/80 3xl:text-lg 4xl:text-xl" onClick={() => navigate("/generate")}>
              Create now <ArrowRight className="ml-1 h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
            </Button>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl 3xl:rounded-2xl 4xl:rounded-3xl p-6 3xl:p-8 4xl:p-10 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 3xl:w-16 3xl:h-16 4xl:w-20 4xl:h-20 bg-primary/20 rounded-lg 3xl:rounded-xl 4xl:rounded-2xl flex items-center justify-center mb-4 3xl:mb-6 4xl:mb-8">
              <BarChart className="h-6 w-6 3xl:h-8 3xl:w-8 4xl:h-10 4xl:w-10 text-primary" />
            </div>
            <h3 className="text-xl 3xl:text-2xl 4xl:text-3xl font-semibold mb-2 3xl:mb-3 4xl:mb-4">Advanced Analytics</h3>
            <p className="text-gray-400 3xl:text-lg 4xl:text-xl mb-4 3xl:mb-6 4xl:mb-8">
              Track scans in real-time. Get insights on when, where, and how often your QR codes are being scanned to optimize your campaigns.
            </p>
            <Button variant="link" className="px-0 text-primary hover:text-primary/80 3xl:text-lg 4xl:text-xl" onClick={() => navigate("/guides")}>
              Learn more <ArrowRight className="ml-1 h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
            </Button>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl 3xl:rounded-2xl 4xl:rounded-3xl p-6 3xl:p-8 4xl:p-10 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 3xl:w-16 3xl:h-16 4xl:w-20 4xl:h-20 bg-primary/20 rounded-lg 3xl:rounded-xl 4xl:rounded-2xl flex items-center justify-center mb-4 3xl:mb-6 4xl:mb-8">
              <Smartphone className="h-6 w-6 3xl:h-8 3xl:w-8 4xl:h-10 4xl:w-10 text-primary" />
            </div>
            <h3 className="text-xl 3xl:text-2xl 4xl:text-3xl font-semibold mb-2 3xl:mb-3 4xl:mb-4">Custom Design</h3>
            <p className="text-gray-400 3xl:text-lg 4xl:text-xl mb-4 3xl:mb-6 4xl:mb-8">
              Personalize your QR codes with colors, logos, and frames that match your brand identity while ensuring optimal scannability.
            </p>
            <Button variant="link" className="px-0 text-primary hover:text-primary/80 3xl:text-lg 4xl:text-xl" onClick={() => navigate("/signin")}>
              Try it now <ArrowRight className="ml-1 h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
