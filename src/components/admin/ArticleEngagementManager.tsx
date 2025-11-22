import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { CommentsManager } from "./engagement/CommentsManager";
import { PollsManager } from "./engagement/PollsManager";
import { QuizzesManager } from "./engagement/QuizzesManager";
import { TweetsManager } from "./engagement/TweetsManager";
import { MessageCircle, BarChart3, Brain, Twitter } from "lucide-react";

interface ArticleEngagementManagerProps {
  articleId: string;
}

export const ArticleEngagementManager = ({ articleId }: ArticleEngagementManagerProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gestion de l'engagement</h2>

      <Tabs defaultValue="comments">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Commentaires
          </TabsTrigger>
          <TabsTrigger value="polls" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Sondages
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="tweets" className="flex items-center gap-2">
            <Twitter className="w-4 h-4" />
            Tweets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments">
          <CommentsManager articleId={articleId} />
        </TabsContent>

        <TabsContent value="polls">
          <PollsManager articleId={articleId} />
        </TabsContent>

        <TabsContent value="quizzes">
          <QuizzesManager articleId={articleId} />
        </TabsContent>

        <TabsContent value="tweets">
          <TweetsManager articleId={articleId} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
