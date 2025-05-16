
export enum ContentType {
  ARTICLE = "article",
  QUIZ = "quiz",
  SPONSORED = "sponsored",
  MINI_GAME = "mini_game",
}

export enum ContentStatus {
  ACTIVE = "active",
  DRAFT = "draft",
  ARCHIVED = "archived",
}

export interface IContent {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: ContentType;
  status: ContentStatus;
  category: string;
  estimatedReadTime: number;
  points: number;
  isSponsored: boolean;
  sponsor?: any;
  blockchainHash?: string;
  tags: string[];
  trustRating: number;
  trustRatingCount: number;
  audioUrl?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
