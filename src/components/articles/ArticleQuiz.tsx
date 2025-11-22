import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Brain, Check, X } from "lucide-react";
import type { ArticleQuiz as ArticleQuizType, QuizQuestion } from "@/types/ArticleEngagement";

interface ArticleQuizProps {
  articleId: string;
}

export const ArticleQuiz = ({ articleId }: ArticleQuizProps) => {
  const [quiz, setQuiz] = useState<ArticleQuizType | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[][]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuiz();
  }, [articleId]);

  const fetchQuiz = async () => {
    const { data: quizData } = await supabase
      .from("article_quizzes")
      .select("*")
      .eq("article_id", articleId)
      .eq("is_active", true)
      .single();

    if (quizData) {
      setQuiz(quizData);

      const { data: questionsData } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizData.id)
        .order("display_order");

      if (questionsData) {
        setQuestions(questionsData);
        const shuffled = questionsData.map((q) => {
          const allAnswers = [q.correct_answer, ...q.wrong_answers];
          return allAnswers.sort(() => Math.random() - 0.5);
        });
        setShuffledAnswers(shuffled);
      }
    }
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correct_answer;
    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
      toast({
        title: "Quiz terminé!",
        description: `Vous avez obtenu ${score + (isCorrect ? 1 : 0)}/${questions.length} bonnes réponses`,
      });
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  if (!quiz || questions.length === 0) return null;

  if (showResult) {
    const percentage = (score / questions.length) * 100;
    return (
      <Card className="p-6 mt-8">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6" />
          {quiz.title}
        </h3>
        <div className="text-center space-y-6">
          <div className="text-6xl font-bold text-primary">{percentage.toFixed(0)}%</div>
          <p className="text-xl">
            Vous avez obtenu {score} sur {questions.length} bonnes réponses
          </p>
          <p className="text-lg text-muted-foreground">
            {percentage >= 80 ? "Excellent! Vous êtes un vrai fan du Real Madrid! ⚪" :
             percentage >= 60 ? "Bien joué! Vous connaissez votre équipe! 👏" :
             "Pas mal! Continuez à suivre l'actualité du Real! 💪"}
          </p>
          <Button onClick={handleRestart}>Recommencer le quiz</Button>
        </div>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const currentAnswers = shuffledAnswers[currentQuestion] || [];

  return (
    <Card className="p-6 mt-8">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Brain className="w-6 h-6" />
        {quiz.title}
      </h3>

      {quiz.description && (
        <p className="text-muted-foreground mb-6">{quiz.description}</p>
      )}

      <div className="mb-4">
        <span className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} / {questions.length}
        </span>
      </div>

      <h4 className="text-xl font-semibold mb-6">{question.question}</h4>

      <div className="space-y-3 mb-6">
        {currentAnswers.map((answer, idx) => {
          const isSelected = selectedAnswer === answer;
          const isCorrect = answer === question.correct_answer;

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(answer)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{answer}</span>
                {isSelected && isCorrect && <Check className="w-5 h-5 text-green-500" />}
                {isSelected && !isCorrect && <X className="w-5 h-5 text-destructive" />}
              </div>
            </button>
          );
        })}
      </div>

      <Button onClick={handleNext} disabled={!selectedAnswer} className="w-full">
        {currentQuestion < questions.length - 1 ? "Question suivante" : "Voir les résultats"}
      </Button>
    </Card>
  );
};
