
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, FileText, Video } from "lucide-react";

interface QuickStatsCardProps {
  playersCount: number;
  coachesCount: number;
  articlesCount: number;
  videosCount: number;
  matchesCount: number;
}

export function QuickStatsCard({ 
  playersCount, 
  coachesCount, 
  articlesCount, 
  videosCount, 
  matchesCount 
}: QuickStatsCardProps) {
  const stats = [
    {
      title: "Joueurs",
      value: playersCount,
      icon: Users,
      color: "bg-blue-500",
      trend: "+2 ce mois"
    },
    {
      title: "Entraîneurs",
      value: coachesCount,
      icon: Users,
      color: "bg-green-500",
      trend: "Stable"
    },
    {
      title: "Articles",
      value: articlesCount,
      icon: FileText,
      color: "bg-purple-500",
      trend: "+5 cette semaine"
    },
    {
      title: "Vidéos",
      value: videosCount,
      icon: Video,
      color: "bg-orange-500",
      trend: "+3 récemment"
    },
    {
      title: "Matchs",
      value: matchesCount,
      icon: Calendar,
      color: "bg-red-500",
      trend: "Saison en cours"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${stat.color} flex items-center justify-center`}>
              <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
            <Badge variant="secondary" className="mt-1 text-[10px] sm:text-xs hidden sm:inline-flex">
              {stat.trend}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
