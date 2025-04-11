
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, QrCode, Settings, HelpCircle } from "lucide-react";

const Guides = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed w-full z-50">
        <Header />
      </div>

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* How to create a QR code section */}
          <section className="mb-20">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
              How do I create a free QR Code?
            </h1>
            <p className="text-center text-muted-foreground mb-16">
              We'll show you how in just three simple steps
            </p>

            <div className="relative">
              {/* Timeline connector */}
              <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-0.5 bg-primary/20 -translate-x-1/2"></div>

              {/* Step 1 */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-16 mb-20 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-card rounded-xl p-8 flex gap-4 flex-wrap shadow-sm border border-border">
                    <div className="p-4 bg-background border border-border rounded-md flex flex-col items-center gap-2">
                      <QrCode className="h-6 w-6" />
                      <span className="text-xs">URL</span>
                    </div>
                    <div className="p-4 bg-background border border-border rounded-md flex flex-col items-center gap-2">
                      <QrCode className="h-6 w-6" />
                      <span className="text-xs">vCARD</span>
                    </div>
                    <div className="p-4 bg-background border border-border rounded-md flex flex-col items-center gap-2">
                      <QrCode className="h-6 w-6" />
                      <span className="text-xs">TEXT</span>
                    </div>
                    <div className="p-4 bg-background border border-border rounded-md flex flex-col items-center gap-2">
                      <QrCode className="h-6 w-6" />
                      <span className="text-xs">E-MAIL</span>
                    </div>
                    <div className="p-4 bg-background border border-border rounded-md flex flex-col items-center gap-2">
                      <QrCode className="h-6 w-6" />
                      <span className="text-xs">TWITTER</span>
                    </div>
                    <div className="p-4 bg-background border border-border rounded-md flex flex-col items-center gap-2">
                      <QrCode className="h-6 w-6" />
                      <span className="text-xs">BITCOIN</span>
                    </div>
                    <div className="p-4 bg-background border border-border rounded-md flex flex-col items-center gap-2">
                      <QrCode className="h-6 w-6" />
                      <span className="text-xs">SMS</span>
                    </div>
                    <div className="p-4 bg-background border border-border rounded-md flex flex-col items-center gap-2">
                      <QrCode className="h-6 w-6" />
                      <span className="text-xs">WIFI</span>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2 relative">
                  <div className="md:hidden w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span>1</span>
                  </div>
                  <div className="hidden md:flex absolute left-0 top-0 -translate-x-[calc(100%+2rem)] items-center justify-center w-10 h-10 bg-primary text-white rounded-full">
                    <span>1</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Select which type</h2>
                  <p className="text-muted-foreground">
                    You may choose from URL, vCard, Plain Text, Email, SMS, Twitter, WiFi, and Bitcoin. However, these free QR Codes are not editable and trackable.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-16 mb-20 items-center">
                <div className="relative">
                  <div className="md:hidden w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span>2</span>
                  </div>
                  <div className="hidden md:flex absolute right-0 top-0 translate-x-[calc(100%+2rem)] items-center justify-center w-10 h-10 bg-primary text-white rounded-full">
                    <span>2</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Fill in the details</h2>
                  <p className="text-muted-foreground">
                    Enter all the information needed in the fields that appear. This could be a link, contact information, text or any other type of info. Once you're done, select "Generate."
                  </p>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col items-center">
                  <div className="w-full max-w-sm p-4 bg-background rounded-md border border-border mb-4">
                    <p className="text-center text-sm mb-2">Enter your website, text or drop a file here</p>
                    <p className="text-center text-xs text-muted-foreground">(Your QR Code will be generated automatically)</p>
                    <div className="flex justify-center mt-4">
                      <div className="border-2 border-dashed border-border rounded-md p-4 w-full flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 mb-1 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <span className="text-xs text-muted-foreground">upload.png.file, .pdf, .docx, .pptx</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                <div className="order-2 md:order-1">
                  <div className="flex gap-8">
                    <div className="bg-card rounded-xl p-4 shadow-sm border border-border flex-1">
                      <div className="p-4 flex justify-center">
                        <QrCode className="h-32 w-32" />
                      </div>
                    </div>
                    <div className="bg-card rounded-xl p-4 shadow-sm border border-border flex-1">
                      <p className="text-sm font-medium mb-4">FRAMES</p>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="p-2 bg-background rounded-md flex items-center justify-center border border-border">
                          <div className="w-8 h-8 rounded-md border border-muted"></div>
                        </div>
                        <div className="p-2 bg-background rounded-md flex items-center justify-center border border-border">
                          <div className="w-8 h-8 rounded-full border border-muted"></div>
                        </div>
                        <div className="p-2 bg-background rounded-md flex items-center justify-center border border-border">
                          <div className="w-8 h-8 rounded-md border-2 border-muted"></div>
                        </div>
                        <div className="p-2 bg-background rounded-md flex items-center justify-center border border-border">
                          <div className="w-6 h-8 rounded-md border border-muted"></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium">SHAPE & COLOR</p>
                        <div className="h-6 w-full bg-background rounded-md border border-border"></div>
                        <p className="text-sm font-medium">LOGO</p>
                        <div className="h-6 w-full bg-background rounded-md border border-border"></div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1 bg-primary">DOWNLOAD</Button>
                        <Button size="sm" variant="outline" className="flex-1">VECTOR</Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2 relative">
                  <div className="md:hidden w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span>3</span>
                  </div>
                  <div className="hidden md:flex absolute left-0 top-0 -translate-x-[calc(100%+2rem)] items-center justify-center w-10 h-10 bg-primary text-white rounded-full">
                    <span>3</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Download the QR Code</h2>
                  <p className="text-muted-foreground">
                    You may choose to have a standard black and white design or choose colors and frames to help you attract more scans. If not, proceed to download your finished Code.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator className="my-16" />

          {/* FAQ Section */}
          <section className="mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
              I'm new to QR Codes. What should I know?
            </h1>
            <p className="text-center text-muted-foreground mb-12">
              Glad you asked! Here's a few basics to get you started.
            </p>

            <div className="grid md:grid-cols-5 gap-8">
              <div className="md:col-span-2">
                <img 
                  src="/lovable-uploads/62125209-7b35-467b-8366-51c212b92878.png" 
                  alt="Hand holding QR codes" 
                  className="w-full h-auto rounded-xl"
                />
              </div>
              <div className="md:col-span-3">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="hover:no-underline">
                      What is a QR Code?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        QR Code is a two-dimensional version of the barcode, typically made up of black and white pixel patterns. Denso Wave, a Japanese subsidiary of the Toyota supplier Denso, developed them for marking components in order to accelerate logistics processes for their automobile production. Now, it has found its way into mobile marketing with the widespread adoption of smartphones. "QR" stands for "Quick Response", which refers to the instant access to the information hidden in the code.
                      </p>
                      <Button variant="link" size="sm" className="px-0 mt-2 text-primary">
                        TELL ME MORE
                      </Button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="hover:no-underline">
                      What are the benefits of using QR Codes?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        QR codes offer numerous benefits including: quick access to information without typing URLs, contactless engagement, tracking scan metrics for marketing insights, versatility across digital and print media, ease of creation and updating content without reprinting, and reduced physical contact which is especially valuable in post-pandemic environments.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="hover:no-underline">
                      How do I scan QR Codes?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        Most modern smartphones have built-in QR code scanning capabilities in their camera apps. Simply open your camera app, point it at a QR code, and hold steady for a moment. A notification should appear that you can tap to access the encoded content. If your camera doesn't automatically scan QR codes, you may need to download a free QR code scanner app from your app store.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="bg-blue-500 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">When in doubt, go PRO</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              All of our Dynamic QR Codes are mistake-proof. Made a typo? Fixed. Link no longer working? Replaced. Old images or files? Refreshed.
            </p>
            <Button className="bg-white text-blue-600 hover:bg-white/90" onClick={() => navigate("/signin")}>
              CREATE FREE ACCOUNT
            </Button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Guides;
