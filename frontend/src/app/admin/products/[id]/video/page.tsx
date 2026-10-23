"use client";

import { motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";

import ProductVideoManager from "@/src/features/product/components/ProductVideoManager";
import { useAdminProduct } from "@/src/features/product/hooks/useAdminProduct";
import Link from "next/link";

export default function ProductVideoPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const {
    product,
    loading,
    error,
  } = useAdminProduct(id);

  if (loading) {
    return (
      <main
        className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8"
        aria-busy="true"
        aria-label="Loading product"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="h-7 w-52 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-slate-100" />
          </div>

          <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      </main>
    );
  }

  if (error || !product || !Number.isInteger(id) || id <= 0) {
    return (
      <main className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900">
            Unable to Load Product
          </h1>

          <p role="alert" className="mt-2 text-sm text-rose-600">
            {error || "Product not found."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Electroshop Administration
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Product Video Management
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage the promotional video for {product.name}.
            </p>
          </div>

            <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products"
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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

              Back to Products
            </Link>
          </div>
        </header>

        <ProductVideoManager
          key={product.id}
          productId={product.id}
          productName={product.name}
          initialVideoUrl={product.videoUrl}
        />
      </div>
    </motion.main>
  );
}