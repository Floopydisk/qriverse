
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Download, Upload, Trash, Scan, Wifi, Contact, LinkIcon, Text, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { createQRCode, fetchQRCode, updateQRCode } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

const Generate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [darkColor, setDarkColor] = useState("#10B981");
  const [lightColor, setLightColor] = useState("#FFFFFF");
  const [logo, setLogo] = useState<string | null>(null);
  const [addLogo, setAddLogo] = useState(false);
  
  const [text, setText] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [title, setTitle] = useState("");
  const [website, setWebsite] = useState("");

  const [activeTab, setActiveTab] = useState("text");
  
  const { data: qrCodeData, isLoading: isLoadingQrCode } = useQuery({
    queryKey: ['qrCode', editId],
    queryFn: () => editId ? fetchQRCode(editId) : null,
    enabled: !!editId
  });

  useEffect(() => {
    if (qrCodeData) {
      setName(qrCodeData.name || "");
      if (qrCodeData.options && typeof qrCodeData.options === 'object') {
        // Fix: Type guard to ensure we're working with an object
        const options = qrCodeData.options as Record<string, any>;
        setQrDataUrl(options.dataUrl || "");
        setDarkColor(options.darkColor || "#10B981");
        setLightColor(options.lightColor || "#FFFFFF");
        setAddLogo(options.hasLogo || false);
      }

      if (qrCodeData.type === "url" || qrCodeData.type === "text") {
        setActiveTab("text");
        setText(qrCodeData.content || "");
      } else if (qrCodeData.type === "wifi") {
        setActiveTab("wifi");
        try {
          const wifiString = qrCodeData.content;
          const ssidMatch = wifiString.match(/S:(.*?);/);
          const passwordMatch = wifiString.match(/P:(.*?);/);
          const encryptionMatch = wifiString.match(/T:(.*?);/);
          const hiddenMatch = wifiString.match(/H:(.*?);/);
          
          if (ssidMatch) setSsid(ssidMatch[1]);
          if (passwordMatch) setPassword(passwordMatch[1]);
          if (encryptionMatch) setEncryption(encryptionMatch[1]);
          if (hiddenMatch) setHidden(hiddenMatch[1] === "true");
        } catch (err) {
          console.error("Failed to parse WiFi QR code:", err);
        }
      } else if (qrCodeData.type === "contact") {
        setActiveTab("contact");
        try {
          const vCardString = qrCodeData.content;
          const fnMatch = vCardString.match(/FN:(.*?)(?:\r?\n|$)/);
          const emailMatch = vCardString.match(/EMAIL:(.*?)(?:\r?\n|$)/);
          const telMatch = vCardString.match(/TEL:(.*?)(?:\r?\n|$)/);
          const orgMatch = vCardString.match(/ORG:(.*?)(?:\r?\n|$)/);
          const titleMatch = vCardString.match(/TITLE:(.*?)(?:\r?\n|$)/);
          const urlMatch = vCardString.match(/URL:(.*?)(?:\r?\n|$)/);
          
          if (fnMatch) setFullName(fnMatch[1]);
          if (emailMatch) setEmail(emailMatch[1]);
          if (telMatch) setPhone(telMatch[1]);
          if (orgMatch) setOrganization(orgMatch[1]);
          if (titleMatch) setTitle(titleMatch[1]);
          if (urlMatch) setWebsite(urlMatch[1]);
        } catch (err) {
          console.error("Failed to parse contact QR code:", err);
        }
      }
    }
  }, [qrCodeData]);

  const createQRCodeMutation = useMutation({
    mutationFn: createQRCode,
    onSuccess: async (data) => {
      if (qrDataUrl) {
        try {
          const filename = `${data.id}.png`;
          const { error: folderError } = await supabase.storage.from('qrcodes').list(`user_${user?.id}`);
          
          if (folderError && folderError.message.includes('Not found')) {
            await supabase.storage.from('qrcodes').upload(`user_${user?.id}/.folder_metadata`, '');
          }
          
          const response = await fetch(qrDataUrl);
          const blob = await response.blob();
          
          const { error } = await supabase.storage
            .from('qrcodes')
            .upload(`user_${user?.id}/${filename}`, blob, {
              contentType: 'image/png',
              upsert: true
            });
            
          if (error) throw error;
          
          await updateQRCode(data.id, {
            options: {
              ...(typeof data.options === 'object' && data.options !== null ? data.options : {}),
              storagePath: `user_${user?.id}/${filename}`
            }
          });
          
          toast({
            title: "QR Code Saved",
            description: "Your QR code has been saved to your dashboard"
          });
        } catch (error) {
          console.error("Error uploading QR code:", error);
          toast({
            title: "QR Code Saved",
            description: "Your QR code was saved but the image upload failed"
          });
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save QR code",
        variant: "destructive",
      });
    }
  });

  const updateQRCodeMutation = useMutation({
    mutationFn: ({id, updates}: {id: string, updates: any}) => updateQRCode(id, updates),
    onSuccess: async (data) => {
      if (qrDataUrl && editId) {
        try {
          const response = await fetch(qrDataUrl);
          const blob = await response.blob();
          
          const filename = `${editId}.png`;
          const { error } = await supabase.storage
            .from('qrcodes')
            .upload(`user_${user?.id}/${filename}`, blob, {
              contentType: 'image/png',
              upsert: true
            });
            
          if (error) throw error;
          
          toast({
            title: "QR Code Updated",
            description: "Your QR code has been updated successfully"
          });
        } catch (error) {
          console.error("Error uploading QR code:", error);
          toast({
            title: "QR Code Updated",
            description: "Your QR code was updated but the image upload failed"
          });
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update QR code",
        variant: "destructive",
      });
    }
  });

  const generateTextQR = async () => {
    if (!text) {
      toast({
        title: "Error",
        description: "Please enter some text to generate a QR code",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 400,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrDataUrl(dataUrl);
      
      if (addLogo && logo) {
        addLogoToQR(dataUrl, text);
      } else {
        toast({
          title: "Success",
          description: "QR code generated successfully",
        });
        
        saveQRCodeToDatabase(dataUrl, text, text.startsWith("http") ? "url" : "text");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const generateWifiQR = async () => {
    if (!ssid) {
      toast({
        title: "Error",
        description: "Please enter the network name (SSID)",
        variant: "destructive",
      });
      return;
    }

    try {
      const wifiString = `WIFI:T:${encryption};S:${ssid};P:${password};H:${
        hidden ? "true" : "false"
      };;`;
      
      const dataUrl = await QRCode.toDataURL(wifiString, {
        width: 400,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrDataUrl(dataUrl);
      
      if (addLogo && logo) {
        addLogoToQR(dataUrl, wifiString);
      } else {
        toast({
          title: "Success",
          description: "WiFi QR code generated successfully",
        });
        
        saveQRCodeToDatabase(dataUrl, wifiString, "wifi");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const generateContactQR = async () => {
    if (!fullName) {
      toast({
        title: "Error",
        description: "Please enter at least a name",
        variant: "destructive",
      });
      return;
    }

    try {
      const vCardString = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${fullName}`,
        email ? `EMAIL:${email}` : "",
        phone ? `TEL:${phone}` : "",
        organization ? `ORG:${organization}` : "",
        title ? `TITLE:${title}` : "",
        website ? `URL:${website}` : "",
        "END:VCARD"
      ].filter(Boolean).join("\n");
      
      const dataUrl = await QRCode.toDataURL(vCardString, {
        width: 400,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrDataUrl(dataUrl);
      
      if (addLogo && logo) {
        addLogoToQR(dataUrl, vCardString);
      } else {
        toast({
          title: "Success",
          description: "Contact QR code generated successfully",
        });
        
        saveQRCodeToDatabase(dataUrl, vCardString, "contact");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const addLogoToQR = (qrDataUrl: string, content: string) => {
    if (!logo) return;
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const qrImage = new Image();
    
    qrImage.onload = () => {
      canvas.width = qrImage.width;
      canvas.height = qrImage.height;
      
      if (ctx) ctx.drawImage(qrImage, 0, 0);
      
      const logoImg = new Image();
      logoImg.onload = () => {
        const logoSize = qrImage.width * 0.25;
        const logoX = (qrImage.width - logoSize) / 2;
        const logoY = (qrImage.height - logoSize) / 2;
        
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
          
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          
          const finalQR = canvas.toDataURL("image/png");
          setQrDataUrl(finalQR);
          
          toast({
            title: "Success",
            description: "QR code with logo generated successfully",
          });
          
          saveQRCodeToDatabase(finalQR, content, determineType(content));
        }
      };
      logoImg.src = logo;
    };
    qrImage.src = qrDataUrl;
  };

  const determineType = (content: string): string => {
    if (content.startsWith('WIFI:')) return 'wifi';
    if (content.startsWith('BEGIN:VCARD')) return 'contact';
    if (content.startsWith('http')) return 'url';
    return 'text';
  };

  const saveQRCodeToDatabase = (dataUrl: string, content: string, type: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save QR codes",
        variant: "destructive",
      });
      return;
    }

    const qrName = name || `${type.toUpperCase()} QR - ${new Date().toLocaleString()}`;
    
    if (editId) {
      updateQRCodeMutation.mutate({
        id: editId,
        updates: {
          name: qrName,
          content: content,
          type: type,
          options: {
            darkColor,
            lightColor,
            hasLogo: addLogo,
            dataUrl: dataUrl
          }
        }
      });
    } else {
      // Fix: Rather than spread undefined data.options, create a new object
      createQRCodeMutation.mutate({
        name: qrName,
        content: content,
        type: type,
        options: {
          darkColor,
          lightColor,
          hasLogo: addLogo,
          dataUrl: dataUrl
        },
        user_id: user.id,
        folder_id: null
      });
    }
  };

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

  const copyText = async () => {
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

  const downloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qrcode-${activeTab}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "QR code downloaded successfully",
    });
  };

  const handleGenerate = () => {
    if (activeTab === "text") {
      generateTextQR();
    } else if (activeTab === "wifi") {
      generateWifiQR();
    } else if (activeTab === "contact") {
      generateContactQR();
    }
  };

  const handleScanQRClick = () => {
    navigate("/scan");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">
                  <span className="text-primary">QR Code</span> Generator
                </h1>
                <Button variant="outline" onClick={handleScanQRClick}>
                  <Scan className="mr-2 h-4 w-4" />
                  Scan QR
                </Button>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="text" className="flex items-center gap-1">
                    <Text className="h-4 w-4" />
                    <span className="hidden sm:inline">Text/URL</span>
                  </TabsTrigger>
                  <TabsTrigger value="wifi" className="flex items-center gap-1">
                    <Wifi className="h-4 w-4" />
                    <span className="hidden sm:inline">WiFi</span>
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="flex items-center gap-1">
                    <Contact className="h-4 w-4" />
                    <span className="hidden sm:inline">Contact</span>
                  </TabsTrigger>
                </TabsList>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="qrName">QR Code Name</Label>
                    <Input
                      id="qrName"
                      type="text"
                      placeholder="Enter a name for your QR code"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <TabsContent value="text" className="space-y-4 mt-0">
                    <div className="relative">
                      <Label htmlFor="qrContent">Content</Label>
                      <Input
                        id="qrContent"
                        type="text"
                        placeholder="Enter text or URL"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="wifi" className="space-y-4 mt-0">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ssid">Network Name (SSID)</Label>
                        <Input
                          id="ssid"
                          value={ssid}
                          onChange={(e) => setSsid(e.target.value)}
                          placeholder="Enter network name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="encryption">Security Type</Label>
                        <Select value={encryption} onValueChange={setEncryption}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select security type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WPA">WPA/WPA2</SelectItem>
                            <SelectItem value="WEP">WEP</SelectItem>
                            <SelectItem value="nopass">No Password</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {encryption !== "nopass" && (
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter network password"
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hidden"
                          checked={hidden}
                          onCheckedChange={(checked) => setHidden(checked as boolean)}
                        />
                        <Label htmlFor="hidden">Hidden network</Label>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="contact" className="space-y-4 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <Input
                          id="organization"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="Company Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
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
                  
                  <Button 
                    className="w-full"
                    onClick={handleGenerate}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    {editId ? "Update QR Code" : "Generate QR Code"}
                  </Button>
                </div>
              </Tabs>
            </div>

            {qrDataUrl && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-lg p-4 mx-auto w-fit">
                  <img
                    src={qrDataUrl}
                    alt="Generated QR Code"
                    className="w-64 h-64"
                  />
                </div>

                <div className="flex justify-center gap-4">
                  {activeTab === "text" && (
                    <Button
                      variant="outline"
                      className="w-40"
                      onClick={copyText}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Text
                    </Button>
                  )}
                  <Button
                    className="w-40"
                    onClick={downloadQR}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Generate;
