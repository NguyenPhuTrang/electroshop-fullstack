
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import ProductImageManager from "@/src/features/product/components/ProductImageManager";

function LoadingBar({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{
        duration: 1.4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={className}
    />
  );
}

function ProductImagesLoadingSkeleton() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      aria-busy="true"
      aria-label="Loading product images"
      className="space-y-6"
    >
      {/* Product Image Manager Header Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <LoadingBar className="h-3 w-36 rounded-full bg-slate-200" />

            <LoadingBar
              className="mt-4 h-6 w-48 max-w-full rounded-lg bg-slate-200"
              delay={0.1}
            />

            <div className="mt-3 h-4 w-full max-w-lg rounded bg-slate-100" />
          </div>

          <div className="flex items-center gap-3">
            <LoadingBar className="h-7 w-20 rounded-full bg-slate-100" />
            <LoadingBar className="h-10 w-32 rounded-lg bg-slate-200" delay={0.1} />
          </div>
        </div>
      </motion.div>

      {/* Image Library Skeleton */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <LoadingBar className="h-5 w-40 rounded bg-slate-200" />

          <div className="mt-2 h-3 w-64 max-w-full rounded bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: Math.min(index * 0.06, 0.18),
                ease: "easeOut",
              }}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                <LoadingBar className="absolute inset-0 rounded-lg bg-slate-100" />
              </div>

              <LoadingBar className="mt-4 h-4 w-3/4 rounded bg-slate-200" />

              <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />

              <div className="mt-4 flex gap-2">
                <div className="h-9 flex-1 rounded-lg bg-slate-100" />
                <div className="h-9 w-16 rounded-lg bg-slate-100" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.section>
  );
}

export default function ProductImagesPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const [imageManagerLoading, setImageManagerLoading] = useState(true);
  const [minimumLoadingTimeElapsed, setMinimumLoadingTimeElapsed] =
    useState(false);

  // Keep the initial skeleton visible long enough for its animation to be seen.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMinimumLoadingTimeElapsed(true);
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const isValidProductId =
    Number.isSafeInteger(productId) && productId > 0;

  const showLoading =
    imageManagerLoading || !minimumLoadingTimeElapsed;

  if (!isValidProductId) {
    return (
      <main className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mx-auto max-w-7xl rounded-xl border border-slate-200 bg-white p-6"
        >
          <h1 className="text-lg font-semibold text-slate-900">
            Invalid Product ID
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please select a valid product to manage its images.
          </p>

          <Link
            href="/admin/products"
            className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Back to Products
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto max-w-7xl space-y-6"
      >
        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: 0.05,
            ease: "easeOut",
          }}
          className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Electroshop Administration
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Manage Product Images
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage images for product #{productId}.
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Product ID: {productId}
            </p>
          </div>

          {/* Back Navigation */}
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
        </motion.header>

        {/* Loading Skeleton */}
        {showLoading && <ProductImagesLoadingSkeleton />}

        {/* Product Image Manager: mounted only once */}
        <motion.div
          initial={false}
          animate={{
            opacity: showLoading ? 0 : 1,
            y: showLoading ? 8 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={showLoading ? "hidden" : "block"}
          aria-hidden={showLoading}
        >
          <ProductImageManager
            productId={productId}
            onLoadingChange={setImageManagerLoading}
          />
        </motion.div>
      </motion.div>
    </main>
  );
}
