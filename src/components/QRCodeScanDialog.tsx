
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCode, fetchQRCodeScanStats } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

interface QRCodeScanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: QRCode;
}

interface ScanData {
  created_at: string;
  country: string | null;
  user_agent: string | null;
}

interface ChartData {
  date: string;
  scans: number;
}

const QRCodeScanDialog = ({ isOpen, onClose, qrCode }: QRCodeScanDialogProps) => {
  const [scanData, setScanData] = useState<ScanData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScanData = async () => {
      if (isOpen && qrCode) {
        setLoading(true);
        try {
          const data = await fetchQRCodeScanStats(qrCode.id);
          setScanData(data);
          
          // Process data for the chart
          const dateMap = new Map<string, number>();
          data.forEach((scan: ScanData) => {
            const date = new Date(scan.created_at).toLocaleDateString();
            const count = dateMap.get(date) || 0;
            dateMap.set(date, count + 1);
          });
          
          const chartDataArray = Array.from(dateMap.entries()).map(([date, scans]) => ({
            date,
            scans
          }));
          
          // Sort by date
          chartDataArray.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
          });
          
          setChartData(chartDataArray);
        } catch (error) {
          console.error("Error loading scan data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadScanData();
  }, [isOpen, qrCode]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>QR Code Scan Analytics</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{qrCode.name}</h3>
            <div className="text-sm text-muted-foreground">Total Scans: {qrCode.scan_count || 0}</div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="chart">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="mt-4">
                <Card className="p-4">
                  {chartData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="scans" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      No scan data available
                    </div>
                  )}
                </Card>
              </TabsContent>
              
              <TabsContent value="details" className="mt-4">
                <Card className="p-4">
                  {scanData.length > 0 ? (
                    <div className="max-h-[300px] overflow-auto">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-background">
                          <tr className="border-b">
                            <th className="text-left p-2">Date & Time</th>
                            <th className="text-left p-2">Location</th>
                            <th className="text-left p-2">Device</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scanData.map((scan, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{new Date(scan.created_at).toLocaleString()}</td>
                              <td className="p-2">{scan.country || "Unknown"}</td>
                              <td className="p-2 text-xs">
                                {scan.user_agent 
                                  ? (scan.user_agent.length > 40 
                                    ? scan.user_agent.substring(0, 40) + "..." 
                                    : scan.user_agent)
                                  : "Unknown"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      No scan data available
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanDialog;
