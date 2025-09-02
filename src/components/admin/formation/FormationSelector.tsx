import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FORMATIONS } from '@/types/Formation';

interface FormationSelectorProps {
  selectedFormation: string;
  onFormationChange: (formation: string) => void;
}

export const FormationSelector: React.FC<FormationSelectorProps> = ({
  selectedFormation,
  onFormationChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Sélectionner une formation
      </label>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Select value={selectedFormation} onValueChange={onFormationChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Choisir une formation" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FORMATIONS).map(([key, formation]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {formation.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formation.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedFormation && FORMATIONS[selectedFormation] && (
          <div className="text-sm text-muted-foreground">
            {FORMATIONS[selectedFormation].description}
          </div>
        )}
      </div>
    </div>
  );
};