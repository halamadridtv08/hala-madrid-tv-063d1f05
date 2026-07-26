import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface HourlyHeatmapProps {
  // matrix[day 0-6 (lun..dim)][hour 0-23] = views
  matrix: number[][];
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const HourlyHeatmap = ({ matrix }: HourlyHeatmapProps) => {
  const max = Math.max(1, ...matrix.flat());

  const colorFor = (v: number) => {
    if (v === 0) return 'bg-muted/40';
    const ratio = v / max;
    if (ratio > 0.75) return 'bg-primary';
    if (ratio > 0.5) return 'bg-primary/70';
    if (ratio > 0.25) return 'bg-primary/45';
    if (ratio > 0.1) return 'bg-primary/25';
    return 'bg-primary/15';
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Activité par heure et jour
        </CardTitle>
        <CardDescription>
          Répartition des pages vues sur une semaine — identifiez les heures de pointe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid" style={{ gridTemplateColumns: '40px repeat(24, minmax(0, 1fr))' }}>
              <div />
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="text-[10px] text-muted-foreground text-center">
                  {h % 3 === 0 ? `${h}h` : ''}
                </div>
              ))}
              {matrix.map((row, dayIdx) => (
                <React.Fragment key={dayIdx}>
                  <div className="text-xs text-muted-foreground pr-2 py-1 flex items-center">
                    {DAYS[dayIdx]}
                  </div>
                  {row.map((v, h) => (
                    <div
                      key={h}
                      title={`${DAYS[dayIdx]} ${h}h — ${v} vues`}
                      className={`aspect-square m-[1px] rounded-sm ${colorFor(v)} transition-colors`}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <span>Moins</span>
              <div className="w-3 h-3 rounded-sm bg-muted/40" />
              <div className="w-3 h-3 rounded-sm bg-primary/25" />
              <div className="w-3 h-3 rounded-sm bg-primary/45" />
              <div className="w-3 h-3 rounded-sm bg-primary/70" />
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span>Plus</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HourlyHeatmap;