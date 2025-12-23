import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Transfer {
  id: string;
  playerName: string;
  playerImage: string;
  fromTeam: string;
  fromTeamLogo: string;
  toTeam: string;
  toTeamLogo: string;
  transferType: 'loan' | 'permanent' | 'free' | 'return';
  isOfficial: boolean;
  description: string;
}

// Données temporaires - à remplacer par des données de la base
const mockTransfers: Transfer[] = [
  {
    id: "1",
    playerName: "Endrick",
    playerImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Endrick_2024.jpg/220px-Endrick_2024.jpg",
    fromTeam: "Real Madrid",
    fromTeamLogo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    toTeam: "Olympique Lyonnais",
    toTeamLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a0/Olympique_Lyonnais_logo.svg/1200px-Olympique_Lyonnais_logo.svg.png",
    transferType: 'loan',
    isOfficial: true,
    description: "Real Madrid have loaned Endrick to Olympique Lyonnais"
  }
];

const getTransferTypeLabel = (type: Transfer['transferType']) => {
  switch (type) {
    case 'loan': return 'Prêt';
    case 'permanent': return 'Transfert';
    case 'free': return 'Libre';
    case 'return': return 'Retour';
    default: return type;
  }
};

export const TransferNews = () => {
  const transfers = mockTransfers;

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-muted/50 to-transparent">
        <CardTitle className="text-lg font-bold uppercase tracking-wide text-foreground">
          Actualités Transferts
        </CardTitle>
        <Link 
          to="/news?category=transfer" 
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Plus
        </Link>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {transfers.map((transfer) => (
          <div key={transfer.id} className="space-y-3">
            {/* Official Badge */}
            {transfer.isOfficial && (
              <Badge 
                variant="default" 
                className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-xs px-3 py-1"
              >
                Officiel
              </Badge>
            )}
            
            {/* Transfer Visual */}
            <div className="flex items-center justify-center gap-2 py-4">
              {/* From Team Logo */}
              <div className="flex-shrink-0">
                <img 
                  src={transfer.fromTeamLogo} 
                  alt={transfer.fromTeam}
                  className="w-12 h-12 object-contain"
                />
              </div>
              
              {/* Arrow */}
              <ArrowRight className="w-5 h-5 text-amber-500 flex-shrink-0" />
              
              {/* Player Photo */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-muted bg-muted">
                  <img 
                    src={transfer.playerImage} 
                    alt={transfer.playerName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Arrow */}
              <ArrowRight className="w-5 h-5 text-amber-500 flex-shrink-0" />
              
              {/* To Team Logo */}
              <div className="flex-shrink-0">
                <img 
                  src={transfer.toTeamLogo} 
                  alt={transfer.toTeam}
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            
            {/* Description */}
            <p className="text-center text-sm text-muted-foreground italic">
              {transfer.description}
            </p>
          </div>
        ))}
        
        {transfers.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Aucun transfert récent
          </p>
        )}
      </CardContent>
    </Card>
  );
};
