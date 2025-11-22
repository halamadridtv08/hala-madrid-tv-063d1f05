import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, X } from "lucide-react";
import type { ArticleQuiz, QuizQuestion } from "@/types/ArticleEngagement";

interface QuizzesManagerProps {
  articleId: string;
}

interface QuestionForm {
  question: string;
  correct_answer: string;
  wrong_answers: string[];
}

export const QuizzesManager = ({ articleId }: QuizzesManagerProps) => {
  const [quizzes, setQuizzes] = useState<(ArticleQuiz & { questions?: QuizQuestion[] })[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { question: "", correct_answer: "", wrong_answers: ["", "", ""] },
  ]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizzes();
  }, [articleId]);

  const fetchQuizzes = async () => {
    const { data: quizzesData } = await supabase
      .from("article_quizzes")
      .select("*")
      .eq("article_id", articleId);

    if (quizzesData) {
      const quizzesWithQuestions = await Promise.all(
        quizzesData.map(async (quiz) => {
          const { data: questionsData } = await supabase
            .from("quiz_questions")
            .select("*")
            .eq("quiz_id", quiz.id)
            .order("display_order");
          return { ...quiz, questions: questionsData || [] };
        })
      );
      setQuizzes(quizzesWithQuestions);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: quizData, error: quizError } = await supabase
      .from("article_quizzes")
      .insert({ article_id: articleId, title, description })
      .select()
      .single();

    if (quizError || !quizData) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le quiz",
        variant: "destructive",
      });
    } else {
      const questionsToInsert = questions.map((q, idx) => ({
        quiz_id: quizData.id,
        question: q.question,
        correct_answer: q.correct_answer,
        wrong_answers: q.wrong_answers.filter((a) => a.trim()),
        display_order: idx,
      }));

      await supabase.from("quiz_questions").insert(questionsToInsert);

      toast({ title: "Quiz créé avec succès" });
      setTitle("");
      setDescription("");
      setQuestions([{ question: "", correct_answer: "", wrong_answers: ["", "", ""] }]);
      fetchQuizzes();
    }

    setLoading(false);
  };

  const handleDelete = async (quizId: string) => {
    const { error } = await supabase.from("article_quizzes").delete().eq("id", quizId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le quiz",
        variant: "destructive",
      });
    } else {
      toast({ title: "Quiz supprimé" });
      fetchQuizzes();
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", correct_answer: "", wrong_answers: ["", "", ""] }]);
  };

  return (
    <div className="space-y-6 mt-6">
      <form onSubmit={handleCreate} className="space-y-4 border rounded-lg p-4">
        <h3 className="font-semibold">Créer un quiz</h3>

        <Input
          placeholder="Titre du quiz *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          placeholder="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <div className="space-y-4">
          <label className="text-sm font-medium">Questions</label>
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="border rounded p-3 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Question {qIdx + 1}</span>
                {qIdx > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <Input
                placeholder="Question *"
                value={q.question}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[qIdx].question = e.target.value;
                  setQuestions(newQuestions);
                }}
                required
              />

              <Input
                placeholder="Bonne réponse *"
                value={q.correct_answer}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[qIdx].correct_answer = e.target.value;
                  setQuestions(newQuestions);
                }}
                required
              />

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Mauvaises réponses</label>
                {q.wrong_answers.map((wa, waIdx) => (
                  <Input
                    key={waIdx}
                    placeholder={`Mauvaise réponse ${waIdx + 1} *`}
                    value={wa}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[qIdx].wrong_answers[waIdx] = e.target.value;
                      setQuestions(newQuestions);
                    }}
                    required
                  />
                ))}
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter une question
          </Button>
        </div>

        <Button type="submit" disabled={loading}>
          Créer le quiz
        </Button>
      </form>

      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold">{quiz.title}</h4>
                {quiz.description && (
                  <p className="text-sm text-muted-foreground">{quiz.description}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(quiz.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {quiz.questions?.length || 0} question(s)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
