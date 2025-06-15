
import { QRCodePreview } from "@/components/qr-generator/QRCodePreview";

interface QRPreviewSectionProps {
  qrDataUrl: string;
  activeTab: string;
  text: string;
}

export function QRPreviewSection({ qrDataUrl, activeTab, text }: QRPreviewSectionProps) {
  return (
    <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg flex items-center justify-center">
      <QRCodePreview 
        qrDataUrl={qrDataUrl}
        activeTab={activeTab}
        text={activeTab === "text" || activeTab === "url" ? text : ""}
      />
    </div>
  );
}
