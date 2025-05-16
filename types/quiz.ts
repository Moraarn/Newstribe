export interface IQuiz {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  questions: IQuestion[];
  points: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface IQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuizResponse {
  data: {
    quizzes: IQuiz[];
  };
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: number | null;
  page: number;
  prevPage: number | null;
  totalDocs: number;
  totalPages: number;
} 