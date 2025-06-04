
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`w-8 h-8 rounded-full ${stat.color} flex items-center justify-center`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <Badge variant="secondary" className="mt-1 text-xs">
              {stat.trend}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
