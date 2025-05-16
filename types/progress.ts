import { IUser } from "./user";
import { IContent } from "./content";

export interface IUserProgress {
  user: IUser;
  content: IContent;
  progress: number;
  pointsEarned: number;
  completed: boolean;
  quizScore?: number;
  lastEngagedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
