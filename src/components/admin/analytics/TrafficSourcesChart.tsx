import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Link2, Globe, Search, Share2, Mail } from 'lucide-react';

interface TrafficSource {
  name: string;
  value: number;
  percentage: number;
}

interface TrafficSourcesChartProps {
  data: TrafficSource[];
}

const COLORS = ['hsl(210, 79%, 46%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(0, 84%, 60%)'];

const sourceIcons: Record<string, React.ReactNode> = {
  direct: <Globe className="h-4 w-4" />,
  organic: <Search className="h-4 w-4" />,
  referral: <Link2 className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
};

const TrafficSourcesChart = ({ data }: TrafficSourcesChartProps) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {item.value.toLocaleString()} visites ({item.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          Sources de Trafic
        </CardTitle>
        <CardDescription>D'où viennent vos visiteurs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{totalValue > 1000 ? `${(totalValue / 1000).toFixed(1)}K` : totalValue}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {data.map((source, index) => (
              <div key={source.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex items-center gap-2 flex-1">
                  {sourceIcons[source.name.toLowerCase()] || <Globe className="h-4 w-4" />}
                  <span className="text-sm font-medium capitalize">{source.name}</span>
                </div>
                <span className="text-sm font-semibold">{source.percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficSourcesChart;
