export enum NotificationType {
  POINTS_EARNED = "points_earned",
  ARTICLE_READ = "article_read",
  QUIZ_COMPLETED = "quiz_completed",
  ACHIEVEMENT_UNLOCKED = "achievement_unlocked",
  SYSTEM = "system"
}

export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>;
} 