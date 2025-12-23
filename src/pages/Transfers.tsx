import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Clock, Euro } from "lucide-react";
import { useTransfers } from "@/hooks/useTransfers";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/SEOHead";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const getTransferTypeLabel = (type: string) => {
  switch (type) {
    case 'loan': return 'Prêt';
    case 'permanent': return 'Transfert';
    case 'free': return 'Libre';
    case 'return': return 'Retour de prêt';
    default: return type;
  }
};

const getTransferTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'loan': return 'bg-blue-600 hover:bg-blue-700';
    case 'permanent': return 'bg-purple-600 hover:bg-purple-700';
    case 'free': return 'bg-gray-600 hover:bg-gray-700';
    case 'return': return 'bg-green-600 hover:bg-green-700';
    default: return 'bg-muted';
  }
};

const Transfers = () => {
  const { transfers, loading } = useTransfers(true);

  return (
    <>
      <SEOHead 
        title="Transferts - Real Madrid | Mercato 2024/25"
        description="Retrouvez tous les transferts du Real Madrid pour la saison 2024/25. Prêts, transferts définitifs et retours de prêt."
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-12">
        <div className="madrid-container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Transferts 2024/25
            </h1>
            <p className="text-muted-foreground">
              Tous les mouvements du mercato du Real Madrid
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <Skeleton className="h-24 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && transfers.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Aucun transfert pour le moment</p>
            </Card>
          )}

          {/* Transfers grid */}
          {!loading && transfers.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {transfers.map((transfer) => (
                <Card key={transfer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Badges row */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {transfer.is_official && (
                        <Badge className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-xs">
                          Officiel
                        </Badge>
                      )}
                      <Badge className={`${getTransferTypeBadgeVariant(transfer.transfer_type)} text-white font-medium text-xs`}>
                        {getTransferTypeLabel(transfer.transfer_type)}
                      </Badge>
                    </div>

                    {/* Player name */}
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      {transfer.player_name}
                    </h3>

                    {/* Transfer visual */}
                    <div className="flex items-center justify-center gap-3 py-4 bg-muted/30 rounded-lg mb-4">
                      {/* From Team */}
                      <div className="flex flex-col items-center gap-1">
                        {transfer.from_team_logo ? (
                          <img 
                            src={transfer.from_team_logo} 
                            alt={transfer.from_team}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
                            {transfer.from_team.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground text-center max-w-[80px] truncate">
                          {transfer.from_team}
                        </span>
                      </div>
                      
                      {/* Arrow */}
                      <ArrowRight className="w-6 h-6 text-primary flex-shrink-0" />
                      
                      {/* Player Photo */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary bg-muted">
                          {transfer.player_image ? (
                            <img 
                              src={transfer.player_image} 
                              alt={transfer.player_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                              {transfer.player_name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <ArrowRight className="w-6 h-6 text-primary flex-shrink-0" />
                      
                      {/* To Team */}
                      <div className="flex flex-col items-center gap-1">
                        {transfer.to_team_logo ? (
                          <img 
                            src={transfer.to_team_logo} 
                            alt={transfer.to_team}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
                            {transfer.to_team.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground text-center max-w-[80px] truncate">
                          {transfer.to_team}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      {transfer.transfer_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(transfer.transfer_date), 'd MMM yyyy', { locale: fr })}</span>
                        </div>
                      )}
                      {transfer.transfer_fee && (
                        <div className="flex items-center gap-1">
                          <Euro className="w-4 h-4" />
                          <span>{transfer.transfer_fee}</span>
                        </div>
                      )}
                      {transfer.transfer_type === 'loan' && transfer.return_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Retour: {format(new Date(transfer.return_date), 'd MMM yyyy', { locale: fr })}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {transfer.description && (
                      <p className="text-sm text-muted-foreground italic border-t border-border pt-3">
                        {transfer.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Transfers;
