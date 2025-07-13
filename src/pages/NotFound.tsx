import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { HTMLProps } from "react";
import { twMerge } from "tailwind-merge";
import Header from "@/components/Header";
import FloatingCircles from "@/components/FloatingCircles";
import { Button } from "@/components/ui/button";


export const Container = ({
  className,
  ...props
}: HTMLProps<HTMLDivElement>) => {
  return (
    <div className={twMerge("mx-auto max-w-8xl px-4", className)} {...props} />
  );
};

const NotFound = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // return (
  //   <div className="min-h-screen flex items-center justify-center bg-gray-100">
  //     <div className="text-center">
  //       <h1 className="text-4xl font-bold mb-4">404</h1>
  //       <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
  //       <a href="/" className="text-blue-500 hover:text-blue-700 underline">
  //         Return to Home
  //       </a>
  //     </div>
  //   </div>
  // );

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
   };
  return (
    <>
    <Header/>
    <FloatingCircles/>
      <div className="min-h-full px-4 py-4 mt-20 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="mx-auto max-w-max">
          <Container className="mt-5">
            <div className="flex mt-6">
              <p className="text-4xl font-extrabold text-blue600 sm:text-5xl">
                Oops!
              </p>
              <div className="ml-6">
                <div className="pl-6 border-l border-gray500">
                  <h2 className="text-3xl font-bold tracking-tight text-gray900 dark:text-white sm:text-4xl">
                    Well this is quite......embarrassing!
                  </h2>
                  <p className="mt-3 text-lg text-gray500 dark:text-white">
                    You seem to be lost......that makes both of us.
                  </p>
                  <p className="mt-0 text-lg text-gray500 dark:text-white">
                    It's not your fault though. I probably broke something or haven't finished developing it.
                  </p>
                </div>
                <div className="flex mt-10 space-x-3 sm:pl-6">
                  <Button
                    variant="default"
                    className="justify-start h-12 text-base text-white hover:bg-black"
                    onClick={() => handleNavigation("/")}>
                      Go home
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
};

export default NotFound;
