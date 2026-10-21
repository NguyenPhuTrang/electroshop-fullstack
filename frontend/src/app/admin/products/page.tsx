"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";

import useBrands from "@/src/features/brand/hooks/useBrands";
import { useCategories } from "@/src/features/category/hooks/useCategories";
import { useAdminProducts } from "@/src/features/product/hooks/useAdminProducts";
import {
  deleteProduct,
  type ProductSort,
} from "@/src/features/product/services/product.service";
import type {
  Product,
  ProductVariant,
} from "@/src/features/product/types/product";

function getEffectiveVariantPrice(variant: ProductVariant): number {
  const price = Number(variant.price);

  const salePrice =
    variant.salePrice == null ? null : Number(variant.salePrice);

  if (
    salePrice !== null &&
    Number.isFinite(salePrice) &&
    salePrice < price
  ) {
    return salePrice;
  }

  return price;
}

function getProductVariantSummary(product: Product) {
  const activeVariants = (product.variants ?? []).filter(
    (variant) => variant.status === "ACTIVE"
  );

  const lowestPriceVariant = activeVariants.reduce<ProductVariant | null>(
    (lowest, variant) => {
      if (!lowest) {
        return variant;
      }

      return getEffectiveVariantPrice(variant) <
        getEffectiveVariantPrice(lowest)
        ? variant
        : lowest;
    },
    null
  );

  const stock = activeVariants.reduce(
    (total, variant) => total + variant.stock,
    0
  );

  const hasLowStockVariant = activeVariants.some(
    (variant) => variant.stock <= 10
  );

  const lowestSellingPrice =
    lowestPriceVariant !== null
      ? getEffectiveVariantPrice(lowestPriceVariant)
      : null;

  const hasDiscount =
    lowestPriceVariant !== null &&
    lowestSellingPrice !== null &&
    lowestSellingPrice < Number(lowestPriceVariant.price);

  return {
    activeVariantCount: activeVariants.length,
    lowestPriceVariant,
    lowestSellingPrice,
    hasDiscount,
    stock,
    hasLowStockVariant,
  };
}

function AdminProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const lowStock = searchParams.get("lowStock") === "true";

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

  const { categories } = useCategories();

  const { brands } = useBrands();

  const handleDeleteProduct = async (id: number) => {
    if (deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading("Deleting product...");

    setDeletingId(id);

    try {
      await deleteProduct(id);

      toast.success("Product deleted successfully.", {
        id: toastId,
      });
    } catch (error) {
      console.error("Failed to delete product:", error);

      toast.error("Unable to delete product. Please try again.", {
        id: toastId,
      });

      setDeletingId(null);

      return;
    }

    const shouldGoToPreviousPage =
      products.length === 1 &&
      pagination.page > 1 &&
      pagination.page === pagination.totalPages;

    try {
      if (shouldGoToPreviousPage) {
        setPage(Math.max(1, pagination.page - 1));
      } else {
        await refetch();
      }
    } catch (refreshError) {
      console.error(
        "Failed to refresh products after deletion:",
        refreshError
      );

      toast.error(
        "Product deleted, but the list could not be refreshed. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-col justify-between gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6"
      >
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan-500" />

            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Electroshop Administration
            </p>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Products
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {lowStock
              ? "Showing active products with at least one variant at 10 units or fewer in stock."
              : "Manage your products and variant-level pricing and inventory."}
          </p>

          {lowStock && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="size-4"
                aria-hidden="true"
              >
                <path d="m12 3 9 16H3L12 3Z" />
                <path d="M12 9v4M12 16h.01" />
              </svg>

              Low Stock Filter Active
            </div>
          )}
        </div>

        <Link
          href="/admin/products/create"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="size-4"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>

          Add Product
        </Link>
      </motion.header>

      {/* Filters */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        aria-label="Product filters"
        className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5 text-blue-600"
            aria-hidden="true"
          >
            <path d="M4 7h16M7 12h10m-7 5h4" />
            <circle cx="7" cy="7" r="1.5" fill="white" />
            <circle cx="17" cy="12" r="1.5" fill="white" />
            <circle cx="10" cy="17" r="1.5" fill="white" />
          </svg>

          <h2 className="text-sm font-semibold text-slate-800">
            Search and Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Category */}
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Brand */}
          <select
            value={brandId}
            onChange={(event) => {
              setBrandId(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by brand"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Brands</option>

            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as ProductSort | "");
              setPage(1);
            }}
            aria-label="Sort products"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Sort by</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </motion.section>

      {/* Product Table */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        aria-label="Products list"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Product Inventory
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              View and manage product details and variant-level stock levels.
            </p>
          </div>

          {!loading && !error && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <span className="size-1.5 rounded-full bg-cyan-500" />

              {products.length}{" "}
              {products.length === 1 ? "product" : "products"} on this page
            </span>
          )}
        </div>

        {loading ? (
          <div
            className="space-y-4 p-5 sm:p-6"
            aria-busy="true"
            aria-label="Loading products"
          >
            {Array.from({ length: 5 }, (_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.05,
                }}
                className="flex items-center gap-4"
              >
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="size-12 shrink-0 rounded-lg bg-slate-100"
                />

                <div className="min-w-0 flex-1 space-y-2">
                  <motion.div
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.1,
                    }}
                    className="h-3.5 w-2/5 rounded bg-slate-200"
                  />

                  <div className="h-3 w-1/4 rounded bg-slate-100" />
                </div>

                <div className="hidden h-4 w-20 rounded bg-slate-100 sm:block" />
                <div className="hidden h-4 w-24 rounded bg-slate-100 md:block" />
              </motion.div>
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex min-h-52 flex-col items-center justify-center px-5 py-10 text-center"
          >
            <div className="flex size-12 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                className="size-5"
                aria-hidden="true"
              >
                <path d="M12 8v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-800">
              Unable to load products
            </p>

            <p className="mt-1 max-w-md text-sm leading-6 text-rose-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-7"
                aria-hidden="true"
              >
                <path d="m7 4 5-2 5 2 4 3-2 13H5L3 7l4-3Z" />
                <path d="M7 4 5 20m12-16 2 16M3 7h18" />
              </svg>
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              {lowStock
                ? "No low-stock products found"
                : "No products found"}
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              {lowStock
                ? "No matching products have variants at or below the low-stock threshold."
                : "Try changing your search terms or adjusting the filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-left">
                  <th className="px-5 py-4 font-semibold text-slate-600 sm:px-6">
                    Product
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    SKU
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Brand
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Category
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Price
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Stock
                  </th>

                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {products.map((product, index) => {
                  const {
                    activeVariantCount,
                    lowestPriceVariant,
                    lowestSellingPrice,
                    hasDiscount,
                    stock,
                    hasLowStockVariant,
                  } = getProductVariantSummary(product);

                  const stockStyle =
                    activeVariantCount === 0
                      ? "border-slate-200 bg-slate-50 text-slate-500"
                      : stock === 0
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : hasLowStockVariant
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700";

                  const stockLabel =
                    activeVariantCount === 0
                      ? "No active variants"
                      : stock === 0
                        ? "Out of stock"
                        : `${stock} total units`;

                  const statusStyle =
                    product.status === "ACTIVE"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : product.status === "INACTIVE"
                        ? "border-slate-200 bg-slate-100 text-slate-600"
                        : "border-amber-200 bg-amber-50 text-amber-700";

                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: Math.min(index * 0.035, 0.2),
                        ease: "easeOut",
                      }}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      {/* Product */}
                      <td className="px-5 py-4 sm:px-6">
                        <div className="flex min-w-56 items-center gap-3">
                          {product.images?.[0]?.url ? (
                            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                              <Image
                                src={product.images[0].url}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="size-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                className="size-5"
                                aria-hidden="true"
                              >
                                <rect
                                  x="3"
                                  y="3"
                                  width="18"
                                  height="18"
                                  rx="2"
                                />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="m21 15-5-5L5 21" />
                              </svg>
                            </div>
                          )}

                          <span className="max-w-64 font-medium leading-5 text-slate-900">
                            {product.name}
                          </span>
                        </div>
                      </td>

                      {/* Product SKU */}
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-500">
                        {product.sku}
                      </td>

                      {/* Brand */}
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {product.brand?.name ?? "—"}
                      </td>

                      {/* Category */}
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {product.category?.name ?? "—"}
                      </td>

                      {/* Lowest effective selling price */}
                      <td className="whitespace-nowrap px-5 py-4">
                        {lowestPriceVariant && lowestSellingPrice !== null ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold text-blue-700">
                              {lowestSellingPrice.toLocaleString("vi-VN")} ₫
                            </span>

                            {hasDiscount && (
                              <span className="text-xs text-slate-400 line-through">
                                {Number(
                                  lowestPriceVariant.price
                                ).toLocaleString("vi-VN")}{" "}
                                ₫
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">
                            No active variant
                          </span>
                        )}
                      </td>

                      {/* Total stock across active variants */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${stockStyle}`}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {stockLabel}
                        </span>
                      </td>

                      {/* Product Status */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle}`}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {product.status}
                        </span>
                      </td>

                      {/* Actions */}
                 {/* Actions */}
<td className="px-5 py-4">
  <div className="flex min-w-[300px] flex-col items-end gap-2.5">
    {/* Primary Actions */}
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() =>
          router.push(`/admin/products/${product.id}/edit`)
        }
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
          aria-hidden="true"
        >
          <path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
        </svg>
        Edit
      </button>

      <button
        type="button"
        onClick={() => handleDeleteProduct(product.id)}
        disabled={deletingId !== null}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deletingId === product.id ? (
          <>
            <span className="size-3.5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
            Deleting...
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5"
              aria-hidden="true"
            >
              <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
            </svg>
            Delete
          </>
        )}
      </button>
    </div>

    {/* Product Management */}
    <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-slate-100 pt-2">
      <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Manage
      </span>

      <Link
        href={`/admin/products/${product.id}/images`}
        aria-label={`Manage images for ${product.name}`}
        title="Manage product images"
        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-50 px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        Images
      </Link>

      <Link
        href={`/admin/products/${product.id}/variants`}
        aria-label={`Manage variants for ${product.name}`}
        title="Manage product variants"
        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-50 px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
          aria-hidden="true"
        >
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 8v8l9 5 9-5V8" />
          <path d="M12 13v8" />
        </svg>
        Variants
      </Link>

      <Link
        href={`/admin/products/${product.id}/specifications`}
        aria-label={`Manage specifications for ${product.name}`}
        title="Manage product specifications"
        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-50 px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
          aria-hidden="true"
        >
          <path d="M8 4h13M8 12h13M8 20h13" />
          <path d="M3 4h.01M3 12h.01M3 20h.01" />
        </svg>
        Specs
      </Link>
    </div>
  </div>
</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.section>

      {/* Pagination */}
      {products.length > 0 && !loading && !error && (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page{" "}
            <span className="font-semibold text-slate-900">
              {pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {pagination.totalPages}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>

              Previous
            </button>

            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= pagination.totalPages || loading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500"
          aria-busy="true"
        >
          <span className="size-4 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
          Loading products...
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}