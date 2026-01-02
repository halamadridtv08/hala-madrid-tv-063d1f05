import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, AlertTriangle, Download, Archive, RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSiteContent } from "@/hooks/useSiteContent";
import Papa from "papaparse";

interface DataCounts {
  playerStats: number;
  matches: number;
  liveBlogEntries: number;
  predictions: number;
}

const generateSeasonOptions = () => {
  const currentYear = new Date().getFullYear();
  const seasons = [];
  for (let i = -1; i < 5; i++) {
    const startYear = currentYear + i;
    seasons.push(`${startYear}/${(startYear + 1).toString().slice(-2)}`);
  }
  return seasons;
};

export function SeasonResetManager() {
  const { getContent, updateContent, loading: contentLoading } = useSiteContent();
  const [currentSeason, setCurrentSeason] = useState<string>("");
  const [newSeason, setNewSeason] = useState<string>("");
  const [dataCounts, setDataCounts] = useState<DataCounts>({
    playerStats: 0,
    matches: 0,
    liveBlogEntries: 0,
    predictions: 0,
  });
  const [options, setOptions] = useState({
    exportCSV: true,
    resetPredictions: true,
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState("");

  useEffect(() => {
    const season = getContent("current_season", "2025/26");
    setCurrentSeason(season);
  }, [getContent, contentLoading]);

  useEffect(() => {
    fetchDataCounts();
  }, []);

  const fetchDataCounts = async () => {
    try {
      const [statsRes, matchesRes, blogRes, predictionsRes] = await Promise.all([
        supabase.from("player_stats").select("id", { count: "exact", head: true }),
        supabase.from("matches").select("id", { count: "exact", head: true }),
        supabase.from("live_blog_entries").select("id", { count: "exact", head: true }),
        supabase.from("prediction_leaderboard").select("id", { count: "exact", head: true }),
      ]);

      setDataCounts({
        playerStats: statsRes.count || 0,
        matches: matchesRes.count || 0,
        liveBlogEntries: blogRes.count || 0,
        predictions: predictionsRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching data counts:", error);
    }
  };

  const downloadBackup = async () => {
    setLoading(true);
    try {
      const [statsRes, matchesRes, blogRes, predictionsRes] = await Promise.all([
        supabase.from("player_stats").select("*"),
        supabase.from("matches").select("*"),
        supabase.from("live_blog_entries").select("*"),
        supabase.from("prediction_leaderboard").select("*"),
      ]);

      const backup = {
        season: currentSeason,
        exportedAt: new Date().toISOString(),
        data: {
          player_stats: statsRes.data || [],
          matches: matchesRes.data || [],
          live_blog_entries: blogRes.data || [],
          prediction_leaderboard: predictionsRes.data || [],
        },
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-saison-${currentSeason.replace("/", "-")}-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Backup téléchargé avec succès");
    } catch (error) {
      console.error("Error downloading backup:", error);
      toast.error("Erreur lors du téléchargement du backup");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    setLoading(true);
    try {
      const { data: stats } = await supabase.from("player_stats").select(`
        *,
        players:player_id (name),
        matches:match_id (home_team, away_team, match_date, competition)
      `);

      if (stats && stats.length > 0) {
        const csvData = stats.map((stat: any) => ({
          player: stat.players?.name || "N/A",
          match: stat.matches ? `${stat.matches.home_team} vs ${stat.matches.away_team}` : "N/A",
          date: stat.matches?.match_date || "N/A",
          competition: stat.matches?.competition || "N/A",
          goals: stat.goals,
          assists: stat.assists,
          minutes_played: stat.minutes_played,
          yellow_cards: stat.yellow_cards,
          red_cards: stat.red_cards,
          rating: stat.rating,
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `stats-joueurs-${currentSeason.replace("/", "-")}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success("Export CSV téléchargé");
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Erreur lors de l'export CSV");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSeason = async () => {
    if (confirmText !== "CONFIRMER ARCHIVAGE") {
      toast.error("Veuillez saisir 'CONFIRMER ARCHIVAGE' pour continuer");
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Download backup first
      setProcessStep("Téléchargement du backup...");
      await downloadBackup();

      // Step 2: Archive player stats
      setProcessStep("Archivage des statistiques joueurs...");
      const { data: playerStats } = await supabase.from("player_stats").select("*");
      if (playerStats && playerStats.length > 0) {
        const archiveData = playerStats.map((stat) => ({
          season: currentSeason,
          original_id: stat.id,
          player_id: stat.player_id,
          match_id: stat.match_id,
          goals: stat.goals,
          assists: stat.assists,
          minutes_played: stat.minutes_played,
          yellow_cards: stat.yellow_cards,
          red_cards: stat.red_cards,
          saves: stat.saves,
          clean_sheets: stat.clean_sheets,
          goals_conceded: stat.goals_conceded,
          passes_completed: stat.passes_completed,
          pass_accuracy: stat.pass_accuracy,
          tackles: stat.tackles,
          interceptions: stat.interceptions,
          rating: (stat as any).rating || null,
        }));
        await supabase.from("season_player_stats_archive").insert(archiveData);
      }

      // Step 3: Archive matches
      setProcessStep("Archivage des matchs...");
      const { data: matches } = await supabase.from("matches").select("*");
      if (matches && matches.length > 0) {
        const archiveData = matches.map((match) => ({
          season: currentSeason,
          original_id: match.id,
          home_team: match.home_team,
          away_team: match.away_team,
          home_score: match.home_score,
          away_score: match.away_score,
          match_date: match.match_date,
          competition: match.competition,
          venue: match.venue,
          status: match.status,
          home_team_logo: match.home_team_logo,
          away_team_logo: match.away_team_logo,
          match_details: match.match_details,
        }));
        await supabase.from("season_matches_archive").insert(archiveData);
      }

      // Step 4: Archive predictions
      setProcessStep("Archivage du classement pronostics...");
      const { data: predictions } = await supabase.from("prediction_leaderboard").select("*");
      if (predictions && predictions.length > 0) {
        const archiveData = predictions.map((pred) => ({
          season: currentSeason,
          user_id: pred.user_id,
          total_points: pred.total_points,
          correct_scores: pred.correct_scores,
          correct_outcomes: pred.correct_outcomes,
          total_predictions: pred.total_predictions,
          current_streak: pred.current_streak,
          best_streak: pred.best_streak,
        }));
        await supabase.from("season_predictions_archive").insert(archiveData);
      }

      // Step 5: Archive live blog entries
      setProcessStep("Archivage des entrées live blog...");
      const { data: blogEntries } = await supabase.from("live_blog_entries").select("*");
      if (blogEntries && blogEntries.length > 0) {
        const archiveData = blogEntries.map((entry) => ({
          season: currentSeason,
          original_id: entry.id,
          match_id: entry.match_id,
          entry_type: entry.entry_type,
          content: entry.content,
          title: entry.title,
          minute: entry.minute,
          player_id: entry.player_id,
          team_side: entry.team_side,
          is_important: entry.is_important,
          image_url: entry.image_url,
        }));
        await supabase.from("season_live_blog_archive").insert(archiveData);
      }

      // Step 6: Clear original tables
      setProcessStep("Nettoyage des tables...");
      await supabase.from("player_stats").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("live_blog_entries").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("match_formations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("match_formation_players").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("match_lineups").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("match_predictions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("match_probable_lineups").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("match_absent_players").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("match_timer_settings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      // Step 7: Reset prediction leaderboard
      if (options.resetPredictions) {
        setProcessStep("Réinitialisation du classement...");
        await supabase
          .from("prediction_leaderboard")
          .update({
            total_points: 0,
            correct_scores: 0,
            correct_outcomes: 0,
            total_predictions: 0,
            current_streak: 0,
          })
          .neq("id", "00000000-0000-0000-0000-000000000000");
      }

      // Step 8: Update current season
      setProcessStep("Mise à jour de la saison...");
      await updateContent("current_season", newSeason);

      // Step 9: Log the action
      await supabase.from("admin_audit_logs").insert({
        action: "season_reset",
        entity_type: "season",
        entity_id: newSeason,
        details: {
          old_season: currentSeason,
          new_season: newSeason,
          archived_stats: dataCounts.playerStats,
          archived_matches: dataCounts.matches,
          archived_blog_entries: dataCounts.liveBlogEntries,
          archived_predictions: dataCounts.predictions,
        },
      });

      toast.success(`Saison réinitialisée avec succès! Nouvelle saison: ${newSeason}`);
      setShowFinalConfirm(false);
      setShowConfirmDialog(false);
      setConfirmText("");
      setCurrentSeason(newSeason);
      await fetchDataCounts();
    } catch (error) {
      console.error("Error resetting season:", error);
      toast.error("Erreur lors de la réinitialisation de la saison");
    } finally {
      setIsProcessing(false);
      setProcessStep("");
    }
  };

  const seasonOptions = generateSeasonOptions();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gestion de la Saison
          </CardTitle>
          <CardDescription>
            Archivez les données de la saison actuelle et préparez la nouvelle saison
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Season Info */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Saison actuelle</p>
              <p className="text-2xl font-bold">{currentSeason || "Non définie"}</p>
            </div>
            <Badge variant="secondary" className="ml-auto">En cours</Badge>
          </div>

          {/* New Season Selection */}
          <div className="space-y-2">
            <Label htmlFor="new-season">Nouvelle saison</Label>
            <Select value={newSeason} onValueChange={setNewSeason}>
              <SelectTrigger id="new-season">
                <SelectValue placeholder="Sélectionner la nouvelle saison" />
              </SelectTrigger>
              <SelectContent>
                {seasonOptions.map((season) => (
                  <SelectItem key={season} value={season} disabled={season === currentSeason}>
                    {season} {season === currentSeason && "(actuelle)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Summary */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Données à archiver
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">{dataCounts.playerStats}</p>
                <p className="text-xs text-muted-foreground">Stats joueurs</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">{dataCounts.matches}</p>
                <p className="text-xs text-muted-foreground">Matchs</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">{dataCounts.liveBlogEntries}</p>
                <p className="text-xs text-muted-foreground">Entrées live</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">{dataCounts.predictions}</p>
                <p className="text-xs text-muted-foreground">Classement pronostics</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <h4 className="font-medium">Options</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="export-csv"
                  checked={options.exportCSV}
                  onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, exportCSV: !!checked }))}
                />
                <Label htmlFor="export-csv" className="text-sm">
                  Exporter également en CSV avant archivage
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="reset-predictions"
                  checked={options.resetPredictions}
                  onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, resetPredictions: !!checked }))}
                />
                <Label htmlFor="reset-predictions" className="text-sm">
                  Réinitialiser le classement des prédictions
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={downloadBackup} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger backup complet
            </Button>
            <Button variant="outline" onClick={exportCSV} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Exporter stats CSV
            </Button>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Attention - Action irréversible</AlertTitle>
            <AlertDescription>
              La réinitialisation de la saison va archiver toutes les données actuelles puis les supprimer
              des tables principales. Cette action est irréversible. Un backup sera téléchargé automatiquement.
            </AlertDescription>
          </Alert>

          {/* Reset Button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!newSeason || newSeason === currentSeason || loading}
            onClick={() => setShowConfirmDialog(true)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser la Saison
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog Step 1 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmer la réinitialisation
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>Vous êtes sur le point de réinitialiser la saison de <strong>{currentSeason}</strong> vers <strong>{newSeason}</strong>.</p>
              <p>Les actions suivantes seront effectuées :</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Téléchargement automatique d'un backup complet</li>
                <li>Archivage de {dataCounts.playerStats} statistiques joueurs</li>
                <li>Archivage de {dataCounts.matches} matchs</li>
                <li>Archivage de {dataCounts.liveBlogEntries} entrées live blog</li>
                <li>Archivage de {dataCounts.predictions} entrées du classement</li>
                <li>Suppression des données des tables principales</li>
                {options.resetPredictions && <li>Réinitialisation du classement pronostics</li>}
                <li>Mise à jour de la saison courante</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => { setShowConfirmDialog(false); setShowFinalConfirm(true); }}>
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <Dialog open={showFinalConfirm} onOpenChange={setShowFinalConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmation finale
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>Pour confirmer cette action irréversible, veuillez saisir :</p>
              <p className="font-mono font-bold text-center p-2 bg-muted rounded">CONFIRMER ARCHIVAGE</p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Saisir le texte de confirmation"
                disabled={isProcessing}
              />
              {isProcessing && (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{processStep}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowFinalConfirm(false); setConfirmText(""); }} disabled={isProcessing}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetSeason}
              disabled={confirmText !== "CONFIRMER ARCHIVAGE" || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
