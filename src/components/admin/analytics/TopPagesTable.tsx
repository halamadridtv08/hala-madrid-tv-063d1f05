import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LinkIcon } from 'lucide-react';

interface PageRow {
  path: string;
  views: number;
  visitors: number;
  sessions: number;
}

interface TopPagesTableProps {
  pages: PageRow[];
  title?: string;
  description?: string;
}

const TopPagesTable = ({
  pages,
  title = 'Top des pages',
  description = "Les pages les plus consultées sur la période",
}: TopPagesTableProps) => (
  <Card className="border-border/50">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">
        <LinkIcon className="h-5 w-5 text-primary" />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      {pages.length ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Vues</TableHead>
                <TableHead className="text-right">Visiteurs</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((p, i) => (
                <TableRow key={p.path} className="hover:bg-muted/50">
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-mono text-xs max-w-[320px] truncate" title={p.path}>
                    {p.path || '/'}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{p.views}</TableCell>
                  <TableCell className="text-right">{p.visitors}</TableCell>
                  <TableCell className="text-right">{p.sessions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center text-muted-foreground">
          Aucune donnée sur la période
        </div>
      )}
    </CardContent>
  </Card>
);

export default TopPagesTable;