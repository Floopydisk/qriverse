
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Edit, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - in a real app, this would come from your backend
const mockQRCodes = [
  {
    id: "1",
    name: "Company Website",
    url: "https://example.com",
    createdAt: "2025-04-01T10:00:00Z",
    imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAAA1BMVEX///+nxBvIAAAAGElEQVRIx+3BMQEAAADCIPunXg0PAAAA3wHGvgABT9RYrwAAAABJRU5ErkJggg==",
    color: "#10B981",
    bgColor: "#FFFFFF"
  },
  {
    id: "2",
    name: "WiFi Network",
    url: "WiFi:T:WPA;S:MyWiFi;P:password123;;",
    createdAt: "2025-04-02T14:30:00Z",
    imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAAA1BMVEX///+nxBvIAAAAGElEQVRIx+3BMQEAAADCIPunXg0PAAAA3wHGvgABT9RYrwAAAABJRU5ErkJggg==",
    color: "#3B82F6",
    bgColor: "#F3F4F6"
  },
  {
    id: "3",
    name: "Contact Information",
    url: "tel:+11234567890",
    createdAt: "2025-04-03T09:15:00Z",
    imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAAA1BMVEX///+nxBvIAAAAGElEQVRIx+3BMQEAAADCIPunXg0PAAAA3wHGvgABT9RYrwAAAABJRU5ErkJggg==",
    color: "#EC4899",
    bgColor: "#FFFFFF"
  }
];

const QRCodeList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [qrCodes, setQrCodes] = useState(mockQRCodes);

  const handleEdit = (id: string) => {
    navigate(`/generate?edit=${id}`);
  };

  const handleDelete = (id: string) => {
    setQrCodes(qrCodes.filter(qr => qr.id !== id));
    toast({
      title: "QR Code Deleted",
      description: "The QR code has been deleted successfully"
    });
  };

  const handleDownload = (id: string, name: string, imageUrl: string) => {
    // Create a temporary link element and trigger the download
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${name.replace(/\s+/g, "_")}_qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code Downloaded",
      description: "Your QR code has been downloaded successfully"
    });
  };

  if (qrCodes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 max-w-md mx-auto">
          <h3 className="text-xl font-medium mb-2">No QR Codes Found</h3>
          <p className="text-muted-foreground mb-6">
            You haven't created any QR codes yet. Get started by creating your first QR code!
          </p>
          <Button onClick={() => navigate("/generate")}>
            Create QR Code
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {qrCodes.map((qrCode) => (
        <Card key={qrCode.id} className="overflow-hidden">
          <div className="bg-white p-6 flex items-center justify-center">
            <img
              src={qrCode.imageUrl}
              alt={qrCode.name}
              className="w-36 h-36 object-contain"
            />
          </div>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold truncate">{qrCode.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Link className="h-3.5 w-3.5" />
              <span className="truncate">{qrCode.url}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Created on {new Date(qrCode.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(qrCode.id)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleDownload(qrCode.id, qrCode.name, qrCode.imageUrl)}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(qrCode.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default QRCodeList;
