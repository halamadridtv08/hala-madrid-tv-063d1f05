import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Version {
  id: string;
  content: string;
  author: string;
  author_handle: string;
  category: string;
  status: string;
  modified_by_email: string | null;
  change_description: string | null;
  version_number: number;
  created_at: string;
}

interface FlashNewsVersionHistoryProps {
  flashNewsId: string;
  onRestore?: (version: Version) => void;
}

export const FlashNewsVersionHistory = ({
  flashNewsId,
  onRestore,
}: FlashNewsVersionHistoryProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVersions();
  }, [flashNewsId]);

  const fetchVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('flash_news_versions')
        .select('*')
        .eq('flash_news_id', flashNewsId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error: any) {
      console.error('Error fetching versions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des versions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (version: Version) => {
    if (onRestore) {
      onRestore(version);
      toast({
        title: "Version restaurée",
        description: `La version ${version.version_number} a été restaurée.`,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-2" />
          Historique ({versions.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Historique des modifications</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune version enregistrée
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Version {version.version_number}
                        </Badge>
                        <Badge>{version.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(version.created_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    {onRestore && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(version)}
                      >
                        Restaurer
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Auteur:</span>{" "}
                      {version.author} ({version.author_handle})
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Contenu:</span>
                      <p className="mt-1 text-muted-foreground">
                        {version.content}
                      </p>
                    </div>
                    {version.modified_by_email && (
                      <div className="text-sm">
                        <span className="font-medium">Modifié par:</span>{" "}
                        {version.modified_by_email}
                      </div>
                    )}
                    {version.change_description && (
                      <div className="text-sm">
                        <span className="font-medium">Description:</span>
                        <p className="mt-1 text-muted-foreground">
                          {version.change_description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
