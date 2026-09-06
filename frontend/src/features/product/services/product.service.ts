import api from "@/src/lib/axios";
import { Product } from "../types/product";

export async function getProducts(): Promise<Product[]>{
    const response = await api.get("/products");

    return response.data.data.products;
    
}