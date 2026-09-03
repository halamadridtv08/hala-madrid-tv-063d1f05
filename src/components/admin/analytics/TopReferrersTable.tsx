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
    <CardContent>
      {referrers.length ? (
        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Visites</TableHead>
              <TableHead className="text-right">Visiteurs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrers.map((r) => (
              <TableRow key={r.source} className="hover:bg-muted/50">
                <TableCell className="font-medium truncate max-w-[260px]" title={r.source}>
                  {r.source}
                </TableCell>
                <TableCell className="text-right font-semibold">{r.visits}</TableCell>
                <TableCell className="text-right">{r.visitors}</TableCell>
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