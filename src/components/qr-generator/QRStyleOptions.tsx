
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash } from "lucide-react";

interface QRStyleOptionsProps {
  darkColor: string;
  setDarkColor: (color: string) => void;
  lightColor: string;
  setLightColor: (color: string) => void;
  logo: string | null;
  setLogo: (logo: string | null) => void;
  addLogo: boolean;
  setAddLogo: (add: boolean) => void;
}

export function QRStyleOptions({ 
  darkColor, 
  setDarkColor, 
  lightColor, 
  setLightColor,
  logo,
  setLogo,
  addLogo,
  setAddLogo
}: QRStyleOptionsProps) {
  const { toast } = useToast();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setLogo(event.target.result);
          setAddLogo(true);
          toast({
            title: "Logo uploaded",
            description: "Your logo has been uploaded successfully",
          });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setAddLogo(false);
    toast({
      title: "Logo removed",
      description: "Your logo has been removed",
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="darkColor">QR Code Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="darkColor"
              value={darkColor}
              onChange={(e) => setDarkColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <Input
              type="text"
              value={darkColor}
              onChange={(e) => setDarkColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lightColor">Background Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="lightColor"
              value={lightColor}
              onChange={(e) => setLightColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <Input
              type="text"
              value={lightColor}
              onChange={(e) => setLightColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="addLogo" 
            checked={addLogo} 
            onCheckedChange={(checked) => {
              setAddLogo(checked === true);
              if (checked === false) {
                setLogo(null);
              }
            }}
          />
          <Label htmlFor="addLogo">Add Logo to Center</Label>
        </div>
        
        {addLogo && (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {logo ? "Change Logo" : "Upload Logo"}
              </Button>
              
              {logo && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={removeLogo}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            
            {logo && (
              <div className="flex justify-center">
                <img
                  src={logo}
                  alt="Logo preview"
                  className="h-16 w-16 object-contain border rounded"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
