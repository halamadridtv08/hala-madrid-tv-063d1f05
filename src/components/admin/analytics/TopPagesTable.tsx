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
    <CardContent className="px-4 sm:px-6">
      {pages.length ? (
        <div className="max-w-full overflow-x-auto">
          <Table className="table-fixed sm:table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-12 sm:table-cell">#</TableHead>
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Vues</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Visiteurs</TableHead>
                <TableHead className="hidden text-right md:table-cell">Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((p, i) => (
                <TableRow key={p.path} className="hover:bg-muted/50">
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{i + 1}</TableCell>
                  <TableCell className="max-w-[180px] truncate font-mono text-xs sm:max-w-[320px]" title={p.path}>
                    {p.path || '/'}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{p.views}</TableCell>
                  <TableCell className="hidden text-right sm:table-cell">{p.visitors}</TableCell>
                  <TableCell className="hidden text-right md:table-cell">{p.sessions}</TableCell>
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