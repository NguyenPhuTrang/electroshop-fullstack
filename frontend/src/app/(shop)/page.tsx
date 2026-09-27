"use client";

import ProductCard from "@/src/features/product/components/ProductCard";
import { useProducts } from "@/src/features/product/hooks/useProducts";

export default function Home() {
  const {
    products,
    loading,
    error,
  } = useProducts({
    page: 1,
    limit: 30,
  });

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl p-4">
        <p>Loading products...</p>
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
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            salePrice={product.salePrice}
            image={product.images[0]?.url}
            slug={product.slug}
            priority={index === 0}
          />
        ))}
      </div>
    </main>
  );
}