import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink } from 'lucide-react';

interface RefRow {
  source: string;
  visits: number;
  visitors: number;
}

const TopReferrersTable = ({ referrers }: { referrers: RefRow[] }) => (
  <Card className="border-border/50">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">
        <ExternalLink className="h-5 w-5 text-primary" />
        Sites référents
      </CardTitle>
      <CardDescription>Domaines qui envoient le plus de trafic</CardDescription>
    </CardHeader>
    <CardContent className="px-4 sm:px-6">
      {referrers.length ? (
        <div className="max-w-full overflow-x-auto">
        <Table className="table-fixed sm:table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Visites</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Visiteurs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrers.map((r) => (
              <TableRow key={r.source} className="hover:bg-muted/50">
                <TableCell className="max-w-[180px] truncate font-medium sm:max-w-[260px]" title={r.source}>
                  {r.source}
                </TableCell>
                <TableCell className="text-right font-semibold">{r.visits}</TableCell>
                <TableCell className="hidden text-right sm:table-cell">{r.visitors}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center text-muted-foreground">
          Aucun référent identifié
        </div>
      )}
    </CardContent>
  </Card>
);

export default TopReferrersTable;