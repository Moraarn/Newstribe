export interface IReward {
  _id: string;
  name: string;
  description: string;
  type: 'airtime' | 'voucher' | 'experience' | 'merchandise';
  pointsRequired: number;
  quantity: number;
  image: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RewardResponse {
  rewards: IReward[];
  total: number;
  page: number;
  limit: number;
} 