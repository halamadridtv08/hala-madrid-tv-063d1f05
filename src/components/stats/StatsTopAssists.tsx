
import { ChartLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

interface StatsTopAssistsProps {
  topAssists: any[] | undefined;
}

export const StatsTopAssists = ({ topAssists }: StatsTopAssistsProps) => {
  return (
    <Card className="transform transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine className="h-5 w-5 text-madrid-gold" />
          Meilleurs Passeurs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topAssists ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="overflow-x-auto">
              <ChartContainer
                config={{
                  assists: { color: "#FEBE10" }
                }}
                className="h-72 min-w-[300px]"
              >
                <LineChart data={topAssists}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="assists" name="Passes décisives" stroke="#FEBE10" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Joueur</TableHead>
                    <TableHead className="text-right">Passes</TableHead>
                    <TableHead className="text-right">Matchs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAssists.map((player) => (
                    <TableRow key={player.name} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img src={player.image_url} alt={player.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="truncate">{player.name}</span>
                      </div>
                      </TableCell>
                      <TableCell className="text-right">{player.assists}</TableCell>
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
