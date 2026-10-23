import api from "@/src/lib/axios";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type ProductVideoResult = {
  id: number;
  name: string;
  videoUrl: string | null;
  videoPublicId: string | null;
};

// 1. Add a video by uploading a file
export async function uploadProductVideo(
  productId: number,
  file: File
): Promise<ProductVideoResult> {
  const formData = new FormData();

  formData.append("video", file);

  const response = await api.post<
    ApiResponse<ProductVideoResult>
  >(`/products/${productId}/video`, formData);

  return response.data.data;
}

// 2. Add a video using a URL
export async function uploadProductVideoFromUrl(
  productId: number,
  videoUrl: string
): Promise<ProductVideoResult> {
  const response = await api.post<
    ApiResponse<ProductVideoResult>
  >(`/products/${productId}/video/url`, {
    videoUrl,
  });

  return response.data.data;
}

// 3. Replace a video by uploading a new file
export async function updateProductVideo(
  productId: number,
  file: File
): Promise<ProductVideoResult> {
  const formData = new FormData();

  formData.append("video", file);

  const response = await api.put<
    ApiResponse<ProductVideoResult>
  >(`/products/${productId}/video`, formData);

  return response.data.data;
}

// 4. Replace a video using a new URL
export async function updateProductVideoFromUrl(
  productId: number,
  videoUrl: string
): Promise<ProductVideoResult> {
  const response = await api.put<
    ApiResponse<ProductVideoResult>
  >(`/products/${productId}/video/url`, {
    videoUrl,
  });

  return response.data.data;
}

// 5. Delete a product video
export async function deleteProductVideo(
  productId: number
): Promise<ProductVideoResult> {
  const response = await api.delete<
    ApiResponse<ProductVideoResult>
  >(`/products/${productId}/video`);

  return response.data.data;
}