"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, Reply, MoreHorizontal, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getComments, createComment, awardPoints } from "@/app/(app)/content/actions";
import { PointsSource } from "@/types/points";
import { toast } from "sonner";
import { useNotifications } from "@/contexts/notification-context";
import { useUser } from "@/contexts/user-context";
import { NotificationType } from "@/types/notification";
import { PointsEarnedDialog } from "@/components/points-earned-dialog";

interface CommentSectionProps {
  articleId: string;
}

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
  updatedAt: string;
}

interface CommentsResponse {
  success: boolean;
  message: string;
  comments: Comment[];
  pagination: {
    page: number;
    total: number;
    limit: number;
    totalPages: number;
  };
  filters: Record<string, any>;
  sort: Record<string, number>;
}

interface CreateCommentResponse {
  success: boolean;
  message: string;
  comment: Comment;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const { addNotification } = useNotifications();
  const { refresh: refreshUser, user } = useUser();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const previousPoints = user?.points || 0;

  useEffect(() => {
    loadComments();
  }, [articleId, page, sortBy]);

  const getAvatarUrl = (email: string, avatar?: string) => {
    if (avatar) return avatar;
    // Use DiceBear's avataaars with email as seed
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const response = (await getComments(articleId, {
        limit: 10,
        page,
        sort: { createdAt: sortBy === "newest" ? -1 : 1 },
      })) as CommentsResponse;

      if (response.success) {
        if (page === 1) {
          setComments(response.comments);
        } else {
          setComments((prev) => [...prev, ...response.comments]);
        }
        setHasMore(page < response.pagination.totalPages);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;

    try {
      setIsSubmitting(true);
      const response = (await createComment(articleId, comment)) as CreateCommentResponse;
      if (response.success) {
        setComment("");
        // Reload comments to show the new one
        setPage(1);
        loadComments();
        toast.success("Comment posted successfully");

        // Award points for commenting
        await awardPoints(2, PointsSource.COMMENT, "Posted a comment");

        // Show notification
        addNotification({
          type: NotificationType.POINTS_EARNED,
          title: "Points Earned!",
          message: "You earned 2 points for posting a comment!",
        });

        // Show points dialog
        setShowPointsDialog(true);

        // Refresh user context to update points
        await refreshUser();
      }
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const toggleSort = () => {
    setSortBy((prev) => (prev === "newest" ? "oldest" : "newest"));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg?height=40&width=40&query=user" alt="@you" />
            <AvatarFallback>YOU</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitComment} disabled={!comment.trim() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Comment"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Comments ({comments.length})</h3>
          <Button variant="ghost" size="sm" onClick={toggleSort}>
            Sort by: {sortBy === "newest" ? "Newest" : "Oldest"}
          </Button>
        </div>

        {isLoading && page === 1 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={getAvatarUrl(comment.user.email, comment.user.avatar)}
                    alt={`${comment.user.firstName} ${comment.user.lastName}`}
                  />
                  <AvatarFallback>
                    {comment.user.firstName.substring(0, 1)}
                    {comment.user.lastName.substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {comment.user.firstName} {comment.user.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{comment.text}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs gap-1"
                      onClick={() => toast.info("Like functionality coming soon")}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs gap-1"
                      onClick={() => toast.info("Reply functionality coming soon")}
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Reply
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={() => toast.info("Report functionality coming soon")}
                        >
                          Report
                        </DropdownMenuItem>
                        {comment.user._id === "current_user_id" && (
                          <DropdownMenuItem
                            onClick={() => toast.info("Delete functionality coming soon")}
                          >
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Comments"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {showPointsDialog && (
        <PointsEarnedDialog
          points={2}
          open={showPointsDialog}
          onClose={() => setShowPointsDialog(false)}
          previousPoints={previousPoints}
        />
      )}
    </div>
  );
}
