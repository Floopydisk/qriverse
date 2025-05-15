
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed w-full z-50">
        <Header />
      </div>
      
      <main className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Terms of Service</h1>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">Last updated: May 15, 2025</p>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                <p>
                  These Terms of Service ("Terms") govern your access to and use of QRGen's website, services, and applications (collectively, the "Service"). 
                  Please read these Terms carefully before using our Service.
                </p>
                <p>
                  By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Use of the Service</h2>
                <p>
                  You may use our Service only if you can form a binding contract with QRGen and only in compliance with these Terms and all applicable laws.
                </p>
                <p>
                  You are responsible for safeguarding your account information and for any activities or actions under your account.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">User Content</h2>
                <p>
                  You retain ownership of any content that you submit, upload, or display on or through the Service ("User Content").
                </p>
                <p>
                  By submitting User Content, you grant QRGen a worldwide, non-exclusive, royalty-free license to use, copy, modify, create derivative works based on, distribute, publicly display, and publicly perform your User Content in connection with operating and providing the Service.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Prohibited Conduct</h2>
                <p>You agree not to engage in any of the following prohibited activities:</p>
                <ul>
                  <li>Violating any laws, regulations, or third-party rights.</li>
                  <li>Using the Service for any illegal purpose.</li>
                  <li>Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Service.</li>
                  <li>Using the Service in any manner that could disable, overburden, damage, or impair the Service.</li>
                  <li>Using any robot, spider, crawler, scraper, or other automated means to access the Service.</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Intellectual Property</h2>
                <p>
                  The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of QRGen and its licensors.
                </p>
                <p>
                  Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of QRGen.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Termination</h2>
                <p>
                  We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
                <p>
                  Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Disclaimer of Warranties</h2>
                <p>
                  The Service is provided "as is" and "as available" without warranties of any kind, either express or implied.
                </p>
                <p>
                  QRGen does not warrant that the Service will be uninterrupted or error-free, that defects will be corrected, or that the Service or the servers that make it available are free of viruses or other harmful components.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Limitation of Liability</h2>
                <p>
                  In no event shall QRGen, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-4">Changes to These Terms</h2>
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page and updating the "Last updated" date.
                </p>
                <p>
                  By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised Terms.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
