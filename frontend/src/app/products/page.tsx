"use client";

import { useEffect, useState } from "react";

import ProductCard from "@/src/features/product/components/ProductCard";
import { getProducts } from "@/src/features/product/services/product.service";
import type { Product } from "@/src/features/product/types/product";
import { getCategories } from "@/src/features/category/services/category.service";
import { Category } from "@/src/features/category/types/category";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]); //categories → toàn bộ danh sách category lấy từ backend
  const [products, setProducts] = useState<Product[]>([]); // categoryId → category mà người dùng đang chọn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          setError("");

          const data = await getProducts({
            search: search || undefined,
            categoryId: categoryId ?Number(categoryId): undefined,
            page: 1,
            limit: 12,
          });

          setProducts(data.products);
        } catch (error) {
          console.error("Failed to get products:", error);
          setError("Failed to load products.");
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search, categoryId]); 

  useEffect(() => {
    const fetchCategories = async () => {
      try{
        const data = await getCategories();
        setCategories(data);
      } catch(error){
        console.log("Failed to get categories", error);
      }
    };

    fetchCategories()
  }, [])
    

 return (
  <main className="mx-auto max-w-7xl p-6">
    <h1 className="text-3xl font-bold">
      Products
    </h1>

    {/* Search */}
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search products..."
      className="mt-6 w-full rounded border p-2"
    />

    {/* Category */}
    <select
      value={categoryId}
      onChange={(e) => setCategoryId(e.target.value)}
      className="mt-4 rounded border p-2"
    >
      <option value="">
        All Categories
      </option>

      {categories.map((category) => (
        <option
          key={category.id}
          value={category.id}
        >
          {category.name}
        </option>
      ))}
    </select>

    {/* Products */}
    <div className="mt-6">
      {loading ? (
        <p>
          {search
            ? "Searching..."
            : "Loading products..."}
        </p>
      ) : error ? (
        <p className="text-red-500">
          {error}
        </p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">
          No products found .
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              salePrice={product.salePrice}
              image={product.images?.[0]?.url}
              slug={product.slug}
            />
          ))}
        </div>
      )}
    </div>
  </main>
);
}