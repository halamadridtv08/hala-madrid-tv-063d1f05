
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Users, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { importRealMadridPlayers, importRealMadridCoaches } from "@/utils/importPlayers";

export function ImportPlayersButton() {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    setImporting(true);
    
    try {
      // Importer les joueurs
      const playersResult = await importRealMadridPlayers();
      
      // Importer les entraîneurs
      const coachesResult = await importRealMadridCoaches();
      
      if (playersResult || coachesResult) {
        toast({
          title: "✨ Importation réussie",
          description: `${playersResult ? 'Joueurs' : ''}${playersResult && coachesResult ? ' et ' : ''}${coachesResult ? 'Staff technique' : ''} importés avec succès`,
        });
        
        // Recharger la page pour afficher les nouvelles données
        window.location.reload();
      } else {
        toast({
          title: "ℹ️ Données déjà présentes",
          description: "L'effectif complet est déjà importé dans la base de données",
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      toast({
        title: "❌ Erreur d'importation",
        description: "Une erreur s'est produite lors de l'importation",
        variant: "destructive"
      });
    }
    
    setImporting(false);
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleImport}
        disabled={importing}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {importing ? "Importation..." : "Importer l'effectif complet"}
      </Button>
      
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>25 joueurs</span>
        <UserCheck className="h-4 w-4 ml-2" />
        <span>8 staff</span>
      </div>
    </div>
  );
}
