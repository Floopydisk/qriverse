
import { TabsContent } from "@/components/ui/tabs";
import { TextQRTab } from "@/components/qr-generator/tabs/TextQRTab";
import { WifiQRTab } from "@/components/qr-generator/tabs/WifiQRTab";
import { ContactQRTab } from "@/components/qr-generator/tabs/ContactQRTab";
import { SmsQRTab } from "@/components/qr-generator/tabs/SmsQRTab";
import { EmailQRTab } from "@/components/qr-generator/tabs/EmailQRTab";
import { TwitterQRTab } from "@/components/qr-generator/tabs/TwitterQRTab";
import { BitcoinQRTab } from "@/components/qr-generator/tabs/BitcoinQRTab";

interface QRContentTabsProps {
  // Text/URL
  text: string;
  setText: (text: string) => void;
  
  // Wifi
  ssid: string;
  setSsid: (ssid: string) => void;
  password: string;
  setPassword: (password: string) => void;
  encryption: string;
  setEncryption: (encryption: string) => void;
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
  
  // Contact
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  organization: string;
  setOrganization: (org: string) => void;
  title: string;
  setTitle: (title: string) => void;
  website: string;
  setWebsite: (website: string) => void;
  facebookUrl: string;
  setFacebookUrl: (url: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (url: string) => void;
  instagramUrl: string;
  setInstagramUrl: (url: string) => void;
  twitterUrl: string;
  setTwitterUrl: (url: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  
  // SMS
  smsPhone: string;
  setSmsPhone: (phone: string) => void;
  smsMessage: string;
  setSmsMessage: (message: string) => void;
  
  // Email
  emailTo: string;
  setEmailTo: (email: string) => void;
  emailSubject: string;
  setEmailSubject: (subject: string) => void;
  emailBody: string;
  setEmailBody: (body: string) => void;
  
  // Twitter
  twitterText: string;
  setTwitterText: (text: string) => void;
  twitterShareUrl: string;
  setTwitterShareUrl: (url: string) => void;
  twitterHashtags: string;
  setTwitterHashtags: (hashtags: string) => void;
  
  // Bitcoin
  bitcoinAddress: string;
  setBitcoinAddress: (address: string) => void;
  bitcoinAmount: string;
  setBitcoinAmount: (amount: string) => void;
  bitcoinLabel: string;
  setBitcoinLabel: (label: string) => void;
  bitcoinMessage: string;
  setBitcoinMessage: (message: string) => void;
}

export function QRContentTabs({
  text, setText,
  ssid, setSsid, password, setPassword, encryption, setEncryption, hidden, setHidden,
  fullName, setFullName, email, setEmail, phone, setPhone, organization, setOrganization,
  title, setTitle, website, setWebsite, facebookUrl, setFacebookUrl, linkedinUrl, setLinkedinUrl,
  instagramUrl, setInstagramUrl, twitterUrl, setTwitterUrl, youtubeUrl, setYoutubeUrl,
  smsPhone, setSmsPhone, smsMessage, setSmsMessage,
  emailTo, setEmailTo, emailSubject, setEmailSubject, emailBody, setEmailBody,
  twitterText, setTwitterText, twitterShareUrl, setTwitterShareUrl, twitterHashtags, setTwitterHashtags,
  bitcoinAddress, setBitcoinAddress, bitcoinAmount, setBitcoinAmount, bitcoinLabel, setBitcoinLabel,
  bitcoinMessage, setBitcoinMessage
}: QRContentTabsProps) {
  return (
    <div className="space-y-6 mt-6">
      <TabsContent value="url" className="mt-0 space-y-0">
        <TextQRTab text={text} setText={setText} isUrl={true} />
      </TabsContent>
      
      <TabsContent value="text" className="mt-0 space-y-0">
        <TextQRTab text={text} setText={setText} isUrl={false} />
      </TabsContent>
      
      <TabsContent value="email" className="mt-0 space-y-0">
        <EmailQRTab
          emailTo={emailTo}
          setEmailTo={setEmailTo}
          emailSubject={emailSubject}
          setEmailSubject={setEmailSubject}
          emailBody={emailBody}
          setEmailBody={setEmailBody}
        />
      </TabsContent>
      
      <TabsContent value="wifi" className="mt-0 space-y-0">
        <WifiQRTab 
          ssid={ssid}
          setSsid={setSsid}
          encryption={encryption}
          setEncryption={setEncryption}
          password={password}
          setPassword={setPassword}
          hidden={hidden}
          setHidden={setHidden}
        />
      </TabsContent>
      
      <TabsContent value="phone" className="mt-0 space-y-0">
        <SmsQRTab 
          smsPhone={smsPhone}
          setSmsPhone={setSmsPhone}
          smsMessage={smsMessage}
          setSmsMessage={setSmsMessage}
        />
      </TabsContent>

      <TabsContent value="sms" className="mt-0 space-y-0">
        <SmsQRTab 
          smsPhone={smsPhone}
          setSmsPhone={setSmsPhone}
          smsMessage={smsMessage}
          setSmsMessage={setSmsMessage}
        />
      </TabsContent>

      <TabsContent value="vcard" className="mt-0 space-y-0">
        <ContactQRTab
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          organization={organization}
          setOrganization={setOrganization}
          title={title}
          setTitle={setTitle}
          website={website}
          setWebsite={setWebsite}
          facebookUrl={facebookUrl}
          setFacebookUrl={setFacebookUrl}
          linkedinUrl={linkedinUrl}
          setLinkedinUrl={setLinkedinUrl}
          instagramUrl={instagramUrl}
          setInstagramUrl={setInstagramUrl}
          twitterUrl={twitterUrl}
          setTwitterUrl={setTwitterUrl}
          youtubeUrl={youtubeUrl}
          setYoutubeUrl={setYoutubeUrl}
        />
      </TabsContent>

      <TabsContent value="twitter" className="mt-0 space-y-0">
        <TwitterQRTab 
          twitterText={twitterText}
          setTwitterText={setTwitterText}
          twitterShareUrl={twitterShareUrl}
          setTwitterShareUrl={setTwitterShareUrl}
          twitterHashtags={twitterHashtags}
          setTwitterHashtags={setTwitterHashtags}
        />
      </TabsContent>

      <TabsContent value="bitcoin" className="mt-0 space-y-0">
        <BitcoinQRTab 
          bitcoinAddress={bitcoinAddress}
          setBitcoinAddress={setBitcoinAddress}
          bitcoinAmount={bitcoinAmount}
          setBitcoinAmount={setBitcoinAmount}
          bitcoinLabel={bitcoinLabel}
          setBitcoinLabel={setBitcoinLabel}
          bitcoinMessage={bitcoinMessage}
          setBitcoinMessage={setBitcoinMessage}
        />
      </TabsContent>
    </div>
  );
}
