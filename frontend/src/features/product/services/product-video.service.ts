import api from "@/src/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type ProductVideoUploadResult = {
  id: number;
  name: string;
  videoUrl: string | null;
  videoPublicId: string | null;
};

export async function uploadProductVideo(
  productId: number,
  file: File
): Promise<ProductVideoUploadResult> {
  const formData = new FormData();

  formData.append("video", file);

  const response = await api.post<
    ApiResponse<ProductVideoUploadResult>
  >(`/products/${productId}/video`, formData);

  return response.data.data;
}