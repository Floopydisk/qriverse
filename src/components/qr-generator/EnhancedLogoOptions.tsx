
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash } from "lucide-react";

interface EnhancedLogoOptionsProps {
  logo: string | null;
  setLogo: (logo: string | null) => void;
  addLogo: boolean;
  setAddLogo: (add: boolean) => void;
  logoStyle: string;
  setLogoStyle: (style: string) => void;
  logoSize: number;
  setLogoSize: (size: number) => void;
  preserveAspectRatio: boolean;
  setPreserveAspectRatio: (preserve: boolean) => void;
}

export function EnhancedLogoOptions({ 
  logo,
  setLogo,
  addLogo,
  setAddLogo,
  logoStyle,
  setLogoStyle,
  logoSize,
  setLogoSize,
  preserveAspectRatio,
  setPreserveAspectRatio
}: EnhancedLogoOptionsProps) {
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
    <div className="space-y-4">
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
        <Label htmlFor="addLogo">Add Logo Integration</Label>
      </div>
      
      {addLogo && (
        <div className="space-y-4 pl-6 border-l-2 border-green-200">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex-1"
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
            <>
              <div className="flex justify-center">
                <img
                  src={logo}
                  alt="Logo preview"
                  className="h-16 w-16 object-contain border rounded"
                />
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Logo Integration Style</Label>
                  <Select value={logoStyle} onValueChange={setLogoStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="integrated">Integrated (with background)</SelectItem>
                      <SelectItem value="overlay">Simple Overlay</SelectItem>
                      <SelectItem value="background">Subtle Background</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Logo Size: {Math.round(logoSize * 100)}%</Label>
                  <Slider
                    value={[logoSize]}
                    onValueChange={(value) => setLogoSize(value[0])}
                    max={0.4}
                    min={0.1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="preserveAspectRatio" 
                    checked={preserveAspectRatio} 
                    onCheckedChange={(checked) => setPreserveAspectRatio(checked === true)}
                  />
                  <Label htmlFor="preserveAspectRatio" className="text-sm">
                    Preserve logo aspect ratio
                  </Label>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
