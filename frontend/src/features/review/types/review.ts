export type ReviewUser = {
  id: number;
  name: string;
};

export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
};