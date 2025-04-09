
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Button } from "@/components/ui/button";
import { QrCode, Scan, Wifi, Barcode, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signin");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Only show the landing page for non-authenticated users
  if (user) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <section className="max-w-4xl mx-auto text-center space-y-8 animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Create and Manage QR Codes{" "}
            <span className="text-primary">With Ease</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
            BarQR helps you create, organize, and track QR codes for all your needs. 
            Generate custom QR codes for your website, WiFi networks, or any text, 
            and manage them all in one place.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <Button
              size="lg"
              className="group"
              onClick={handleGetStarted}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </section>

        <section className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
};

const features = [
  {
    icon: QrCode,
    title: "QR Generator",
    description: "Create custom QR codes with your brand colors and logo",
  },
  {
    icon: Scan,
    title: "QR Scanner",
    description: "Scan any QR code instantly using your device's camera",
  },
  {
    icon: Wifi,
    title: "WiFi QR Codes",
    description: "Generate QR codes for easy WiFi network sharing",
  },
  {
    icon: Barcode,
    title: "Organization",
    description: "Group your QR codes into folders and manage them easily",
  },
];

export default Index;
