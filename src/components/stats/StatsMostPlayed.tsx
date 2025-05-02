
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface StatsMostPlayedProps {
  mostPlayed: any[] | undefined;
}

export const StatsMostPlayed = ({ mostPlayed }: StatsMostPlayedProps) => {
  return (
    <Card className="transform transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle>Plus de Matchs Joués</CardTitle>
      </CardHeader>
      <CardContent>
        {mostPlayed ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Joueur</TableHead>
                <TableHead className="text-right">Matchs</TableHead>
                <TableHead className="text-right">Minutes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mostPlayed.map((player) => (
                <TableRow key={player.name} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                    </div>
                    {player.name}
                  </TableCell>
                  <TableCell className="text-right">{player.matches}</TableCell>
                  <TableCell className="text-right">{player.minutes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex justify-center items-center h-20">
            <p className="text-gray-500">Données non disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
