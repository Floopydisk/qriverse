
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Cookie } from "lucide-react";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed w-full z-50">
        <Header />
      </div>
      
      <main className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Cookie className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Cookie Policy</h1>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">Last updated: May 15, 2025</p>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                <p>
                  This Cookie Policy explains how QrLabs uses cookies and similar technologies 
                  to recognize you when you visit our website and use our services. It explains what these technologies are 
                  and why we use them, as well as your rights to control our use of them.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">What Are Cookies?</h2>
                <p>
                  Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
                  They are widely used by website owners to make their websites work, or to work more efficiently, 
                  as well as to provide reporting information.
                </p>
                <p>
                  Cookies set by the website owner (in this case, QrLabs) are called "first-party cookies." 
                  Cookies set by parties other than the website owner are called "third-party cookies." 
                  Third-party cookies enable third-party features or functionality to be provided on or through the website 
                  (e.g., advertising, interactive content, and analytics).
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Types of Cookies We Use</h2>
                <p>We use the following types of cookies:</p>
                <ul>
                  <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.</li>
                  <li><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.</li>
                  <li><strong>Functionality Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</li>
                  <li><strong>Targeting Cookies:</strong> These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">How Can You Control Cookies?</h2>
                <p>
                  You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
                </p>
                <p>
                  Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="http://www.allaboutcookies.org" className="text-primary">www.allaboutcookies.org</a>.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Changes to This Cookie Policy</h2>
                <p>
                  We may update our Cookie Policy from time to time. 
                  We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
                </p>
                <p>
                  We encourage you to review this Cookie Policy periodically to stay informed about how we are using cookies.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                <p>
                  If you have questions about this Cookie Policy, please contact us at 
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

export default CookiePolicy;
