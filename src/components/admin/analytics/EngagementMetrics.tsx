import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LogIn, LogOut } from 'lucide-react';

interface PagePathRow {
  path: string;
  count: number;
}

interface EngagementMetricsProps {
  entryPages: PagePathRow[];
  exitPages: PagePathRow[];
}

const List = ({
  title,
  description,
  icon,
  rows,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  rows: PagePathRow[];
}) => (
  <Card className="border-border/50">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">{icon}{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      {rows.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="text-right">Sessions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.path}>
                <TableCell className="font-mono text-xs max-w-[260px] truncate" title={r.path}>
                  {r.path || '/'}
                </TableCell>
                <TableCell className="text-right font-semibold">{r.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
          Aucune donnée
        </div>
      )}
    </CardContent>
  </Card>
);

const EngagementMetrics = ({ entryPages, exitPages }: EngagementMetricsProps) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <List
      title="Pages d'entrée"
      description="Première page vue par session (acquisition)"
      icon={<LogIn className="h-5 w-5 text-emerald-500" />}
      rows={entryPages}
    />
    <List
      title="Pages de sortie"
      description="Dernière page vue par session (points de fuite)"
      icon={<LogOut className="h-5 w-5 text-red-500" />}
      rows={exitPages}
    />
  </div>
);

export default EngagementMetrics;