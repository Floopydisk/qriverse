
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

const PrivacyPolicy = () => {
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
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">Last updated: May 15, 2025</p>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                <p>
                  QrLabs ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                </p>
                <p>
                  Please read this Privacy Policy carefully. By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
                <p>We may collect the following types of information:</p>
                <ul>
                  <li>Personal Information: Name, email address, and other contact details.</li>
                  <li>Usage Data: Information about how you interact with our service.</li>
                  <li>Device Information: Information about your device and internet connection.</li>
                  <li>QR Code Data: Information encoded in QR codes that you generate or scan.</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
                <p>We use the information we collect for various purposes, including:</p>
                <ul>
                  <li>To provide and maintain our service.</li>
                  <li>To notify you of updates and changes to our service.</li>
                  <li>To provide customer support.</li>
                  <li>To analyze usage patterns and improve our service.</li>
                  <li>To detect, prevent, and address technical issues.</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Information Sharing and Disclosure</h2>
                <p>We may share information in the following situations:</p>
                <ul>
                  <li>With service providers who assist us in operating our service.</li>
                  <li>To comply with legal obligations.</li>
                  <li>To protect against harm to the rights, property, or safety of QrLabs, our users, or the public.</li>
                  <li>With your consent or at your direction.</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Your Privacy Rights</h2>
                <p>Depending on your location, you may have certain rights regarding your personal information, such as:</p>
                <ul>
                  <li>The right to access your personal information.</li>
                  <li>The right to correct inaccurate information.</li>
                  <li>The right to request deletion of your information.</li>
                  <li>The right to restrict or object to processing.</li>
                  <li>The right to data portability.</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information. 
                  However, no method of transmission over the Internet or electronic storage is 100% secure, 
                  so we cannot guarantee absolute security.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Changes to This Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. 
                  We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at 
                  <a href="mailto:privacy@QrLabs.com" className="text-primary ml-1">privacy@QrLabs.com</a>.
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

export default PrivacyPolicy;
