
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingCircles from '@/components/FloatingCircles';
import { fetchDynamicQRCode, fetchDynamicQRCodeScanStats } from '@/lib/api';

import QRCodeDetails from '@/components/dynamicQR/QRCodeDetails';
import StatsSummaryCards from '@/components/dynamicQR/StatsSummaryCards';
import DetailedStatsSection from '@/components/dynamicQR/DetailedStatsSection';
import useDynamicQRStats from '@/hooks/useDynamicQRStats';
import { 
  QRCodeDetailsSkeleton, 
  StatsSummaryCardsSkeleton, 
  ChartSkeletons as DetailedStatsSectionSkeleton 
} from '@/components/dynamicQR/DynamicQRStatsSkeleton';

// Color palette for charts
const COLORS = ['#10B981', '#0EA5E9', '#8B5CF6', '#F43F5E', '#F59E0B', '#64748B'];

const DynamicQRStats = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: qrCode, isLoading: isLoadingQrCode } = useQuery({
    queryKey: ['dynamicQrCode', id],
    queryFn: () => id ? fetchDynamicQRCode(id) : null,
    enabled: !!id,
  });

  const { data: scanStats, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ['dynamicQrStats', id],
    queryFn: () => id ? fetchDynamicQRCodeScanStats(id) : null,
    enabled: !!id,
    refetchInterval: 30000, // Refetch every 30 seconds to get fresh data
  });

  console.log('DynamicQRStats render:', {
    id,
    qrCode,
    scanStats,
    isLoadingQrCode,
    isLoadingStats,
    statsError
  });

  // Process statistics data using the custom hook
  const { barChartData, pieChartData, firstScan, uniqueCountries } = useDynamicQRStats(scanStats);

  const isLoading = isLoadingQrCode || isLoadingStats;
console.log("scanStats", scanStats);
console.log("barChartData", barChartData);
console.log("pieChartData", pieChartData);
console.log("firstScan", firstScan);
  if (statsError) {
    console.error('Stats error:', statsError);
  }

  if (!qrCode && !isLoading) {
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Navigation */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dynamic-qr')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/dynamic-qr')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dynamic QR Codes
            </Button>
          </div>
          
          {/* Debug Info (remove this in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-gray-100 rounded text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>Total Scans: {scanStats?.totalScans || 0}</p>
              <p>Raw Scans Length: {scanStats?.rawScans?.length || 0}</p>
              <p>Bar Chart Data Length: {barChartData.length}</p>
              <p>Pie Chart Data Length: {pieChartData.length}</p>
              <p>Loading: {isLoading.toString()}</p>
              <p>Error: {statsError ? statsError.message : 'None'}</p>
            </div>
          )}
          
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-6">
            {/* Mobile QR Code Details Sheet */}
            <div className="flex justify-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full max-w-xs">
                    <Menu className="mr-2 h-4 w-4" />
                    View QR Details
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <div className="py-4">
                    {isLoading ? (
                      <QRCodeDetailsSkeleton />
                    ) : (
                      <QRCodeDetails 
                        qrCode={qrCode!} 
                        onEdit={() => {
                          navigate(`/dynamic-qr/edit/${qrCode!.id}`);
                        }}
                      />
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Mobile Stats */}
            {isLoading ? (
              <>
                <StatsSummaryCardsSkeleton />
                <DetailedStatsSectionSkeleton />
              </>
            ) : (
              <>
                <StatsSummaryCards 
                  totalScans={scanStats?.totalScans || 0}
                  uniqueCountries={uniqueCountries}
                  firstScan={firstScan}
                />
                
                <DetailedStatsSection
                  barChartData={barChartData}
                  pieChartData={pieChartData}
                  scans={scanStats?.rawScans || []}
                  colors={COLORS}
                />
              </>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-1">
              {isLoading ? (
                <QRCodeDetailsSkeleton />
              ) : (
                <QRCodeDetails 
                  qrCode={qrCode!} 
                  onEdit={() => navigate(`/dynamic-qr/edit/${qrCode!.id}`)} 
                />
              )}
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              {isLoading ? (
                <>
                  <StatsSummaryCardsSkeleton />
                  <DetailedStatsSectionSkeleton />
                </>
              ) : (
                <>
                  <StatsSummaryCards 
                    totalScans={scanStats?.totalScans || 0}
                    uniqueCountries={uniqueCountries}
                    firstScan={firstScan}
                  />
                  
                  <DetailedStatsSection
                    barChartData={barChartData}
                    pieChartData={pieChartData}
                    scans={scanStats?.rawScans || []}
                    colors={COLORS}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DynamicQRStats;
