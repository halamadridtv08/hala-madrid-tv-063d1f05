import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTransfers } from "@/hooks/useTransfers";
import { Skeleton } from "@/components/ui/skeleton";

const getTransferTypeLabel = (type: string) => {
  switch (type) {
    case 'loan': return 'Prêt';
    case 'permanent': return 'Transfert';
    case 'free': return 'Libre';
    case 'return': return 'Retour';
    default: return type;
  }
};

const getTransferTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'loan': return 'bg-blue-600 hover:bg-blue-700';
    case 'permanent': return 'bg-purple-600 hover:bg-purple-700';
    case 'free': return 'bg-gray-600 hover:bg-gray-700';
    case 'return': return 'bg-green-600 hover:bg-green-700';
    default: return 'bg-muted';
  }
};

export const TransferNews = () => {
  const { transfers, loading } = useTransfers(true);

  if (loading) {
    return (
      <section className="py-6 bg-muted/30">
        <div className="madrid-container">
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="p-4">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (transfers.length === 0) {
    return null;
  }

  return (
    <section className="py-6 bg-muted/30">
      <div className="madrid-container">
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle className="text-lg font-bold uppercase tracking-wide text-foreground">
              Actualités Transferts
            </CardTitle>
            <Link 
              to="/transfers" 
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Plus
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {transfers.slice(0, 3).map((transfer) => (
              <div key={transfer.id} className="space-y-3">
                {/* Badges row */}
                <div className="flex flex-wrap gap-2">
                  {transfer.is_official && (
                    <Badge 
                      variant="default" 
                      className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-xs px-3 py-1"
                    >
                      Officiel
                    </Badge>
                  )}
                  <Badge 
                    className={`${getTransferTypeBadgeColor(transfer.transfer_type)} text-white font-medium text-xs px-2 py-1`}
                  >
                    {getTransferTypeLabel(transfer.transfer_type)}
                  </Badge>
                </div>
                
                {/* Transfer Visual */}
                <div className="flex items-center justify-center gap-2 sm:gap-4 py-4">
                  {/* From Team Logo */}
                  <div className="flex-shrink-0">
                    {transfer.from_team_logo ? (
                      <img 
                        src={transfer.from_team_logo} 
                        alt={transfer.from_team}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
                        {transfer.from_team.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Arrow */}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
                  
                  {/* Player Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-muted bg-muted">
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
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
                  
                  {/* To Team Logo */}
                  <div className="flex-shrink-0">
                    {transfer.to_team_logo ? (
                      <img 
                        src={transfer.to_team_logo} 
                        alt={transfer.to_team}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
                        {transfer.to_team.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                {transfer.description && (
                  <p className="text-center text-sm text-muted-foreground italic">
                    {transfer.description}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
