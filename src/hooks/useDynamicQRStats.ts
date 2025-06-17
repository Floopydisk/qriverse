
import { useMemo } from 'react';
import { DynamicQRScan } from '@/lib/api';

export interface QRStatData {
  totalScans: number;
  scansByDate: Record<string, number>;
  scansByCountry: Record<string, number>;
  rawScans: DynamicQRScan[];
}

interface UseQRStatsResult {
  barChartData: Array<{ date: string; scans: number }>;
  pieChartData: Array<{ name: string; value: number }>;
  firstScan: DynamicQRScan | null;
  uniqueCountries: number;
}

const useDynamicQRStats = (scanStats: QRStatData | undefined): UseQRStatsResult => {
  const barChartData = useMemo(() => {
    if (!scanStats?.scansByDate) {
      return [];
    }
    
    // Get last 14 days of data
    const sortedEntries = Object.entries(scanStats.scansByDate)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .slice(-14);

    return sortedEntries.map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      scans: count,
    }));
  }, [scanStats]);

  const pieChartData = useMemo(() => {
    if (!scanStats?.scansByCountry) {
      return [];
    }
    
    return Object.entries(scanStats.scansByCountry)
      .map(([country, count]) => ({
        name: country,
        value: count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 countries
  }, [scanStats]);

  const firstScan = useMemo(() => {
    if (!scanStats?.rawScans || scanStats.rawScans.length === 0) {
      return null;
    }
    
    // Find the earliest scan
    const sortedScans = [...scanStats.rawScans].sort(
      (a, b) => new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime()
    );
    
    return sortedScans[0];
  }, [scanStats]);

  const uniqueCountries = useMemo(() => {
    if (!scanStats?.scansByCountry) {
      return 0;
    }
    
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
