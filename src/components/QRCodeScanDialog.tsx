
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { QRCode, fetchQRCodeScanStats, ScanStat } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface QRCodeScanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: QRCode;
}

interface ScanData {
  id: string;
  created_at: string;
  qr_code_id: string;
  country: string;
  user_agent: string;
}

const QRCodeScanDialog = ({ isOpen, onClose, qrCode }: QRCodeScanDialogProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scans, setScans] = useState<ScanData[]>([]);

  useEffect(() => {
    if (isOpen) {
      const loadScanStats = async () => {
        setIsLoading(true);
        try {
          const stats = await fetchQRCodeScanStats(qrCode.id);
          // Convert ScanStat[] to ScanData[]
          const scanData: ScanData[] = stats.map(stat => ({
            id: stat.id,
            created_at: stat.created_at,
            qr_code_id: stat.qr_code_id,
            country: stat.country || 'Unknown',
            user_agent: stat.user_agent || 'Unknown'
          }));
          setScans(scanData);
        } catch (error) {
          console.error("Error loading scan stats:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadScanStats();
    }
  }, [isOpen, qrCode.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Scan Statistics</DialogTitle>
          <DialogDescription>
            Viewing scan statistics for "{qrCode.name}"
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No scan data available for this QR code.</p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(scan.created_at), "PP p")}
                    </TableCell>
                    <TableCell>
                      {scan.country || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {scan.user_agent
                        ? scan.user_agent.split(" ")[0]
                        : "Unknown"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanDialog;
