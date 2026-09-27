"use client";

import { useState } from "react";

import ProductCard from "@/src/features/product/components/ProductCard";

import { ProductSort } from "@/src/features/product/services/product.service";
import { useProducts } from "@/src/features/product/hooks/useProducts";

import { useCategories } from "@/src/features/category/hooks/useCategories";
import useBrands from "@/src/features/brand/hooks/useBrands";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<ProductSort | "">("");
  const [page, setPage] = useState(1);

  const { categories } = useCategories();

  const { brands } = useBrands();

  const {
    products,
    pagination,
    loading,
    error,
  } = useProducts({
    search: search || undefined,
    sort: sort || undefined,
    categoryId: categoryId
      ? Number(categoryId)
      : undefined,
    brandId: brandId
      ? Number(brandId)
      : undefined,
    minPrice: minPrice
      ? Number(minPrice)
      : undefined,
    maxPrice: maxPrice
      ? Number(maxPrice)
      : undefined,
    page,
    limit: 12,
  });

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="text-3xl font-bold">
        Products
      </h1>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search products..."
        className="mt-6 w-full rounded border p-2"
      />

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Category */}
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black"
        >
          <option value="">
            Category
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

        {/* Brand */}
        <select
          value={brandId}
          onChange={(e) => {
            setBrandId(e.target.value);
            setPage(1);
          }}
          className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black"
        >
          <option value="">
            Brand
          </option>

          {brands.map((brand) => (
            <option
              key={brand.id}
              value={brand.id}
            >
              {brand.name}
            </option>
          ))}
        </select>

        {/* Min Price */}
        <input
          type="number"
          value={minPrice}
          onChange={(e) => {
            setMinPrice(e.target.value);
            setPage(1);
          }}
          placeholder="Min price"
          className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black"
        />

        {/* Max Price */}
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(e.target.value);
            setPage(1);
          }}
          placeholder="Max price"
          className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black"
        />

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => {
            setSort(
              e.target.value as ProductSort | ""
            );
            setPage(1);
          }}
          className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black"
        >
          <option value="">
            Sort by
          </option>

          <option value="newest">
            Newest
          </option>

          <option value="price_asc">
            Price: Low to High
          </option>

          <option value="price_desc">
            Price: High to Low
          </option>
        </select>
      </div>

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
            No products found.
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from(
            { length: pagination.totalPages },
            (_, index) => index + 1
          ).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`rounded border px-3 py-2 ${
                page === pageNumber
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}