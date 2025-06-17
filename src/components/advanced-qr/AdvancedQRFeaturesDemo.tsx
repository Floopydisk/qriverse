
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedQR } from '@/hooks/use-advanced-qr';
import { QrCode, Shield, Globe, Clock, Palette, Zap } from 'lucide-react';

const AdvancedQRFeaturesDemo = () => {
  const {
    availableTemplates,
    selectedTemplate,
    applyTemplate,
    enablePasswordProtection,
    enableGeofencing,
    enableTimeRestrictions,
    createSmartQR,
    isLoading
  } = useAdvancedQR();

  const [password, setPassword] = useState('');
  const [passwordHint, setPasswordHint] = useState('');
  const [allowedCountries, setAllowedCountries] = useState<string[]>([]);
  const [smartQRName, setSmartQRName] = useState('');
  const [defaultUrl, setDefaultUrl] = useState('');

  const handlePasswordProtection = () => {
    if (password) {
      enablePasswordProtection(password, passwordHint);
      setPassword('');
      setPasswordHint('');
    }
  };

  const handleGeofencing = () => {
    enableGeofencing({
      allowedCountries,
      allowedRegions: [],
      allowedCities: []
    });
  };

  const handleCreateSmartQR = () => {
    if (smartQRName && defaultUrl) {
      createSmartQR({
        name: smartQRName,
        defaultUrl,
        rules: [],
        analytics: {
          trackingEnabled: true
        }
      });
      setSmartQRName('');
      setDefaultUrl('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
          Advanced QR Features
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore premium QR code features including templates, brand kits, security, and smart routing
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="geofencing" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Geofencing
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Controls
          </TabsTrigger>
          <TabsTrigger value="smart" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Smart QR
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                QR Code Templates
              </CardTitle>
              <p className="text-muted-foreground">
                Choose from professionally designed templates to match your brand
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => applyTemplate(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        {template.isPremium && (
                          <Badge variant="secondary">Premium</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: template.style.darkColor }}
                        />
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: template.style.lightColor }}
                        />
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <QrCode className="h-12 w-12 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Password Protection
              </CardTitle>
              <p className="text-muted-foreground">
                Secure your QR codes with password protection
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a secure password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hint">Password Hint (Optional)</Label>
                <Input
                  id="hint"
                  value={passwordHint}
                  onChange={(e) => setPasswordHint(e.target.value)}
                  placeholder="Hint to help users remember the password"
                />
              </div>
              <Button 
                onClick={handlePasswordProtection}
                disabled={!password || isLoading}
                className="w-full"
              >
                Enable Password Protection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geofencing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Geofencing Controls
              </CardTitle>
              <p className="text-muted-foreground">
                Restrict QR code access based on geographic location
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Allowed Countries</Label>
                <Select onValueChange={(value) => setAllowedCountries([...allowedCountries, value])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {allowedCountries.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Countries</Label>
                  <div className="flex flex-wrap gap-2">
                    {allowedCountries.map((country) => (
                      <Badge key={country} variant="secondary">
                        {country}
                        <button
                          onClick={() => setAllowedCountries(allowedCountries.filter(c => c !== country))}
                          className="ml-2 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleGeofencing}
                disabled={allowedCountries.length === 0 || isLoading}
                className="w-full"
              >
                Enable Geofencing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time-Based Controls
              </CardTitle>
              <p className="text-muted-foreground">
                Control when your QR codes are accessible
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="business-hours" />
                <Label htmlFor="business-hours">Business Hours Only (9 AM - 5 PM)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="weekdays" />
                <Label htmlFor="weekdays">Weekdays Only</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input id="end-date" type="date" />
                </div>
              </div>
              
              <Button 
                onClick={() => enableTimeRestrictions({
                  allowedHours: { start: 9, end: 17 },
                  allowedDays: [1, 2, 3, 4, 5] // Monday to Friday
                })}
                disabled={isLoading}
                className="w-full"
              >
                Apply Time Restrictions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smart">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Smart QR Codes
              </CardTitle>
              <p className="text-muted-foreground">
                Create QR codes that route users to different URLs based on device, location, and more
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smart-name">Smart QR Name</Label>
                <Input
                  id="smart-name"
                  value={smartQRName}
                  onChange={(e) => setSmartQRName(e.target.value)}
                  placeholder="Enter a name for your smart QR code"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-url">Default URL</Label>
                <Input
                  id="default-url"
                  value={defaultUrl}
                  onChange={(e) => setDefaultUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Smart Routing Examples:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Mobile users → App Store</li>
                  <li>• Desktop users → Website</li>
                  <li>• US users → US-specific site</li>
                  <li>• Evening hours → Special offers</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleCreateSmartQR}
                disabled={!smartQRName || !defaultUrl || isLoading}
                className="w-full"
              >
                Create Smart QR Code
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedQRFeaturesDemo;
