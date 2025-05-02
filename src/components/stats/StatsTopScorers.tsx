
import { ChartBarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, ChartTooltip } from "recharts";

interface StatsTopScorersProps {
  topScorers: any[] | undefined;
}

export const StatsTopScorers = ({ topScorers }: StatsTopScorersProps) => {
  return (
    <Card className="transform transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-madrid-gold" />
          Meilleurs Buteurs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topScorers ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ChartContainer
                config={{
                  goals: { color: "#00529F" }
                }}
                className="h-72"
              >
                <BarChart data={topScorers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="goals" name="Buts" fill="#00529F" />
                </BarChart>
              </ChartContainer>
            </div>
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Joueur</TableHead>
                    <TableHead className="text-right">Buts</TableHead>
                    <TableHead className="text-right">Matchs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topScorers.map((player) => (
                    <TableRow key={player.name} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                        </div>
                        {player.name}
                      </TableCell>
                      <TableCell className="text-right">{player.goals}</TableCell>
                      <TableCell className="text-right">{player.matches}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-72">
            <p className="text-gray-500">Données non disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
