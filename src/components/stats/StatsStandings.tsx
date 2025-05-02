
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface StatsStandingsProps {
  standings: any[] | undefined;
}

export const StatsStandings = ({ standings }: StatsStandingsProps) => {
  return (
    <Card className="transform transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle>Classement</CardTitle>
      </CardHeader>
      <CardContent>
        {standings ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pos</TableHead>
                  <TableHead>Équipe</TableHead>
                  <TableHead className="text-center">J</TableHead>
                  <TableHead className="text-center">V</TableHead>
                  <TableHead className="text-center">N</TableHead>
                  <TableHead className="text-center">D</TableHead>
                  <TableHead className="text-center">BP</TableHead>
                  <TableHead className="text-center">BC</TableHead>
                  <TableHead className="text-center">Pts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((team) => (
                  <TableRow key={team.team} className={team.team === "Real Madrid" ? "bg-madrid-blue/10 font-bold" : "hover:bg-muted/50"}>
                    <TableCell>{team.position}</TableCell>
                    <TableCell className="font-medium">{team.team}</TableCell>
                    <TableCell className="text-center">{team.played}</TableCell>
                    <TableCell className="text-center">{team.won}</TableCell>
                    <TableCell className="text-center">{team.drawn}</TableCell>
                    <TableCell className="text-center">{team.lost}</TableCell>
                    <TableCell className="text-center">{team.goalsFor}</TableCell>
                    <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                    <TableCell className="text-center font-bold">{team.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-20">
            <p className="text-gray-500">Données non disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
