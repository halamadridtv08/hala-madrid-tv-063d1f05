import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bold, Italic, List, Heading2, Heading3 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
}

export const RichTextEditor = ({ value, onChange, label = "Contenu", description }: RichTextEditorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="content">{label}</Label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Aide au formatage</CardTitle>
          <CardDescription className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <Bold className="h-3 w-3" />
              <span>**texte** pour le gras</span>
            </div>
            <div className="flex items-center gap-2">
              <Italic className="h-3 w-3" />
              <span>*texte* pour l'italique</span>
            </div>
            <div className="flex items-center gap-2">
              <Heading2 className="h-3 w-3" />
              <span>## pour les titres H2</span>
            </div>
            <div className="flex items-center gap-2">
              <Heading3 className="h-3 w-3" />
              <span>### pour les titres H3</span>
            </div>
            <div className="flex items-center gap-2">
              <List className="h-3 w-3" />
              <span>- pour les listes à puces</span>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      <Textarea
        id="content"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[300px] font-mono text-sm"
        placeholder="Écrivez votre contenu ici...

Exemple:
## Titre de section

**Texte en gras** et *texte en italique*.

- Point 1
- Point 2
- Point 3"
      />
    </div>
  );
};