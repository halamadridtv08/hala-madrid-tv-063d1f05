import { X, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AbsentPlayerCardProps {
  id: string;
  playerName: string;
  playerImage?: string;
  jerseyNumber?: number;
  reason: string;
  returnDate?: string;
  onDelete: (id: string) => void;
}

const getReasonBadgeVariant = (reason: string) => {
  const lowerReason = reason.toLowerCase();
  if (lowerReason.includes('bless') || lowerReason.includes('injur')) {
    return 'destructive';
  }
  if (lowerReason.includes('suspen')) {
    return 'secondary';
  }
  return 'outline';
};

const getReasonIcon = (reason: string) => {
  const lowerReason = reason.toLowerCase();
  if (lowerReason.includes('bless') || lowerReason.includes('injur')) {
    return <AlertTriangle className="h-3 w-3" />;
  }
  return null;
};

export const AbsentPlayerCard = ({
  id,
  playerName,
  playerImage,
  jerseyNumber,
  reason,
  returnDate,
  onDelete,
}: AbsentPlayerCardProps) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors group">
      {/* Player Photo */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-muted overflow-hidden border-2 border-destructive/50">
          {playerImage ? (
            <img
              src={playerImage}
              alt={playerName}
              className="w-full h-full object-cover grayscale"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
              <span className="text-sm font-bold text-muted-foreground">
                {playerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </span>
            </div>
          )}
        </div>
        {jerseyNumber && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-destructive-foreground">{jerseyNumber}</span>
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{playerName}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={getReasonBadgeVariant(reason)} className="text-[10px] gap-1">
            {getReasonIcon(reason)}
            {reason}
          </Badge>
        </div>
        {returnDate && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Retour: {format(new Date(returnDate), 'dd MMM yyyy', { locale: fr })}</span>
          </div>
        )}
      </div>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => onDelete(id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
