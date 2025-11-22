import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import type { ArticleTweet } from "@/types/ArticleEngagement";

interface TweetsManagerProps {
  articleId: string;
}

export const TweetsManager = ({ articleId }: TweetsManagerProps) => {
  const [tweets, setTweets] = useState<ArticleTweet[]>([]);
  const [tweetUrl, setTweetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTweets();
  }, [articleId]);

  const fetchTweets = async () => {
    const { data } = await supabase
      .from("article_tweets")
      .select("*")
      .eq("article_id", articleId)
      .order("display_order");

    if (data) {
      setTweets(data);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("article_tweets").insert({
      article_id: articleId,
      tweet_url: tweetUrl,
      display_order: tweets.length,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le tweet",
        variant: "destructive",
      });
    } else {
      toast({ title: "Tweet ajouté avec succès" });
      setTweetUrl("");
      fetchTweets();
    }

    setLoading(false);
  };

  const handleDelete = async (tweetId: string) => {
    const { error } = await supabase.from("article_tweets").delete().eq("id", tweetId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le tweet",
        variant: "destructive",
      });
    } else {
      toast({ title: "Tweet supprimé" });
      fetchTweets();
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <form onSubmit={handleCreate} className="space-y-4 border rounded-lg p-4">
        <h3 className="font-semibold">Ajouter un tweet</h3>

        <div className="space-y-2">
          <Input
            placeholder="URL du tweet (ex: https://x.com/username/status/...)"
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Collez l'URL complète d'un tweet X/Twitter
          </p>
        </div>

        <Button type="submit" disabled={loading}>
          <Plus className="w-4 h-4 mr-1" />
          Ajouter le tweet
        </Button>
      </form>

      <div className="space-y-4">
        {tweets.map((tweet, idx) => (
          <div key={tweet.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className="text-sm text-muted-foreground mb-1">Tweet #{idx + 1}</span>
                <p className="text-sm break-all">{tweet.tweet_url}</p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(tweet.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {tweets.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Aucun tweet ajouté pour cet article
          </p>
        )}
      </div>
    </div>
  );
};
