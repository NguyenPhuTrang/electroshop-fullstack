"use client";

import { useEffect, useState } from "react";
import ProductCard from "../features/product/components/ProductCard";
import { getProducts } from "../features/product/services/product.service";
import { Product } from "../features/product/types/product";

export default function Home() {
const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const data = await getProducts();

            setProducts(data);
        } catch (error) {
            console.error(error);
            setError("Không thể lấy danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    fetchProducts();
}, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl p-4">
        <p>Đang tải sản phẩm...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl p-4">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-4">
      <h1 className="mb-6 text-3xl font-bold">
        Electroshop
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
          />
        ))}
      </div>
    </main>
  );
}