
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base lg:text-lg">
          <Calendar className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-primary" />
          Scans Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {scansData.length > 0 ? (
          <div className="h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scansData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  allowDecimals={false} 
                  fontSize={12}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: '12px',
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="scans" fill="#10B981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 lg:h-64 flex items-center justify-center text-muted-foreground text-sm">
            No scan data available yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScansOverTimeChart;
