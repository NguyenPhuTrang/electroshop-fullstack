"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";

import ProductSpecificationManager from "@/src/features/product/components/ProductSpecificationManager";

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

function ProductSpecificationsLoadingSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading product specifications"
    >
      {/* Product Specification Manager Header Skeleton */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6"
      >
        <div className="flex-1">
          <LoadingBar className="h-3 w-36 rounded bg-slate-200" />

          <LoadingBar
            className="mt-4 h-6 w-56 max-w-full rounded bg-slate-200"
            delay={0.1}
          />

          <div className="mt-3 h-4 w-full max-w-lg rounded bg-slate-100" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LoadingBar className="h-8 w-28 rounded-full bg-slate-100" />

          <LoadingBar
            className="h-10 w-44 rounded-lg bg-blue-100"
            delay={0.1}
          />
        </div>
      </motion.header>

      {/* Existing Specifications Table Skeleton */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        {/* Table Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <LoadingBar className="h-5 w-44 rounded bg-slate-200" />

            <LoadingBar
              className="mt-2 h-4 w-28 rounded bg-slate-100"
              delay={0.1}
            />
          </div>

          <LoadingBar className="h-9 w-24 rounded-lg bg-slate-100" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left">
                  <LoadingBar className="h-3 w-16 rounded bg-slate-200" />
                </th>

                <th className="px-5 py-3 text-left">
                  <LoadingBar className="h-3 w-16 rounded bg-slate-200" />
                </th>

                <th className="px-5 py-3 text-left">
                  <LoadingBar className="h-3 w-16 rounded bg-slate-200" />
                </th>

                <th className="px-5 py-3 text-center">
                  <LoadingBar className="mx-auto h-3 w-12 rounded bg-slate-200" />
                </th>

                <th className="px-5 py-3 text-right">
                  <LoadingBar className="ml-auto h-3 w-16 rounded bg-slate-200" />
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 5 }, (_, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.15 + rowIndex * 0.06,
                    ease: "easeOut",
                  }}
                >
                  {/* Group */}
                  <td className="px-5 py-4">
                    <LoadingBar className="h-6 w-24 rounded-full bg-slate-100" />
                  </td>

                  {/* Label */}
                  <td className="px-5 py-4">
                    <LoadingBar className="h-4 w-28 rounded bg-slate-200" />
                    <LoadingBar className="mt-2 h-3 w-16 rounded bg-slate-100" />
                  </td>

                  {/* Value */}
                  <td className="px-5 py-4">
                    <LoadingBar className="h-4 w-36 max-w-full rounded bg-slate-100" />
                    <LoadingBar className="mt-2 h-3 w-24 max-w-full rounded bg-slate-100" />
                  </td>

                  {/* Sort Order */}
                  <td className="px-5 py-4">
                    <LoadingBar className="mx-auto h-4 w-8 rounded bg-slate-100" />
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <LoadingBar className="h-9 w-14 rounded-lg bg-slate-100" />
                      <LoadingBar className="h-9 w-16 rounded-lg bg-slate-100" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}

export default function ProductSpecificationsPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const isValidProductId =
    Number.isSafeInteger(productId) && productId > 0;

  const [managerLoading, setManagerLoading] = useState(true);
  const [minimumLoadingTimeElapsed, setMinimumLoadingTimeElapsed] =
    useState(false);

  // Keep the initial skeleton visible for at least 700 ms.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMinimumLoadingTimeElapsed(true);
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const showLoading =
    managerLoading || !minimumLoadingTimeElapsed;

  return (
    <main className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Electroshop Administration
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Product Specifications
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage technical details and specifications for this product.
            </p>

            {isValidProductId && (
              <p className="mt-2 text-xs text-slate-400">
                Product ID: {productId}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products"
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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

        {isValidProductId ? (
          <section className="mt-6">
            {/* Loading Skeleton */}
            {showLoading && <ProductSpecificationsLoadingSkeleton />}

            {/* Keep the manager mounted only once. */}
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
              <ProductSpecificationManager
                productId={productId}
                onLoadingChange={setManagerLoading}
              />
            </motion.div>
          </section>
        ) : (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"
          >
            Invalid product ID. Please return to the products list and
            select a valid product.
          </div>
        )}
      </div>
    </main>
  );
}