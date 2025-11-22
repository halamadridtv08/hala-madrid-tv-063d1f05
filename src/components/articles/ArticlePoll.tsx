import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarChart3 } from "lucide-react";
import type { ArticlePoll as ArticlePollType, PollOption } from "@/types/ArticleEngagement";

interface ArticlePollProps {
  articleId: string;
}

export const ArticlePoll = ({ articleId }: ArticlePollProps) => {
  const [poll, setPoll] = useState<ArticlePollType | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPoll();
  }, [articleId]);

  const fetchPoll = async () => {
    const { data: pollData } = await supabase
      .from("article_polls")
      .select("*")
      .eq("article_id", articleId)
      .eq("is_active", true)
      .single();

    if (pollData) {
      setPoll(pollData);

      const { data: optionsData } = await supabase
        .from("poll_options")
        .select("*")
        .eq("poll_id", pollData.id)
        .order("created_at");

      setOptions(optionsData || []);

      const userIdentifier = localStorage.getItem("user_identifier") || crypto.randomUUID();
      localStorage.setItem("user_identifier", userIdentifier);

      const { data: voteData } = await supabase
        .from("poll_votes")
        .select("*")
        .eq("poll_id", pollData.id)
        .eq("user_identifier", userIdentifier)
        .single();

      setHasVoted(!!voteData);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !poll) return;

    setLoading(true);
    const userIdentifier = localStorage.getItem("user_identifier")!;

    const { error: voteError } = await supabase.from("poll_votes").insert({
      poll_id: poll.id,
      option_id: selectedOption,
      user_identifier: userIdentifier,
    });

    if (voteError) {
      toast({
        title: "Erreur",
        description: "Vous avez déjà voté pour ce sondage",
        variant: "destructive",
      });
    } else {
      // Increment vote count
      const option = options.find(o => o.id === selectedOption);
      if (option) {
        await supabase
          .from("poll_options")
          .update({ vote_count: option.vote_count + 1 })
          .eq("id", selectedOption);
      }
      
      toast({
        title: "Vote enregistré",
        description: "Merci d'avoir participé au sondage",
      });
      setHasVoted(true);
      fetchPoll();
    }

    setLoading(false);
  };

  if (!poll) return null;

  const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);

  return (
    <Card className="p-6 mt-8">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        Sondage
      </h3>

      <p className="text-lg font-semibold mb-4">{poll.question}</p>

      {!hasVoted ? (
        <div className="space-y-4">
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            {options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer flex-1">
                  {option.option_text}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <Button onClick={handleVote} disabled={!selectedOption || loading}>
            {loading ? "Vote en cours..." : "Voter"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((option) => {
            const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
            return (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{option.option_text}</span>
                  <span className="font-semibold">{percentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-sm text-muted-foreground mt-4">
            Total: {totalVotes} vote{totalVotes > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </Card>
  );
};
