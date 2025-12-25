import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  previousValue?: string | number;
  iconBgColor?: string;
  iconColor?: string;
}

const AnalyticsStatCard = ({
  title,
  value,
  icon,
  trend,
  trendLabel = 'vs période précédente',
  previousValue,
  iconBgColor = 'bg-primary/10',
  iconColor = 'text-primary',
}: AnalyticsStatCardProps) => {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return <Minus className="h-3 w-3" />;
    return trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-muted-foreground';
    return trend > 0 ? 'text-emerald-500' : 'text-red-500';
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{formatValue(value)}</span>
              {trend !== undefined && (
                <div className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
                  {getTrendIcon()}
                  <span>{Math.abs(trend).toFixed(1)}%</span>
                </div>
              )}
            </div>
            {previousValue !== undefined && (
              <p className="text-xs text-muted-foreground">
                vs. {formatValue(previousValue)} {trendLabel}
              </p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', iconBgColor)}>
            <div className={cn(iconColor)}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsStatCard;
