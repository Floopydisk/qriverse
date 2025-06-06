
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
  console.log('useDynamicQRStats called with:', scanStats);

  const barChartData = useMemo(() => {
    console.log('Processing bar chart data...');
    
    if (!scanStats || !scanStats.scansByDate) {
      console.log('No scan stats or scansByDate available for bar chart');
      return [];
    }
    
    console.log('scansByDate entries:', Object.entries(scanStats.scansByDate));
    
    const chartData = Object.entries(scanStats.scansByDate)
      .map(([date, count]) => {
        const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        console.log(`Converting date ${date} to ${formattedDate}, count: ${count}`);
        return {
          date: formattedDate,
          scans: count,
        };
      })
      .sort((a, b) => {
        // Sort by actual date, not formatted string
        const dateA = Object.entries(scanStats.scansByDate).find(([_, count]) => count === a.scans)?.[0];
        const dateB = Object.entries(scanStats.scansByDate).find(([_, count]) => count === b.scans)?.[0];
        return new Date(dateA || '').getTime() - new Date(dateB || '').getTime();
      })
      .slice(-14); // Last 14 days
    
    console.log('Final bar chart data:', chartData);
    return chartData;
  }, [scanStats]);

  const pieChartData = useMemo(() => {
    console.log('Processing pie chart data...');
    
    if (!scanStats || !scanStats.scansByCountry) {
      console.log('No scan stats or scansByCountry available for pie chart');
      return [];
    }
    
    console.log('scansByCountry entries:', Object.entries(scanStats.scansByCountry));
    
    const chartData = Object.entries(scanStats.scansByCountry)
      .map(([country, count]) => {
        console.log(`Country: ${country}, Count: ${count}`);
        return {
          name: country,
          value: count as number,
        };
      })
      .sort((a, b) => b.value - a.value);
    
    console.log('Final pie chart data:', chartData);
    return chartData;
  }, [scanStats]);

  const firstScan = useMemo(() => {
    console.log('Processing first scan...');
    
    if (!scanStats?.rawScans || scanStats.rawScans.length === 0) {
      console.log('No raw scans available for first scan');
      return null;
    }
    
    console.log('Available scans:', scanStats.rawScans.length);
    console.log('Scans ordered by scanned_at (desc):', scanStats.rawScans.map(s => s.scanned_at));
    
    // Since scans are ordered by scanned_at descending, the first scan chronologically is the last in the array
    const chronologicallyFirstScan = scanStats.rawScans[scanStats.rawScans.length - 1];
    console.log('First scan chronologically:', chronologicallyFirstScan);
    return chronologicallyFirstScan;
  }, [scanStats]);

  const uniqueCountries = useMemo(() => {
    console.log('Processing unique countries...');
    
    if (!scanStats?.scansByCountry) {
      console.log('No scansByCountry available for unique countries');
      return 0;
    }
    
    const countries = Object.keys(scanStats.scansByCountry);
    console.log('Unique countries:', countries);
    const count = countries.length;
    console.log('Unique countries count:', count);
    return count;
  }, [scanStats]);

  const result = {
    barChartData,
    pieChartData,
    firstScan,
    uniqueCountries,
  };

  console.log('useDynamicQRStats result:', result);
  return result;
};

export default useDynamicQRStats;
