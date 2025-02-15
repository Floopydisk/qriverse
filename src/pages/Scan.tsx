import { useCallback, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Scan = () => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleFile = (file: File) => {
    // QR code scanning logic will be implemented in future updates
    toast({
      title: "Success",
      description: `File "${file.name}" uploaded successfully`,
    });
  };

  const startCamera = () => {
    // Camera scanning logic will be implemented in future updates
    toast({
      title: "Coming soon",
      description: "Camera scanning will be available in future updates",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-8">
            <div className="space-y-4 text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Scan <span className="text-primary">QR Code</span>
              </h1>
              
              <p className="text-foreground/80">
                Upload an image containing a QR code or use your camera to scan
              </p>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer space-y-4 block"
              >
                <Upload className="mx-auto h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    Drop your image here or click to upload
                  </p>
                  <p className="text-sm text-foreground/60">
                    Supports PNG, JPG up to 10MB
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                className="w-full max-w-xs"
                onClick={startCamera}
              >
                <Camera className="mr-2 h-5 w-5" />
                Open Camera
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Scan;
