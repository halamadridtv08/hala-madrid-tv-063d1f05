import { Button } from '@/components/ui/button';
import { 
  CircleDot, 
  Square, 
  ArrowLeftRight, 
  Pause, 
  Play, 
  Flag,
  AlertTriangle,
  MessageSquare,
  Timer
} from 'lucide-react';

interface QuickActionBarProps {
  onAction: (type: string) => void;
  isLive?: boolean;
}

export const QuickActionBar = ({ onAction, isLive }: QuickActionBarProps) => {
  const actions = [
    { type: 'goal', label: 'But', icon: CircleDot, color: 'bg-green-500 hover:bg-green-600 text-white' },
    { type: 'yellow_card', label: 'Jaune', icon: Square, color: 'bg-yellow-400 hover:bg-yellow-500 text-black' },
    { type: 'second_yellow', label: '2e Jaune', icon: Square, color: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { type: 'red_card', label: 'Rouge', icon: Square, color: 'bg-red-500 hover:bg-red-600 text-white' },
    { type: 'substitution', label: 'Remp.', icon: ArrowLeftRight, color: 'bg-blue-500 hover:bg-blue-600 text-white' },
    { type: 'halftime', label: 'Mi-temps', icon: Pause, color: 'bg-gray-500 hover:bg-gray-600 text-white' },
    { type: 'kickoff', label: 'Coup d\'envoi', icon: Play, color: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
    { type: 'fulltime', label: 'Fin', icon: Flag, color: 'bg-gray-700 hover:bg-gray-800 text-white' },
    { type: 'var', label: 'VAR', icon: AlertTriangle, color: 'bg-purple-500 hover:bg-purple-600 text-white' },
    { type: 'injury', label: 'Blessure', icon: Timer, color: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { type: 'comment', label: 'Commentaire', icon: MessageSquare, color: 'bg-secondary hover:bg-secondary/80' },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-card border rounded-lg">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.type}
            type="button"
            size="sm"
            onClick={() => onAction(action.type)}
            className={action.color}
          >
            <Icon className="h-4 w-4 mr-1" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};
