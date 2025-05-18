
import { CardContent, CardHeader, CardTitle, Card } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ScansOverTimeChartProps {
  scansData: Array<{
    date: string;
    scans: number;
  }>;
}

const ScansOverTimeChart = ({ scansData }: ScansOverTimeChartProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          Scans Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {scansData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scansData}>
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
  );
};

export default ScansOverTimeChart;
