
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

// import Header from '@/components/Header';
import FooterAuth from '@/components/FooterAuth';
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
import HeaderAvatar from '@/components/ui/header-avatar';

// Color palette for charts
const COLORS = ['#10B981', '#0EA5E9', '#8B5CF6', '#F43F5E', '#F59E0B', '#64748B'];

const DynamicQRStats = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch QR code details
  const { 
    data: qrCode, 
    isLoading: isLoadingQrCode, 
    error: qrCodeError,
    isError: isQrCodeError 
  } = useQuery({
    queryKey: ['dynamicQrCode', id],
    queryFn: () => fetchDynamicQRCode(id!),
    enabled: !!id,
    retry: 1,
  });

  // Fetch scan statistics
  const { 
    data: scanStats, 
    isLoading: isLoadingStats, 
    error: statsError,
    isError: isStatsError 
  } = useQuery({
    queryKey: ['dynamicQrStats', id],
    queryFn: () => fetchDynamicQRCodeScanStats(id!),
    enabled: !!id,
    retry: 1,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Process statistics data using the custom hook
  const { barChartData, pieChartData, firstScan, uniqueCountries } = useDynamicQRStats(scanStats);

  const isLoading = isLoadingQrCode || isLoadingStats;

  // Handle errors
  if (isQrCodeError || isStatsError) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderAvatar />
        <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="text-muted-foreground mt-2">
              {qrCodeError?.message || statsError?.message || "Failed to load QR code data"}
            </p>
            <Button onClick={() => navigate('/dynamic-qr')} className="mt-4">
              Back to Dynamic QR Codes
            </Button>
          </div>
        </main>
        <FooterAuth />
      </div>
    );
  }

  // Handle QR code not found
  if (!qrCode && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderAvatar />
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
        <FooterAuth />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <HeaderAvatar />
      
      <main className="flex-1 container mx-auto px-4 pb-12">
        <div className="max-w-7xl ">
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
                    ) : qrCode ? (
                      <QRCodeDetails 
                        qrCode={qrCode} 
                        onEdit={() => navigate(`/dynamic-qr/edit/${qrCode.id}`)}
                      />
                    ) : null}
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
              ) : qrCode ? (
                <QRCodeDetails 
                  qrCode={qrCode} 
                  onEdit={() => navigate(`/dynamic-qr/edit/${qrCode.id}`)} 
                />
              ) : null}
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

      <FooterAuth />
    </div>
  );
};

export default DynamicQRStats;
