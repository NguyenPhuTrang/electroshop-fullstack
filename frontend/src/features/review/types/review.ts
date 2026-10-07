export type ReviewUser = {
  id: number;
  name: string;
  email: string;
};

export type ReviewProduct = {
  id: number;
  name: string;
  slug: string;
};

export type Review = {
    id: number;
    rating: number;
    comment: string | null;
    createdAt: string;
    updatedAt: string;
    user: ReviewUser;
    product: ReviewProduct;
    reply: ReviewReply | null;
};

export type ReviewReply = {
    id: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    admin: {
        id: number;
        name: string;
    };
};