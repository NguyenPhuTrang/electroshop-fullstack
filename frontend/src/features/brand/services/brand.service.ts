import api from "@/src/lib/axios";
import { Brand } from "../types/brand";

export type BrandPayload = {
  name : string,
  slug : string,
  description? : string,
  logo? : string
};


export async function getBrand(): Promise<Brand[]>
{
    const response = await api.get("/brands");

    return response.data.data;
};

export async function getBrandById(id: number) : Promise<Brand> {
  const response = await api.get(`/brands/${id}`);

  return response.data.data;
}

export async function createBrand(
  data: BrandPayload
) : Promise<Brand> {
  const response = await api.post("/brands", data);

  return response.data.data;
};

export async function updateBrand(
    id: number,
    data: Partial<BrandPayload>
): Promise<Brand> {
    const payload = { ...data }; // tạo một object mới, sao chép các thuộc tính ở cấp đầu tiên.

    if (payload.logo !== undefined && !payload.logo.trim()) { // Kiểm tra trường logo có phải là chuỗi rống hay không nếu rỗng thì xóa thuộc tính logo gửi lên Back end.
        delete payload.logo;
    }

    const response = await api.patch(`/brands/${id}`, payload);

    return response.data.data;
}

export async function deleteBrand(id: number): Promise<void> {
  await api.delete(`/brands/${id}`);
}
