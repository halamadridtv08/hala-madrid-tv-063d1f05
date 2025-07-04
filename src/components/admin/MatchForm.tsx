
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Match } from "@/types/Match";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaUploader } from "@/components/admin/MediaUploader";

interface MatchFormProps {
  match?: Match;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MatchForm = ({ match, onSuccess, onCancel }: MatchFormProps) => {
  const [loading, setLoading] = useState(false);
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const matchData = {
        ...formData,
        match_date: new Date(formData.match_date).toISOString(),
      };

      if (match?.id) {
        // Update existing match
        const { error } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', match.id);

        if (error) throw error;
        toast.success("Match mis à jour avec succès");
      } else {
        // Create new match
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {match ? "Modifier le match" : "Nouveau match"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Équipe à domicile */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="home_team">Équipe à domicile</Label>
                <Input
                  id="home_team"
                  value={formData.home_team}
                  onChange={(e) => setFormData({ ...formData, home_team: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label>Logo équipe à domicile</Label>
                <MediaUploader
                  onSuccess={(url) => setFormData({ ...formData, home_team_logo: url })}
                  acceptTypes="image/*"
                  maxSizeMB={5}
                  folderPath="team-logos"
                  buttonText="Ajouter logo domicile"
                  showPreview={true}
                  currentValue={formData.home_team_logo}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Équipe à l'extérieur */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="away_team">Équipe à l'extérieur</Label>
                <Input
                  id="away_team"
                  value={formData.away_team}
                  onChange={(e) => setFormData({ ...formData, away_team: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label>Logo équipe à l'extérieur</Label>
                <MediaUploader
                  onSuccess={(url) => setFormData({ ...formData, away_team_logo: url })}
                  acceptTypes="image/*"
                  maxSizeMB={5}
                  folderPath="team-logos"
                  buttonText="Ajouter logo extérieur"
                  showPreview={true}
                  currentValue={formData.away_team_logo}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="match_date">Date et heure du match</Label>
            <Input
              id="match_date"
              type="datetime-local"
              value={formData.match_date}
              onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="venue">Lieu</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="competition">Compétition</Label>
            <Input
              id="competition"
              value={formData.competition}
              onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="home_score">Score domicile</Label>
              <Input
                id="home_score"
                type="number"
                min="0"
                value={formData.home_score}
                onChange={(e) => setFormData({ ...formData, home_score: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div>
              <Label htmlFor="away_score">Score extérieur</Label>
              <Input
                id="away_score"
                type="number"
                min="0"
                value={formData.away_score}
                onChange={(e) => setFormData({ ...formData, away_score: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="status">Statut</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="upcoming">À venir</option>
              <option value="live">En cours</option>
              <option value="finished">Terminé</option>
              <option value="postponed">Reporté</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
