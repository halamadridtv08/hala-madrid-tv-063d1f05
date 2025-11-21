import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

export const StatsExporter = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, position')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des joueurs:', error);
    }
  };

  const loadPlayerStats = async (playerId: string) => {
    const { data: stats, error } = await supabase
      .from('player_stats')
      .select(`
        *,
        matches (
          match_date,
          home_team,
          away_team,
          competition
        )
      `)
      .eq('player_id', playerId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return stats || [];
  };

  const exportToPDF = async (playerData: any, stats: any[]) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text(`Statistiques - ${playerData.name}`, 14, 20);
    
    // Player info
    doc.setFontSize(12);
    doc.text(`Position: ${playerData.position}`, 14, 30);
    doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 37);
    
    // Summary stats
    const totalGoals = stats.reduce((sum, s) => sum + (s.goals || 0), 0);
    const totalAssists = stats.reduce((sum, s) => sum + (s.assists || 0), 0);
    const totalMinutes = stats.reduce((sum, s) => sum + (s.minutes_played || 0), 0);
    const totalYellow = stats.reduce((sum, s) => sum + (s.yellow_cards || 0), 0);
    const totalRed = stats.reduce((sum, s) => sum + (s.red_cards || 0), 0);
    
    doc.setFontSize(14);
    doc.text('Statistiques Totales', 14, 50);
    
    autoTable(doc, {
      startY: 55,
      head: [['Buts', 'Passes D.', 'Minutes', 'Cartons J.', 'Cartons R.']],
      body: [[totalGoals, totalAssists, totalMinutes, totalYellow, totalRed]],
    });
    
    // Detailed stats per match
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Détails par Match', 14, 20);
    
    const tableData = stats.map(stat => [
      new Date(stat.matches?.match_date || '').toLocaleDateString('fr-FR'),
      stat.matches?.competition || '-',
      `${stat.matches?.home_team} vs ${stat.matches?.away_team}`,
      stat.goals || 0,
      stat.assists || 0,
      stat.minutes_played || 0,
      stat.yellow_cards || 0,
      stat.red_cards || 0
    ]);
    
    autoTable(doc, {
      startY: 25,
      head: [['Date', 'Compétition', 'Match', 'Buts', 'Passes', 'Minutes', 'CJ', 'CR']],
      body: tableData,
      styles: { fontSize: 8 },
    });
    
    // Save PDF
    doc.save(`stats-${playerData.name}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = async (playerData: any, stats: any[]) => {
    // Summary sheet
    const totalGoals = stats.reduce((sum, s) => sum + (s.goals || 0), 0);
    const totalAssists = stats.reduce((sum, s) => sum + (s.assists || 0), 0);
    const totalMinutes = stats.reduce((sum, s) => sum + (s.minutes_played || 0), 0);
    const totalYellow = stats.reduce((sum, s) => sum + (s.yellow_cards || 0), 0);
    const totalRed = stats.reduce((sum, s) => sum + (s.red_cards || 0), 0);
    
    const summaryData = [
      ['Joueur', playerData.name],
      ['Position', playerData.position],
      ['Date d\'export', new Date().toLocaleDateString('fr-FR')],
      [],
      ['Statistiques Totales'],
      ['Buts', 'Passes Décisives', 'Minutes Jouées', 'Cartons Jaunes', 'Cartons Rouges'],
      [totalGoals, totalAssists, totalMinutes, totalYellow, totalRed]
    ];
    
    // Details sheet
    const detailsData = [
      ['Date', 'Compétition', 'Match', 'Buts', 'Passes D.', 'Minutes', 'Cartons J.', 'Cartons R.', 'Tirs', 'Passes Réussies', 'Tacles'],
      ...stats.map(stat => [
        new Date(stat.matches?.match_date || '').toLocaleDateString('fr-FR'),
        stat.matches?.competition || '-',
        `${stat.matches?.home_team} vs ${stat.matches?.away_team}`,
        stat.goals || 0,
        stat.assists || 0,
        stat.minutes_played || 0,
        stat.yellow_cards || 0,
        stat.red_cards || 0,
        stat.shots || 0,
        stat.passes_completed || 0,
        stat.tackles || 0
      ])
    ];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    const wsDetails = XLSX.utils.aoa_to_sheet(detailsData);
    
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Détails');
    
    // Save Excel
    XLSX.writeFile(wb, `stats-${playerData.name}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExport = async () => {
    if (!selectedPlayerId) {
      toast.error("Veuillez sélectionner un joueur");
      return;
    }

    setIsLoading(true);
    try {
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', selectedPlayerId)
        .single();

      if (playerError) throw playerError;

      const stats = await loadPlayerStats(selectedPlayerId);

      if (stats.length === 0) {
        toast.error("Aucune statistique disponible pour ce joueur");
        return;
      }

      if (exportFormat === 'pdf') {
        await exportToPDF(playerData, stats);
        toast.success("Export PDF réussi !");
      } else {
        await exportToExcel(playerData, stats);
        toast.success("Export Excel réussi !");
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error("Erreur lors de l'export des statistiques");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Export des Statistiques
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Joueur</label>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un joueur..." />
              </SelectTrigger>
              <SelectContent>
                {players.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} - {player.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={!selectedPlayerId || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Export en cours...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Exporter les statistiques
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
