
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchDynamicQRCode, updateDynamicQRCode } from '@/lib/api';
import FloatingCircles from '@/components/FloatingCircles';

const EditDynamicQR = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const { data: qrCode, isLoading } = useQuery({
    queryKey: ['dynamicQrCode', id],
    queryFn: () => id ? fetchDynamicQRCode(id) : null,
    enabled: !!id,
  });

  useEffect(() => {
    if (qrCode) {
      setName(qrCode.name || '');
      setTargetUrl(qrCode.target_url || '');
      setIsActive(qrCode.active);
    }
  }, [qrCode]);

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => updateDynamicQRCode(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamicQrCode', id] });
      queryClient.invalidateQueries({ queryKey: ['dynamicQRCodes'] });
      
      toast({
        title: 'Success',
        description: 'Dynamic QR code updated successfully',
      });
      
      navigate('/dynamic-qr');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update dynamic QR code',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for your QR code',
        variant: 'destructive',
      });
      return;
    }
    
    if (!targetUrl.trim() || !isValidUrl(targetUrl)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      });
      return;
    }
    
    if (id) {
      updateMutation.mutate({
        id,
        updates: {
          name,
          target_url: targetUrl,
          active: isActive
        }
      });
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 pt-24 pb-12 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold">QR Code Not Found</h1>
            <p className="text-muted-foreground mt-2">
              The QR code you're trying to edit doesn't exist or you don't have permission to edit it.
            </p>
            <Button onClick={() => navigate('/dynamic-qr')} className="mt-4">
              Back to Dynamic QR Codes
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/dynamic-qr')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dynamic QR Codes
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>Edit Dynamic QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">QR Code Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter a name for your QR code"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetUrl">Target URL</Label>
                  <Input
                    id="targetUrl"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                  <p className="text-sm text-muted-foreground">
                    This is where users will be redirected when they scan the QR code.
                    You can change this URL anytime without generating a new QR code.
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="active">QR Code Active</Label>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditDynamicQR;
