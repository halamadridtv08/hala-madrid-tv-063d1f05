import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Twitter } from "lucide-react";
import type { ArticleTweet } from "@/types/ArticleEngagement";

interface ArticleTweetsProps {
  articleId: string;
}

export const ArticleTweets = ({ articleId }: ArticleTweetsProps) => {
  const [tweets, setTweets] = useState<ArticleTweet[]>([]);

  useEffect(() => {
    fetchTweets();
  }, [articleId]);

  const fetchTweets = async () => {
    const { data, error } = await supabase
      .from("article_tweets")
      .select("*")
      .eq("article_id", articleId)
      .eq("is_published", true)
      .order("display_order");

    if (!error && data) {
      setTweets(data);
    }
  };

  if (tweets.length === 0) return null;

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-2xl font-bold flex items-center gap-2">
        <Twitter className="w-6 h-6" />
        Ce qu'on dit sur X (Twitter)
      </h3>

      {tweets.map((tweet) => (
        <Card key={tweet.id} className="p-6">
          <div className="rounded-lg overflow-hidden">
            <blockquote className="twitter-tweet" data-theme="dark">
              <a href={tweet.tweet_url}>Tweet</a>
            </blockquote>
          </div>
        </Card>
      ))}

      <script
        async
        src="https://platform.twitter.com/widgets.js"
        charSet="utf-8"
      />
    </div>
  );
};
