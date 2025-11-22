import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Trophy, MessageSquare, UserCheck } from "lucide-react";

interface ArticleTemplate {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  category: string;
  titleTemplate: string;
  descriptionTemplate: string;
  contentTemplate: string;
}

const templates: ArticleTemplate[] = [
  {
    id: "match",
    name: "Rapport de Match",
    description: "Template pour un compte-rendu de match",
    icon: Trophy,
    category: "match",
    titleTemplate: "Real Madrid [X-X] Équipe adverse - [Compétition]",
    descriptionTemplate: "Le Real Madrid affronte [Équipe] ce [Date] au [Stade] pour le compte de [Compétition].",
    contentTemplate: `<h2>Contexte du match</h2>
<p>Le Real Madrid affrontait [Équipe adverse] ce [Date] pour le compte de [Compétition]. Une rencontre importante pour...</p>

<h2>Déroulement du match</h2>
<p><strong>Première mi-temps :</strong> [Description]</p>
<p><strong>Deuxième mi-temps :</strong> [Description]</p>

<h2>Les moments clés</h2>
<ul>
  <li><strong>[Minute]' :</strong> [Description du but/action]</li>
  <li><strong>[Minute]' :</strong> [Description du but/action]</li>
</ul>

<h2>Analyse tactique</h2>
<p>[Analyse du match, composition, stratégie...]</p>

<h2>Les performances individuelles</h2>
<p><strong>Homme du match :</strong> [Nom du joueur] - [Description de sa performance]</p>
<p>[Autres performances notables...]</p>

<h2>Conclusion</h2>
<p>Une victoire/défaite qui permet au Real Madrid de...</p>`
  },
  {
    id: "interview",
    name: "Interview",
    description: "Template pour une interview ou conférence de presse",
    icon: MessageSquare,
    category: "conférence",
    titleTemplate: "Interview de [Nom] : \"[Citation]\"",
    descriptionTemplate: "[Nom] s'est exprimé après [Contexte] et a donné son avis sur...",
    contentTemplate: `<h2>Contexte de l'interview</h2>
<p>[Nom de la personne] s'est exprimé ce [Date] en [Lieu/Contexte]. Voici les principaux extraits de ses déclarations.</p>

<h2>Sur le match/la situation</h2>
<blockquote>
  <p>"[Citation exacte]"</p>
</blockquote>
<p>[Analyse ou contexte de la citation]</p>

<h2>Sur la préparation</h2>
<blockquote>
  <p>"[Citation exacte]"</p>
</blockquote>
<p>[Analyse ou contexte]</p>

<h2>Sur les joueurs</h2>
<blockquote>
  <p>"[Citation exacte]"</p>
</blockquote>
<p>[Analyse]</p>

<h2>Prochaines échéances</h2>
<p>Le Real Madrid retrouvera [Équipe] le [Date] pour...</p>`
  },
  {
    id: "transfer",
    name: "Mercato/Transfert",
    description: "Template pour une actualité mercato",
    icon: UserCheck,
    category: "mercato",
    titleTemplate: "[Nom du joueur] vers le Real Madrid : Point sur la situation",
    descriptionTemplate: "Le Real Madrid serait sur les traces de [Nom du joueur]. Voici les dernières informations.",
    contentTemplate: `<h2>Les dernières informations</h2>
<p>Selon [Source], le Real Madrid serait intéressé par [Nom du joueur], actuellement sous contrat avec [Club actuel].</p>

<h2>Profil du joueur</h2>
<p><strong>Nom :</strong> [Nom complet]</p>
<p><strong>Âge :</strong> [Âge] ans</p>
<p><strong>Poste :</strong> [Position]</p>
<p><strong>Club actuel :</strong> [Club]</p>
<p><strong>Contrat jusqu'en :</strong> [Date]</p>

<h3>Statistiques de la saison</h3>
<ul>
  <li>Matchs joués : [X]</li>
  <li>Buts : [X]</li>
  <li>Passes décisives : [X]</li>
</ul>

<h2>La situation contractuelle</h2>
<p>[Description du contrat, clause libératoire, etc.]</p>

<h2>L'avis de la rédaction</h2>
<p>Ce joueur pourrait apporter [Qualités] au Real Madrid. Cependant, [Points d'attention]...</p>

<h2>Les prochaines étapes</h2>
<p>Selon nos informations, [Étapes du transfert, négociations...]</p>`
  }
];

interface ArticleTemplatesProps {
  onSelectTemplate: (template: ArticleTemplate) => void;
}

export function ArticleTemplates({ onSelectTemplate }: ArticleTemplatesProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Utiliser un template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choisir un template d'article</DialogTitle>
          <DialogDescription>
            Sélectionnez un template prédéfini pour démarrer rapidement la rédaction de votre article.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {templates.map((template) => {
            const IconComponent = template.icon;
            return (
              <Card 
                key={template.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onSelectTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" className="w-full">
                    Utiliser ce template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
