import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, TrendingUp, FileText, Star } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Article {
  id: string;
  title: string;
  category: string;
  view_count: number;
  trend?: number;
}

interface TopContentTableProps {
  articles: Article[];
  title?: string;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    actualités: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    transferts: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    matchs: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    analyse: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    interview: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  };
  return colors[category.toLowerCase()] || 'bg-muted text-muted-foreground';
};

const TopContentTable = ({ articles, title = "Articles Les Plus Lus" }: TopContentTableProps) => {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>Top 10 des articles par nombre de vues</CardDescription>
      </CardHeader>
      <CardContent>
        {articles.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Article</TableHead>
                <TableHead className="w-24 text-center">Vues</TableHead>
                <TableHead className="w-24 text-center">Tendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article, index) => (
                <TableRow key={article.id} className="hover:bg-muted/50">
                  <TableCell>
                    {index < 3 ? (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                        <Star className={`h-3 w-3 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}`} fill="currentColor" />
                      </div>
                    ) : (
                      <span className="text-muted-foreground font-medium">{index + 1}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium line-clamp-1">{article.title}</p>
                      <Badge variant="outline" className={getCategoryColor(article.category)}>
                        {article.category}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {article.view_count >= 1000 
                          ? `${(article.view_count / 1000).toFixed(1)}K`
                          : article.view_count}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {article.trend !== undefined ? (
                        <Badge 
                          variant="outline" 
                          className={article.trend >= 0 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'}
                        >
                          <TrendingUp className={`h-3 w-3 mr-1 ${article.trend < 0 ? 'rotate-180' : ''}`} />
                          {Math.abs(article.trend)}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-30" />
            <p>Aucun article disponible</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopContentTable;
