
import { useMemo } from 'react';
import { DynamicQRScan } from '@/lib/api';

interface UseQRStatsResult {
  barChartData: Array<{ date: string; scans: number }>;
  pieChartData: Array<{ name: string; value: number }>;
  firstScan: DynamicQRScan | null;
  uniqueCountries: number;
}

export interface QRStatData {
  totalScans: number;
  scansByDate: Record<string, number>;
  scansByCountry: Record<string, number>;
  rawScans: DynamicQRScan[];
}

const useDynamicQRStats = (scanStats: QRStatData | undefined): UseQRStatsResult => {
  const barChartData = useMemo(() => {
    if (!scanStats || !scanStats.scansByDate) return [];
    
    return Object.entries(scanStats.scansByDate)
      .map(([date, count]) => ({
        date,
        scans: count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days
  }, [scanStats]);

  const pieChartData = useMemo(() => {
    if (!scanStats || !scanStats.scansByCountry) return [];
    
    return Object.entries(scanStats.scansByCountry)
      .map(([country, count]) => ({
        name: country,
        value: count as number,
      }))
      .sort((a, b) => b.value - a.value);
  }, [scanStats]);

  const firstScan = useMemo(() => {
    if (!scanStats?.rawScans || scanStats.rawScans.length === 0) return null;
    return scanStats.rawScans[scanStats.rawScans.length - 1];
  }, [scanStats]);

  const uniqueCountries = useMemo(() => {
    if (!scanStats?.scansByCountry) return 0;
    return Object.keys(scanStats.scansByCountry).length;
  }, [scanStats]);

  return {
    barChartData,
    pieChartData,
    firstScan,
    uniqueCountries,
  };
};

export default useDynamicQRStats;
