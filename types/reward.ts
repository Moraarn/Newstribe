import { IUser } from "./user";

export enum RewardType {
  POINTS = "points",
  AIRTIME = "airtime",
  VOUCHER = "voucher",
  HAMPER = "hamper",
}

export interface IReward {
  name: string;
  description: string;
  type: RewardType;
  pointsRequired: number;
  quantity: number;
  image: string;
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserReward {
  user: IUser;
  reward: IReward;
  redeemedAt: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
