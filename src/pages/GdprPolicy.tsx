
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield } from "lucide-react";

const GdprPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed w-full z-50">
        <Header />
      </div>
      
      <main className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">GDPR Compliance</h1>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">Last updated: May 15, 2025</p>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                <p>
                  QRGen is committed to ensuring the protection and security of personal data in accordance with the General Data Protection Regulation (GDPR). This policy outlines our approach to data protection and your rights under the GDPR.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Our Commitment to GDPR</h2>
                <p>
                  As a data controller and processor, we adhere to the following principles when processing personal data:
                </p>
                <ul>
                  <li><strong>Lawfulness, fairness, and transparency:</strong> We process data lawfully, fairly, and transparently.</li>
                  <li><strong>Purpose limitation:</strong> We collect data for specified, explicit, and legitimate purposes.</li>
                  <li><strong>Data minimization:</strong> We collect and process only the data necessary for our stated purposes.</li>
                  <li><strong>Accuracy:</strong> We maintain accurate and up-to-date personal data.</li>
                  <li><strong>Storage limitation:</strong> We store data only for as long as necessary.</li>
                  <li><strong>Integrity and confidentiality:</strong> We process data securely, protecting against unauthorized access and accidental loss.</li>
                  <li><strong>Accountability:</strong> We take responsibility for complying with the GDPR.</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Legal Basis for Processing</h2>
                <p>
                  We process personal data based on one or more of the following legal grounds:
                </p>
                <ul>
                  <li><strong>Consent:</strong> You have given clear consent for us to process your personal data for a specific purpose.</li>
                  <li><strong>Contract:</strong> Processing is necessary for a contract we have with you or because you have asked us to take specific steps before entering into a contract.</li>
                  <li><strong>Legal obligation:</strong> Processing is necessary for us to comply with the law.</li>
                  <li><strong>Legitimate interests:</strong> Processing is necessary for our legitimate interests or the legitimate interests of a third party, unless there is a good reason to protect your personal data which overrides those legitimate interests.</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Your Rights Under GDPR</h2>
                <p>
                  Under the GDPR, you have the following rights:
                </p>
                <ul>
                  <li><strong>Right to be informed:</strong> You have the right to be informed about the collection and use of your personal data.</li>
                  <li><strong>Right of access:</strong> You have the right to request a copy of your personal data.</li>
                  <li><strong>Right to rectification:</strong> You have the right to have inaccurate personal data rectified or completed if it is incomplete.</li>
                  <li><strong>Right to erasure:</strong> You have the right to have your personal data erased in certain circumstances.</li>
                  <li><strong>Right to restrict processing:</strong> You have the right to request the restriction or suppression of your personal data.</li>
                  <li><strong>Right to data portability:</strong> You have the right to obtain and reuse your personal data for your own purposes across different services.</li>
                  <li><strong>Right to object:</strong> You have the right to object to the processing of your personal data in certain circumstances.</li>
                  <li><strong>Rights related to automated decision making and profiling:</strong> You have rights related to automated decision making and profiling.</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Data Protection Officer</h2>
                <p>
                  To exercise your rights or if you have any questions about our data protection practices, please contact our Data Protection Officer:
                </p>
                <p>
                  Email: <a href="mailto:dpo@qrgen.com" className="text-primary">dpo@qrgen.com</a>
                </p>
                <p>
                  Postal address: QRGen Data Protection Office, 123 Tech Street, Digital City, 45678.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">International Data Transfers</h2>
                <p>
                  We may transfer your personal data to countries outside the European Economic Area (EEA). 
                  When we do, we ensure appropriate safeguards are in place to protect your data, 
                  such as Standard Contractual Clauses approved by the European Commission.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-4">Data Breach Notification</h2>
                <p>
                  In the event of a personal data breach, we will notify you and the relevant supervisory authority 
                  without undue delay, and at the latest within 72 hours after having become aware of the breach, 
                  where feasible and where the breach is likely to result in a high risk to your rights and freedoms.
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

export default GdprPolicy;
