import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Smartphone, Monitor, Tablet, Chrome, Globe } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DeviceStat {
  name: string;
  value: number;
  percentage: number;
}

interface DeviceBrowserStatsProps {
  deviceStats: DeviceStat[];
  browserStats: DeviceStat[];
}

const DEVICE_COLORS = ['hsl(210, 79%, 46%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)'];
const BROWSER_COLORS = ['hsl(280, 65%, 60%)', 'hsl(0, 84%, 60%)', 'hsl(210, 79%, 46%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)'];

const getDeviceIcon = (device: string) => {
  switch (device.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-5 w-5" />;
    case 'tablet':
      return <Tablet className="h-5 w-5" />;
    default:
      return <Monitor className="h-5 w-5" />;
  }
};

const getBrowserIcon = (browser: string) => {
  if (browser.toLowerCase().includes('chrome')) return <Chrome className="h-4 w-4" />;
  return <Globe className="h-4 w-4" />;
};

const DeviceBrowserStats = ({ deviceStats, browserStats }: DeviceBrowserStatsProps) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium capitalize">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {item.value.toLocaleString()} ({item.percentage?.toFixed(1) || 0}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Devices */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Appareils
          </CardTitle>
          <CardDescription>Répartition par type d'appareil</CardDescription>
        </CardHeader>
        <CardContent>
          {deviceStats.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={deviceStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deviceStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-4">
                {deviceStats.map((stat, index) => (
                  <div key={stat.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: DEVICE_COLORS[index % DEVICE_COLORS.length] }}
                        />
                        {getDeviceIcon(stat.name)}
                        <span className="text-sm font-medium capitalize">{stat.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{stat.percentage?.toFixed(0) || 0}%</span>
                    </div>
                    <Progress 
                      value={stat.percentage || 0} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </CardContent>
      </Card>

      {/* Browsers */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Chrome className="h-5 w-5 text-primary" />
            Navigateurs
          </CardTitle>
          <CardDescription>Répartition par navigateur</CardDescription>
        </CardHeader>
        <CardContent>
          {browserStats.length > 0 ? (
            <div className="space-y-4">
              {browserStats.slice(0, 5).map((stat, index) => (
                <div key={stat.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: BROWSER_COLORS[index % BROWSER_COLORS.length] }}
                      />
                      {getBrowserIcon(stat.name)}
                      <span className="text-sm font-medium">{stat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{stat.value.toLocaleString()}</span>
                      <span className="text-sm font-semibold">{stat.percentage?.toFixed(0) || 0}%</span>
                    </div>
                  </div>
                  <Progress 
                    value={stat.percentage || 0} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceBrowserStats;
