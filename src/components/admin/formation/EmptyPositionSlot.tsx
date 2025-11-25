import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyPositionSlotProps {
  position: string;
  x: number;
  y: number;
  onClick: () => void;
}

export const EmptyPositionSlot = ({ position, x, y, onClick }: EmptyPositionSlotProps) => {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer group"
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
    >
      <Button
        size="icon"
        variant="outline"
        className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/50 bg-background/50 hover:bg-primary/10 hover:border-primary transition-all group-hover:scale-110"
      >
        <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
      </Button>
      <span className="text-[10px] font-medium text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
        {position}
      </span>
    </div>
  );
};
