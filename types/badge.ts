import { IUser } from "./user";

export interface IBadge {
  name: string;
  description: string;
  image: string;
  pointsRequired: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserBadge {
  user: IUser;
  badge: IBadge;
  earnedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
