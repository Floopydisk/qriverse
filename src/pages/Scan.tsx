
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";

const Scan = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <section className="max-w-4xl mx-auto text-center space-y-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-foreground">
            Scan <span className="text-primary">QR Code</span>
          </h1>
          
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Scan QR codes instantly using your device's camera or upload an image containing a QR code.
          </p>

          {/* QR Code scanner component will be added here in future updates */}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Scan;
