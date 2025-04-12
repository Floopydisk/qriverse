
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const CTASection = ({ scrolled }: { scrolled: boolean }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signin");
    }
  };

  return (
    <section className={`py-24 relative transition-all delay-1000 duration-1000 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/20 to-green-900/20 p-12 rounded-2xl border border-primary/30 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to create your first QR code?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Get started for free today and experience the full power of dynamic QR codes.
            No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Create Free QR Code
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link to="/guides">
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent border-white/20 hover:bg-white/10 text-white"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View Guides
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
