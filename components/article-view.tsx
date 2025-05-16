"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Headphones,
  MessageSquare,
  Share2,
  Star,
  ThumbsUp,
} from "lucide-react";
import { CommentSection } from "@/components/comment-section";
import { ArticleQuestions } from "@/components/article-questions";
import { PointsEarnedDialog } from "@/components/points-earned-dialog";
import { IContent } from "@/types/content";
import {
  updateUserProgress,
  getComments,
  likeContent,
  shareContent,
  rateContent,
} from "@/app/(app)/content/actions";
import { toast } from "sonner";

interface ArticleViewProps {
  article: IContent;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Quiz {
  _id: string;
  questions: QuizQuestion[];
  points: number;
  settings: {
    timeLimit: number;
    maxAttempts: number;
    difficulty: string;
  };
}

interface QuizResponse {
  success: boolean;
  message: string;
  quiz: Quiz;
}

interface CommentsResponse {
  success: boolean;
  comments: any[];
  total: number;
}

export function ArticleView({ article }: ArticleViewProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizDifficulty, setQuizDifficulty] = useState("medium");
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`article_${article._id}_progress`);
    if (savedProgress) {
      const { readingProgress: savedReadingProgress, earnedPoints: savedPoints } =
        JSON.parse(savedProgress);
      setReadingProgress(savedReadingProgress);
      setEarnedPoints(savedPoints);
    }
  }, [article._id]);

  // Load comments
  useEffect(() => {
    loadComments();
  }, [article._id]);

  const loadComments = async () => {
    try {
      setIsCommentsLoading(true);
      const response = (await getComments(article._id, { limit: 10, page: 1 })) as CommentsResponse;
      if (response.success) {
        setComments(response.comments);
      }
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setIsCommentsLoading(false);
    }
  };

  // Save progress to localStorage
  const saveProgress = (progress: number, points: number) => {
    localStorage.setItem(
      `article_${article._id}_progress`,
      JSON.stringify({ readingProgress: progress, earnedPoints: points })
    );
  };

  // Simulate reading time tracking
  useEffect(() => {
    if (isReading) {
      const interval = setInterval(() => {
        setReadingTime((prev) => {
          const newTime = prev + 1;
          const progress = Math.min((newTime / (article.estimatedReadTime * 60)) * 100, 100);
          setReadingProgress(progress);

          if (progress >= 80 && earnedPoints === 0) {
            const points = article.points || 0;
            setEarnedPoints(points);
            setShowPointsDialog(true);
            saveProgress(progress, points);

            // Update user progress in backend
            updateUserProgress({
              content: article,
              progress: progress,
              pointsEarned: points,
              completed: false,
              lastEngagedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            }).catch(console.error);
          }

          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isReading, article.estimatedReadTime, earnedPoints, article.points, article._id]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = answerIndex;
      return newAnswers;
    });
  };

  const handleLike = async () => {
    try {
      setIsLoading(true);
      await likeContent(article._id);
      toast.success("Article liked successfully");
    } catch (error) {
      toast.error("Failed to like article");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsLoading(true);
      await shareContent(article._id);
      toast.success("Article shared successfully");
    } catch (error) {
      toast.error("Failed to share article");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRate = async (rating: number) => {
    try {
      setIsLoading(true);
      await rateContent(article._id, rating);
      toast.success("Article rated successfully");
    } catch (error) {
      toast.error("Failed to rate article");
    } finally {
      setIsLoading(false);
    }
  };

  // Format seconds to minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="container py-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Link href="/articles" className="text-sm text-muted-foreground hover:underline">
              ← Back to Articles
            </Link>
            <h1 className="text-3xl font-bold mt-4">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={article.imageUrl || "/placeholder.svg"} alt={article.title} />
                  <AvatarFallback>{article.title.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{article.title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{article.estimatedReadTime} min read</span>
              </div>
              <Badge variant="outline" className="gap-1">
                <BookOpen className="h-3 w-3" />
                {article.category}
              </Badge>
              {article.blockchainHash && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Blockchain Verified
                </Badge>
              )}
            </div>
          </div>

          <div className="relative">
            <Image
              src={article.imageUrl || "/placeholder.svg"}
              alt={article.title}
              width={800}
              height={400}
              className="w-full rounded-lg object-cover h-[300px]"
            />
            {article.audioUrl && (
              <Button
                variant="secondary"
                className="absolute top-4 right-4 gap-2 px-4 py-2 shadow-md hover:shadow-lg transition-all"
                onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                disabled={isLoading}
              >
                <Headphones className="h-4 w-4" />
                {isAudioPlaying ? "Pause Audio" : "Listen to Article"}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Reading Progress</span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(readingTime)} / {article.estimatedReadTime}:00
                </span>
              </div>
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                {article.points} points
              </Badge>
            </div>
            <Progress value={readingProgress} className="h-2" />
          </div>

          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleLike}
                disabled={isLoading}
              >
                <ThumbsUp className="h-4 w-4" />
                Like
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() =>
                  document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })
                }
                disabled={isLoading}
              >
                <MessageSquare className="h-4 w-4" />
                Comment
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleShare}
                disabled={isLoading}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Rate this article:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRate(star)}
                    disabled={isLoading}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= Math.round(article.trustRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span className="sr-only">Rate {star} stars</span>
                  </Button>
                ))}
              </div>
              <span className="text-sm font-medium">{article.trustRating}</span>
            </div>
          </div>

          <Tabs defaultValue="questions">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="questions">Comprehension Questions</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            <TabsContent value="questions" className="mt-4">
              <ArticleQuestions articleId={article._id} />
            </TabsContent>
            <TabsContent value="comments" className="mt-4" id="comments">
              <CommentSection articleId={article._id} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Related Articles</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((id) => (
                <div key={id} className="flex gap-3">
                  <Image
                    src={`/open-book-knowledge.png?height=60&width=60&query=article ${id}`}
                    alt="Related article"
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                  />
                  <div>
                    <Link
                      href={`/articles/${id}`}
                      className="font-medium text-sm hover:underline line-clamp-2"
                    >
                      {id === 1
                        ? "The Rise of AI in Everyday Life"
                        : id === 2
                        ? "Sustainable Energy Solutions for Africa"
                        : "Digital Transformation in Business"}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {id * 3 + 2} min read • {id * 10 + 20} points
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/articles">View More</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Recommended Quizzes</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map((id) => (
                <div key={id} className="space-y-2">
                  <Link href={`/quizzes/${id}`} className="font-medium text-sm hover:underline">
                    {id === 1 ? "Technology Trends Quiz" : "Environmental Awareness Challenge"}
                  </Link>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{id === 1 ? 8 : 10} questions</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span>{id === 1 ? 80 : 100} points</span>
                    </div>
                  </div>
                  {id === 1 && (
                    <Badge variant="outline" className="text-xs bg-primary/10 gap-1">
                      <Award className="h-3 w-3 text-primary" />
                      Win Airtime
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/quizzes">View More Quizzes</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {showPointsDialog && (
        <PointsEarnedDialog
          points={earnedPoints}
          open={showPointsDialog}
          onClose={() => setShowPointsDialog(false)}
          previousPoints={0}
        />
      )}
    </div>
  );
}
