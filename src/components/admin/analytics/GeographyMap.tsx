import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe, MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CountryData {
  country: string;
  code: string;
  visitors: number;
  percentage: number;
  flag?: string;
}

interface GeographyMapProps {
  data: CountryData[];
  totalVisitors: number;
}

// Country flags as emoji
const countryFlags: Record<string, string> = {
  FR: '🇫🇷',
  ES: '🇪🇸',
  US: '🇺🇸',
  GB: '🇬🇧',
  DE: '🇩🇪',
  IT: '🇮🇹',
  PT: '🇵🇹',
  BE: '🇧🇪',
  NL: '🇳🇱',
  MA: '🇲🇦',
  DZ: '🇩🇿',
  CA: '🇨🇦',
  MX: '🇲🇽',
  AR: '🇦🇷',
  BR: '🇧🇷',
  CO: '🇨🇴',
  CL: '🇨🇱',
  unknown: '🌍',
};

const GeographyMap = ({ data, totalVisitors }: GeographyMapProps) => {
  const colors = [
    'bg-primary',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Géographie des Visiteurs
            </CardTitle>
            <CardDescription>Répartition par pays</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* World Map Visualization (Simplified) */}
        <div className="relative h-48 bg-muted/30 rounded-xl overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 1000 500" className="w-full h-full">
              {/* Simplified world map paths */}
              <path
                d="M150,200 Q200,150 300,180 Q400,160 500,200 Q600,180 700,220 Q750,200 800,230 L800,300 Q700,280 600,300 Q500,280 400,300 Q300,280 200,300 L150,280 Z"
                fill="currentColor"
                className="text-primary/30"
              />
              <path
                d="M100,150 Q150,120 200,140 Q250,130 280,160 L280,200 Q250,180 200,190 Q150,180 100,190 Z"
                fill="currentColor"
                className="text-primary/20"
              />
              <path
                d="M450,250 Q480,240 520,250 Q550,245 580,260 L580,320 Q550,310 520,320 Q480,310 450,320 Z"
                fill="currentColor"
                className="text-emerald-500/30"
              />
            </svg>
          </div>
          {/* Map pins for top countries */}
          {data.slice(0, 5).map((country, index) => {
            const positions = [
              { top: '35%', left: '45%' }, // France
              { top: '45%', left: '42%' }, // Spain
              { top: '30%', left: '25%' }, // US
              { top: '32%', left: '47%' }, // UK
              { top: '35%', left: '48%' }, // Germany
            ];
            const pos = positions[index] || { top: '50%', left: '50%' };
            return (
              <div
                key={country.code}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ top: pos.top, left: pos.left }}
              >
                <div className={`w-4 h-4 rounded-full ${colors[index]} animate-pulse shadow-lg`} />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {countryFlags[country.code] || countryFlags.unknown} {country.country}: {country.visitors.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Country List */}
        <div className="space-y-3">
          {data.length > 0 ? (
            data.slice(0, 6).map((country, index) => (
              <div key={country.code} className="flex items-center gap-3">
                <span className="text-xl">{countryFlags[country.code] || countryFlags.unknown}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{country.country}</span>
                    <span className="text-sm text-muted-foreground">{country.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={country.percentage} 
                    className="h-2"
                  />
                </div>
                <span className="text-sm font-semibold min-w-[60px] text-right">
                  {country.visitors.toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucune donnée géographique disponible</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographyMap;
