
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Globe } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface CountryData {
  name: string;
  value: number;
}

interface CountryDistributionChartProps {
  countryData: CountryData[];
  colors: string[];
}

const CountryDistributionChart = ({ countryData, colors }: CountryDistributionChartProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2 text-primary" />
          Scans by Country
        </CardTitle>
      </CardHeader>
      <CardContent>
        {countryData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => {
                    // Ensure percent is always a number
                    const percentValue = Number(percent);
                    return `${name} ${Math.round(percentValue * 100)}%`;
                  }}
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
  );
};

export default CountryDistributionChart;
