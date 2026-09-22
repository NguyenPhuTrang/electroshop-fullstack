import api from "@/src/lib/axios";
import { Brand } from "../types/brand";


export async function getBrand(): Promise<Brand[]>
{
    const response = await api.get("/brands");

    return response.data.data;
}