"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Award, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { PointsEarnedDialog } from "@/components/points-earned-dialog";
import { generateQuiz, updateUserProgress, awardPoints } from "@/app/(app)/content/actions";
import { toast } from "sonner";
import { useNotifications } from "@/contexts/notification-context";
import { useUser } from "@/contexts/user-context";
import { NotificationType } from "@/types/notification";
import { PointsSource } from "@/types/points";
interface ArticleQuestionsProps {
  articleId: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Quiz {
  _id: string;
  content: string;
  questions: QuizQuestion[];
  points: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "expired";
  settings: {
    timeLimit: number;
    maxAttempts: number;
    difficulty: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface QuizResponse {
  success: boolean;
  message: string;
  quiz: Quiz;
}

export function ArticleQuestions({ articleId }: ArticleQuestionsProps) {
  const { addNotification } = useNotifications();
  const { refresh: refreshUser, user } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizDifficulty, setQuizDifficulty] = useState("medium");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [attempts, setAttempts] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const previousPoints = user?.points || 0;

  useEffect(() => {
    loadQuiz();
  }, [articleId, quizDifficulty]);

  useEffect(() => {
    if (quiz && !submitted && !isExpired) {
      setTimeLeft(quiz.settings.timeLimit);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsExpired(true);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz, submitted, isExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      const response = (await generateQuiz(articleId, quizDifficulty)) as QuizResponse;
      if (response.success && response.quiz) {
        // Check if quiz is expired
        const now = new Date();
        const endDate = new Date(response.quiz.endDate);
        if (now > endDate) {
          setIsExpired(true);
          toast.error("This quiz has expired");
          return;
        }

        setQuiz(response.quiz);
        setAnswers(new Array(response.quiz.questions.length).fill(-1));
        setSubmitted(false);
        setScore(0);
        setCurrentQuestion(0);
        setAttempts(0);
        setIsExpired(false);
      }
    } catch (error) {
      toast.error("Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (value: string) => {
    if (!quiz) return;
    
    const answerIndex = parseInt(value);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    
    // Show feedback
    const correct = answerIndex === quiz.questions[currentQuestion].correctIndex;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Auto advance after 1.5 seconds
    setTimeout(() => {
      setShowFeedback(false);
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // If it's the last question, submit the quiz
        handleSubmit();
      }
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    try {
      setIsLoading(true);
      const correctAnswers = answers.filter(
        (answer, index) => answer === quiz.questions[index].correctIndex
      ).length;

      // Calculate points per question
      const pointsPerQuestion = Math.floor(quiz.points / quiz.questions.length);
      const finalScore = correctAnswers * pointsPerQuestion;
      setScore(finalScore);
      setSubmitted(true);
      setAttempts((prev) => prev + 1);

      // Award points for each correct answer
      if (finalScore > 0) {
        await awardPoints(
          finalScore,
          PointsSource.QUIZ_COMPLETION,
          `Completed quiz with ${correctAnswers} correct answers`
        );

        // Show notification
        addNotification({
          type: NotificationType.QUIZ_COMPLETED,
          title: "Points Earned!",
          message: `You earned ${finalScore} points for completing the quiz!`,
        });

        // Refresh user context to update points
        await refreshUser();
      }

      // Update user progress
      await updateUserProgress({
        content: { _id: articleId } as any,
        progress: 100,
        pointsEarned: finalScore,
        completed: true,
        quizScore: finalScore,
        lastEngagedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Show points dialog if user got at least half correct
      if (correctAnswers >= quiz.questions.length / 2) {
        setShowPointsDialog(true);
      }
    } catch (error) {
      toast.error("Failed to submit quiz");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !quiz) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!quiz) {
    return null;
  }

  const currentQ = quiz.questions[currentQuestion];
  const isAnswered = answers[currentQuestion] !== -1;
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const allAnswered = answers.every((answer) => answer !== -1);
  const canAttempt = attempts < quiz.settings.maxAttempts;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Test Your Understanding</h3>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!submitted && !isExpired && (
              <div className="text-sm font-medium">Time Left: {formatTime(timeLeft)}</div>
            )}
            <select
              value={quizDifficulty}
              onChange={(e) => setQuizDifficulty(e.target.value)}
              className="text-sm border rounded-md px-2 py-1"
              disabled={isLoading || submitted}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isExpired && !submitted ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold text-red-600">Time's Up!</h3>
            <p className="text-muted-foreground mt-2">Your time has expired. Please try again.</p>
            <Button onClick={loadQuiz} className="mt-4" disabled={!canAttempt}>
              {canAttempt ? "Try Again" : "No attempts remaining"}
            </Button>
          </div>
        ) : submitted ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Quiz Complete!</h3>
              <p className="text-muted-foreground mt-1">
                You scored {score} out of {quiz.points} points
              </p>
              {attempts < quiz.settings.maxAttempts && (
                <p className="text-sm text-muted-foreground mt-2">
                  Attempts remaining: {quiz.settings.maxAttempts - attempts}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    {answers[index] === question.correctIndex ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{question.question}</p>
                      <p className="text-sm mt-1">
                        Your answer:{" "}
                        <span
                          className={
                            answers[index] === question.correctIndex
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {answers[index] !== -1
                            ? question.options[answers[index]]
                            : "Not answered"}
                        </span>
                      </p>
                      {answers[index] !== question.correctIndex && (
                        <p className="text-sm mt-1">
                          Correct answer:{" "}
                          <span className="text-green-600 font-medium">
                            {question.options[question.correctIndex]}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">{currentQ.question}</h4>
              <RadioGroup
                value={answers[currentQuestion] !== -1 ? answers[currentQuestion].toString() : ""}
                onValueChange={handleAnswer}
                disabled={showFeedback}
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {showFeedback && (
              <div className={`text-center py-4 rounded-lg bg-muted`}>
                <div className="flex items-center justify-center gap-2">
                  {isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <p className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect!'}
                  </p>
                </div>
                {!isCorrect && (
                  <p className="text-sm text-red-600 mt-1">
                    Correct answer: {currentQ.options[currentQ.correctIndex]}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className={submitted ? "justify-center" : "justify-between"}>
        {submitted ? (
          <Button onClick={loadQuiz} disabled={isLoading || !canAttempt}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : canAttempt ? (
              "Try Another Quiz"
            ) : (
              "No attempts remaining"
            )}
          </Button>
        ) : (
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {answers.filter((a) => a !== -1).length} of {quiz.questions.length} answered
            </div>
            <Button
              variant="outline"
              onClick={handleSubmit}
              disabled={!allAnswered || isLoading || showFeedback}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Quiz"
              )}
            </Button>
          </div>
        )}
      </CardFooter>

      {showPointsDialog && (
        <PointsEarnedDialog
          points={score}
          open={showPointsDialog}
          onClose={() => setShowPointsDialog(false)}
          previousPoints={previousPoints}
        />
      )}
    </Card>
  );
}
