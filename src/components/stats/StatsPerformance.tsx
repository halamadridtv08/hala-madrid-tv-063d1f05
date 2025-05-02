
import { ChartPie } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

interface StatsPerformanceProps {
  teamPerformance: any[] | undefined;
}

export const StatsPerformance = ({ teamPerformance }: StatsPerformanceProps) => {
  // Couleurs pour les graphiques
  const COLORS = ["#00529F", "#FEBE10", "#FFFFFF", "#D5D5D5", "#111111"];

  return (
    <Card className="transform transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartPie className="h-5 w-5 text-madrid-gold" />
          Performance de l'Équipe
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teamPerformance ? (
          <ChartContainer
            config={{
              Victoires: { color: "#00529F" },
              Nuls: { color: "#FEBE10" },
              Défaites: { color: "#D5D5D5" }
            }}
            className="h-72"
          >
            <PieChart>
              <Pie
                data={teamPerformance}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {teamPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex justify-center items-center h-72">
            <p className="text-gray-500">Données non disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
