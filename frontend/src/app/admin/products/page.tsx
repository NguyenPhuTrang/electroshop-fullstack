
"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import useBrands from "@/src/features/brand/hooks/useBrands";
import { useCategories } from "@/src/features/category/hooks/useCategories";
import { useAdminProducts } from "@/src/features/product/hooks/useAdminProducts";
import {
  deleteProduct,
  type ProductSort,
} from "@/src/features/product/services/product.service";

function AdminProductsContent() { // component trang mà Next.js sử dụng để hiển thị /admin/products.
  const router = useRouter();
  const searchParams = useSearchParams(); // useSearchParams() là hook của Next.js, dùng để đọc các query parameters trên URL.

  // Read the low-stock filter from the URL
  const lowStock = searchParams.get("lowStock") === "true";

  // Search / Filter
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [sort, setSort] = useState<ProductSort | "">("");
  const [page, setPage] = useState(1);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    products,
    pagination,
    loading,
    error,
    refetch,
  } = useAdminProducts({
    search: search || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    brandId: brandId ? Number(brandId) : undefined,
    sort: sort || undefined,
    page,
    limit: 10,
    lowStock,
  });

  // Categories
  const { categories } = useCategories();

  // Brands
  const { brands } = useBrands();

  const handleDeleteProduct = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteProduct(id);
      await refetch();
    } catch (error) {
      console.error("Failed to delete product", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {lowStock
              ? "Showing active products with 10 units or fewer in stock."
              : "Manage your products, pricing, and inventory."}
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products..."
            className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-black"
          />

          {/* Category */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black"
          >
            <option value="">All Categories</option>

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
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black"
          >
            <option value="">All Brands</option>

            {brands.map((brand) => (
              <option
                key={brand.id}
                value={brand.id}
              >
                {brand.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as ProductSort | "");
              setPage(1);
            }}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black"
          >
            <option value="">Sort by</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-40 items-center justify-center">
            <p className="text-sm text-gray-500">
              Loading products...
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-40 items-center justify-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center">
            <p className="text-sm text-gray-500">
              {lowStock
                ? "No low-stock products found."
                : "No products found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-300 bg-gray-50">
                <tr className="divide-x divide-gray-300 text-left">
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    SKU
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Brand
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-300">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="divide-x divide-gray-300 transition hover:bg-gray-50"
                  >
                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                            No Image
                          </div>
                        )}

                        <span className="font-medium text-gray-900">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-6 py-4 text-gray-600">
                      {product.sku}
                    </td>

                    {/* Brand */}
                    <td className="px-6 py-4 text-gray-600">
                      {product.brand?.name ?? "-"}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-gray-600">
                      {product.category?.name ?? "-"}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {Number(product.price).toLocaleString("vi-VN")} VND
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.stock === 0
                            ? "bg-red-100 text-red-700"
                            : product.stock <= 10
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {product.stock === 0
                          ? "Out of stock"
                          : `${product.stock} in stock`}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : product.status === "INACTIVE"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/admin/products/${product.id}/edit`
                            )
                          }
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteProduct(product.id)
                          }
                          disabled={deletingId === product.id}
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === product.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {products.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= pagination.totalPages}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// chứa logic và giao diện quản lý sản phẩm của bạn.
export default function AdminProductsPage() { // bọc trang quản lý sản phẩm bằng Suspense để xử lý trạng thái chờ của Next.js
  return ( // Thay vì đặt toàn bộ logic trong component này, chúng ta tách phần giao diện và xử lý sản phẩm vào AdminProductsContent.
    <Suspense // Suspense cho phép React hiển thị một giao diện tạm thời khi component con cần chờ trước khi có thể render. 
      fallback={ // Đây là giao diện tạm thời mà React hiển thị trong lúc component con đang chờ.
        <div className="flex min-h-40 items-center justify-center text-sm text-gray-500">
          Loading products...
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}
// Xử lý khi component chưa thể render, chẳng hạn do useSearchParams()