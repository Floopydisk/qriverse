
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
    <section className={`py-24 3xl:py-32 4xl:py-40 relative transition-all delay-1000 duration-1000 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl 3xl:max-w-6xl 4xl:max-w-8xl mx-auto bg-gradient-to-r from-primary/20 to-green-900/20 p-12 3xl:p-16 4xl:p-20 rounded-2xl 3xl:rounded-3xl 4xl:rounded-4xl border border-primary/30 text-center">
          <h2 className="text-3xl 3xl:text-4xl 4xl:text-5xl font-bold mb-4 3xl:mb-6 4xl:mb-8">Ready to create your first QR code?</h2>
          <p className="text-gray-300 text-lg 3xl:text-xl 4xl:text-2xl mb-8 3xl:mb-10 4xl:mb-12 max-w-xl 3xl:max-w-2xl 4xl:max-w-3xl mx-auto">
            Get started for free today and experience the full power of dynamic QR codes.
            No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 3xl:gap-6 4xl:gap-8 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-white text-base 3xl:text-lg 4xl:text-xl px-6 py-3 3xl:px-8 3xl:py-4 4xl:px-10 4xl:py-5"
            >
              Create Free QR Code
              <ArrowRight className="ml-2 h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
            </Button>
            <Link to="/guides">
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent border-white/20 hover:bg-white/10 text-white text-base 3xl:text-lg 4xl:text-xl px-6 py-3 3xl:px-8 3xl:py-4 4xl:px-10 4xl:py-5"
              >
                <BookOpen className="mr-2 h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
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
