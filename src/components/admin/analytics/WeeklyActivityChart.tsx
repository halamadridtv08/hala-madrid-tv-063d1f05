import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar } from 'lucide-react';

interface DayActivity {
  day: string;
  shortDay: string;
  views: number;
  isToday?: boolean;
}

interface WeeklyActivityChartProps {
  data: DayActivity[];
}

const WeeklyActivityChart = ({ data }: WeeklyActivityChartProps) => {
  const maxViews = Math.max(...data.map(d => d.views), 1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value.toLocaleString()} visites
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="px-4 pb-4 sm:px-6">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          7 Derniers Jours
        </CardTitle>
        <CardDescription>Visites par jour (période glissante)</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {data.some(d => d.views > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} barCategoryGap="20%" margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
              <XAxis 
                dataKey="shortDay" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
              <Bar 
                dataKey="views" 
                radius={[6, 6, 0, 0]}
                fill="hsl(210, 79%, 46%)"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Aucune donnée disponible
          </div>
        )}
        
        {/* Day labels with highlighting */}
        <div className="grid grid-cols-7 gap-0.5 mt-3">
          {data.map((day, index) => (
            <div 
              key={index}
              className={`flex min-w-0 flex-col items-center rounded-md px-0.5 py-1 transition-colors ${
                day.isToday ? 'bg-primary/10' : ''
              }`}
            >
              <span className={`text-[10px] min-[390px]:text-xs font-medium ${day.isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                <span className="min-[390px]:hidden">{day.shortDay.charAt(0)}</span>
                <span className="hidden min-[390px]:inline">{day.shortDay}</span>
              </span>
              <span className={`text-sm font-bold ${day.isToday ? 'text-primary' : ''}`}>
                {day.views >= 1000 ? `${(day.views / 1000).toFixed(1)}K` : day.views}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyActivityChart;
