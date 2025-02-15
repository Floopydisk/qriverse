
import { useCallback, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Button } from "@/components/ui/button";
import { Camera, Upload, ExternalLink, Copy, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface ScanResult {
  text: string;
  isURL: boolean;
}

const Scan = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const { toast } = useToast();

  const isValidImageType = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    return validTypes.includes(file.type);
  };

  const isValidURL = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

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

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 100);
    return interval;
  };

  const handleFile = async (file: File) => {
    setScanResult(null);
    
    if (!isValidImageType(file)) {
      toast({
        title: "Error",
        description: "Invalid file type. Please upload a PNG, JPG, JPEG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const progressInterval = simulateProgress();

    try {
      // Show upload progress toast
      toast({
        title: "Processing",
        description: (
          <div className="space-y-2">
            <p>Uploading image...</p>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        ),
      });

      // Create image URL
      const imageUrl = URL.createObjectURL(file);
      
      // Initialize ZXing reader
      const reader = new BrowserMultiFormatReader();
      
      try {
        const result = await reader.decodeFromImageUrl(imageUrl);
        
        // Clean up
        URL.revokeObjectURL(imageUrl);
        clearInterval(progressInterval);
        setUploadProgress(0);
        setIsProcessing(false);

        // Show success toast
        toast({
          title: "Success",
          description: "QR code scanned successfully",
        });

        // Set scan result
        setScanResult({
          text: result.getText(),
          isURL: isValidURL(result.getText())
        });

      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        setIsProcessing(false);
        toast({
          title: "Error",
          description: "No QR code found in the image",
          variant: "destructive",
        });
      }

    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to process the image",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Success",
        description: "Text copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  const startCamera = () => {
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
                    Supports PNG, JPG, JPEG, WebP up to 10MB
                  </p>
                </div>
              </label>
            </div>

            {scanResult && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-muted rounded-lg">
                  {scanResult.isURL ? (
                    <div className="flex items-center gap-4">
                      <div className="flex-1 flex items-center gap-2 bg-background p-2 rounded">
                        <LinkIcon className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">{scanResult.text}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => copyToClipboard(scanResult.text)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        className="shrink-0"
                        onClick={() => window.open(scanResult.text, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Link
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <p className="flex-1">{scanResult.text}</p>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(scanResult.text)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Text
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                className="w-full max-w-xs"
                onClick={startCamera}
                disabled={isProcessing}
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
