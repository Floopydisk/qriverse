import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  fetchDynamicQRCode,
  fetchDynamicQRCodeScanStats,
  getDynamicQRRedirectUrl,
} from '@/lib/api';
import { ChartPie, Copy, ArrowLeft, Download, MapPin, Calendar, Globe, User, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import FloatingCircles from '@/components/FloatingCircles';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10B981', '#0EA5E9', '#8B5CF6', '#F43F5E', '#F59E0B', '#64748B'];

const DynamicQRStats = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const { data: qrCode, isLoading: isLoadingQrCode } = useQuery({
    queryKey: ['dynamicQrCode', id],
    queryFn: () => id ? fetchDynamicQRCode(id) : null,
    enabled: !!id,
  });

  const { data: scanStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dynamicQrStats', id],
    queryFn: () => id ? fetchDynamicQRCodeScanStats(id) : null,
    enabled: !!id,
  });

  useEffect(() => {
    if (qrCode) {
      const generateQrImage = async () => {
        try {
          const redirectUrl = getDynamicQRRedirectUrl(qrCode.short_code);
          const dataUrl = await QRCode.toDataURL(redirectUrl, {
            width: 800,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });
          setQrDataUrl(dataUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      };
      
      generateQrImage();
    }
  }, [qrCode]);

  const handleCopyLink = () => {
    if (!qrCode) return;
    
    const redirectUrl = getDynamicQRRedirectUrl(qrCode.short_code);
    navigator.clipboard.writeText(redirectUrl);
    
    toast({
      title: 'Link copied',
      description: 'QR code link copied to clipboard',
    });
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl || !qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `dynamic-qr-${qrCode.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'QR Code downloaded',
      description: 'Your dynamic QR code has been downloaded',
    });
  };

  // Prepare chart data
  const prepareBarChartData = () => {
    if (!scanStats || !scanStats.scansByDate) return [];
    
    return Object.entries(scanStats.scansByDate)
      .map(([date, count]) => ({
        date,
        scans: count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days
  };

  const preparePieChartData = () => {
    if (!scanStats || !scanStats.scansByCountry) return [];
    
    return Object.entries(scanStats.scansByCountry)
      .map(([country, count]) => ({
        name: country,
        value: count as number,
      }))
      .sort((a, b) => b.value - a.value);
  };

  if (isLoadingQrCode || isLoadingStats) {
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
              The QR code you're looking for doesn't exist or you don't have permission to view it.
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

  const barChartData = prepareBarChartData();
  const pieChartData = preparePieChartData();
  const redirectUrl = getDynamicQRRedirectUrl(qrCode.short_code);
  
  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/dynamic-qr')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dynamic QR Codes
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="shadow-sm h-full">
                <CardHeader>
                  <CardTitle>{qrCode.name}</CardTitle>
                  <CardDescription>Dynamic QR Code Details</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {qrDataUrl && (
                    <div className="bg-white p-4 rounded-lg mb-6">
                      <img 
                        src={qrDataUrl} 
                        alt={`QR code for ${qrCode.name}`}
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                  )}
                  
                  <div className="w-full space-y-4 mb-6">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Target URL:</p>
                      <div className="flex items-center">
                        <Link className="h-3.5 w-3.5 mr-1 text-primary" />
                        <p className="text-sm truncate flex-1">
                          {qrCode.target_url}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">QR Code Link:</p>
                      <p className="text-sm truncate">{redirectUrl}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Status:</p>
                      <p className={`text-sm font-medium ${qrCode.active ? 'text-green-600' : 'text-red-600'}`}>
                        {qrCode.active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Created:</p>
                      <p className="text-sm">
                        {format(new Date(qrCode.created_at), 'PPP')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full">
                    <Button 
                      onClick={handleCopyLink}
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy QR Link
                    </Button>
                    <Button
                      onClick={handleDownloadQR}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download QR Code
                    </Button>
                    <Button
                      onClick={() => navigate(`/dynamic-qr/edit/${qrCode.id}`)}
                      variant="secondary"
                      className="w-full"
                    >
                      <Link className="mr-2 h-4 w-4" />
                      Change Target URL
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <ChartPie className="h-4 w-4 mr-2 text-primary" />
                      Total Scans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{scanStats?.totalScans || 0}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-primary" />
                      Countries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {scanStats?.scansByCountry ? Object.keys(scanStats.scansByCountry).length : 0}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      First Scan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {scanStats?.rawScans && scanStats.rawScans.length > 0 
                        ? format(new Date(scanStats.rawScans[scanStats.rawScans.length - 1].scanned_at), 'PP')
                        : 'No scans yet'}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Scans Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {barChartData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData}>
                          <XAxis dataKey="date" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="scans" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No scan data available yet
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-primary" />
                      Scans by Country
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pieChartData.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({name, percent}) => {
                                // Ensure percent is treated as a number
                                const percentValue = Number(percent);
                                return `${name} ${(percentValue * 100).toFixed(0)}%`;
                              }}
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        No country data available yet
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      Recent Scans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-y-auto max-h-64">
                      {scanStats?.rawScans && scanStats.rawScans.length > 0 ? (
                        <div className="space-y-3">
                          {scanStats.rawScans.slice(0, 10).map((scan) => (
                            <div key={scan.id} className="border-b pb-2 last:border-b-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm">
                                    {format(new Date(scan.scanned_at), 'PPp')}
                                  </p>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {scan.country ? `${scan.city || ''} ${scan.country}` : 'Location unknown'}
                                  </div>
                                </div>
                                {scan.user_agent && (
                                  <div className="text-xs text-right text-muted-foreground max-w-[50%] truncate">
                                    {scan.user_agent.split(' ')[0]}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32 text-muted-foreground">
                          No scan data available yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DynamicQRStats;
