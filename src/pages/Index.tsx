
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Button } from "@/components/ui/button";
import { QrCode, Scan, Wifi, Barcode } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <section className="max-w-4xl mx-auto text-center space-y-8 animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Create and Scan QR Codes{" "}
            <span className="text-primary">Instantly</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
            Generate custom QR codes for your website, WiFi networks, or any text.
            Scan QR codes instantly with your camera.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <Button
              size="lg"
              className="group"
              onClick={() => navigate("/generate")}
            >
              <QrCode className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Generate QR Code
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="group"
              onClick={() => navigate("/scan")}
            >
              <Scan className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Scan QR Code
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
    description: "Scan any QR code instantly using your device's camera or upload an image from your device",
  },
  {
    icon: Wifi,
    title: "WiFi QR Codes",
    description: "Generate QR codes for easy WiFi network sharing",
  },
  {
    icon: Barcode,
    title: "Barcode Generator",
    description: "Create various types of barcodes for your products",
  },
];

export default Index;
