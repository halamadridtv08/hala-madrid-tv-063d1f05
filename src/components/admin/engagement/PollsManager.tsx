import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, X } from "lucide-react";
import type { ArticlePoll, PollOption } from "@/types/ArticleEngagement";

interface PollsManagerProps {
  articleId: string;
}

export const PollsManager = ({ articleId }: PollsManagerProps) => {
  const [polls, setPolls] = useState<(ArticlePoll & { options?: PollOption[] })[]>([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPolls();
  }, [articleId]);

  const fetchPolls = async () => {
    const { data: pollsData } = await supabase
      .from("article_polls")
      .select("*")
      .eq("article_id", articleId);

    if (pollsData) {
      const pollsWithOptions = await Promise.all(
        pollsData.map(async (poll) => {
          const { data: optionsData } = await supabase
            .from("poll_options")
            .select("*")
            .eq("poll_id", poll.id);
          return { ...poll, options: optionsData || [] };
        })
      );
      setPolls(pollsWithOptions);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: pollData, error: pollError } = await supabase
      .from("article_polls")
      .insert({ article_id: articleId, question })
      .select()
      .single();

    if (pollError || !pollData) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le sondage",
        variant: "destructive",
      });
    } else {
      const optionsToInsert = options
        .filter((opt) => opt.trim())
        .map((opt) => ({
          poll_id: pollData.id,
          option_text: opt,
        }));

      await supabase.from("poll_options").insert(optionsToInsert);

      toast({ title: "Sondage créé avec succès" });
      setQuestion("");
      setOptions(["", ""]);
      fetchPolls();
    }

    setLoading(false);
  };

  const handleDelete = async (pollId: string) => {
    const { error } = await supabase.from("article_polls").delete().eq("id", pollId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le sondage",
        variant: "destructive",
      });
    } else {
      toast({ title: "Sondage supprimé" });
      fetchPolls();
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <form onSubmit={handleCreate} className="space-y-4 border rounded-lg p-4">
        <h3 className="font-semibold">Créer un sondage</h3>
        
        <Input
          placeholder="Question du sondage *"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Options de réponse</label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder={`Option ${idx + 1} *`}
                value={opt}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[idx] = e.target.value;
                  setOptions(newOptions);
                }}
                required
              />
              {idx > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOptions([...options, ""])}
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter une option
          </Button>
        </div>

        <Button type="submit" disabled={loading}>
          Créer le sondage
        </Button>
      </form>

      <div className="space-y-4">
        {polls.map((poll) => (
          <div key={poll.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold">{poll.question}</h4>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(poll.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {poll.options?.map((option) => (
                <div key={option.id} className="flex justify-between text-sm">
                  <span>{option.option_text}</span>
                  <span className="font-semibold">{option.vote_count} votes</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
