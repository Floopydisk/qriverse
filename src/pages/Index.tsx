
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Import the new components
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CTASection from "@/components/landing/CTASection";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Trigger scroll animation on mount
  useEffect(() => {
    setScrolled(true);
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0B10]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Only show the landing page for non-authenticated users
  if (user) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0C0B10] text-white">
      <div className="fixed w-full z-50">
        <Header />
      </div>
      
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection scrolled={scrolled} />
        <HowItWorksSection scrolled={scrolled} />
        <CTASection scrolled={scrolled} />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
