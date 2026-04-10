
import React, { useState, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Match } from "@/types/Match";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MatchFormProps {
  match?: Match;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MatchForm = ({ match, onSuccess, onCancel }: MatchFormProps) => {
  const [loading, setLoading] = useState(false);
  const [opposingTeams, setOpposingTeams] = useState<Array<{id: string, name: string, logo_url?: string}>>([]);
  
  const [formData, setFormData] = useState({
    home_team: match?.home_team || "Real Madrid",
    away_team: match?.away_team || "",
    home_team_logo: match?.home_team_logo || "",
    away_team_logo: match?.away_team_logo || "",
    match_date: match?.match_date ? new Date(match.match_date).toISOString().slice(0, 16) : "",
    venue: match?.venue || "",
    competition: match?.competition || "",
    home_score: match?.home_score || 0,
    away_score: match?.away_score || 0,
    status: match?.status || "upcoming",
    opposing_team_id: match?.opposing_team_id || "",
  });

  useEffect(() => {
    fetchOpposingTeams();
  }, []);

  const fetchOpposingTeams = async () => {
    const { data, error } = await supabase
      .from('opposing_teams')
      .select('id, name, logo_url')
      .order('name');

    if (error) {
      toast.error("Erreur lors du chargement des équipes adverses");
      return;
    }

    setOpposingTeams(data || []);
  };

  const getLogoForTeam = (teamName: string): string => {
    const team = opposingTeams.find(t => t.name === teamName);
    return team?.logo_url || "";
  };

  const handleOpposingTeamChange = (teamId: string) => {
    const selectedTeam = opposingTeams.find(team => team.id === teamId);
    if (selectedTeam) {
      setFormData({
        ...formData,
        opposing_team_id: teamId,
        away_team: selectedTeam.name,
        away_team_logo: selectedTeam.logo_url || ""
      });
    }
  };

  const handleSwapTeams = () => {
    setFormData(prev => ({
      ...prev,
      home_team: prev.away_team,
      away_team: prev.home_team,
      home_team_logo: prev.away_team_logo,
      away_team_logo: prev.home_team_logo,
      home_score: prev.away_score,
      away_score: prev.home_score,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const matchData = {
        ...formData,
        match_date: new Date(formData.match_date).toISOString(),
        opposing_team_id: formData.opposing_team_id || null,
      };

      if (match?.id) {
        const { error } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', match.id);
        if (error) throw error;
        toast.success("Match mis à jour avec succès");
      } else {
        const { error } = await supabase
          .from('matches')
          .insert([matchData]);
        if (error) throw error;
        toast.success("Match créé avec succès");
      }

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'enregistrement du match");
    } finally {
      setLoading(false);
    }
  };

  const LogoPreview = ({ url, label }: { url: string; label: string }) => (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-border/50 bg-muted/30 p-2 h-16">
        {url ? (
          <>
            <img src={url} alt={label} className="h-12 w-12 object-contain rounded" />
            <span className="text-xs text-muted-foreground truncate">Depuis la base de données</span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">Aucun logo disponible</span>
        )}
      </div>
    </div>
  );

  return (
    <Card className="max-w-full overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-2xl">
          {match ? "Modifier le match" : "Nouveau match"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="flex justify-center mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSwapTeams}
              className="gap-2"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Inverser domicile / extérieur
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Équipe à domicile */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="home_team" className="text-sm">Équipe à domicile</Label>
                <Input
                  id="home_team"
                  value={formData.home_team}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ ...formData, home_team: name, home_team_logo: getLogoForTeam(name) });
                  }}
                  required
                  className="h-9 text-sm"
                />
              </div>
              <LogoPreview url={formData.home_team_logo} label="Logo équipe à domicile" />
            </div>

            {/* Équipe à l'extérieur */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="opposing_team" className="text-sm">Équipe adverse</Label>
                <Select
                  value={formData.opposing_team_id}
                  onValueChange={handleOpposingTeamChange}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Sélectionner une équipe adverse" />
                  </SelectTrigger>
                  <SelectContent>
                    {opposingTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="flex items-center gap-2">
                          {team.logo_url && (
                            <img src={team.logo_url} alt="" className="h-5 w-5 object-contain" />
                          )}
                          {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="away_team" className="text-sm">Nom de l'équipe (auto-rempli)</Label>
                <Input
                  id="away_team"
                  value={formData.away_team}
                  onChange={(e) => setFormData({ ...formData, away_team: e.target.value })}
                  required
                  disabled={!!formData.opposing_team_id}
                  className="h-9 text-sm"
                />
              </div>
              
              <LogoPreview url={formData.away_team_logo} label="Logo équipe à l'extérieur" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="match_date" className="text-sm">Date et heure du match</Label>
            <Input
              id="match_date"
              type="datetime-local"
              value={formData.match_date}
              onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
              required
              className="h-9 text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor="venue" className="text-sm">Lieu</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="h-9 text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor="competition" className="text-sm">Compétition</Label>
            <Input
              id="competition"
              value={formData.competition}
              onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
              className="h-9 text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="home_score" className="text-sm">Score domicile</Label>
              <Input
                id="home_score"
                type="number"
                min="0"
                value={formData.home_score}
                onChange={(e) => setFormData({ ...formData, home_score: parseInt(e.target.value) || 0 })}
                className="h-9 text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="away_score" className="text-sm">Score extérieur</Label>
              <Input
                id="away_score"
                type="number"
                min="0"
                value={formData.away_score}
                onChange={(e) => setFormData({ ...formData, away_score: parseInt(e.target.value) || 0 })}
                className="h-9 text-sm"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="status" className="text-sm">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">À venir</SelectItem>
                <SelectItem value="live">En cours</SelectItem>
                <SelectItem value="finished">Terminé</SelectItem>
                <SelectItem value="postponed">Reporté</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto h-9 text-sm">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto h-9 text-sm">
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
