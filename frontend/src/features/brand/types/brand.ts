import api from "@/src/lib/axios";

export type Brand = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
};


