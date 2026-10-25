"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";

function SkeletonBlock({
  className,
  style,
}: {
  className: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      aria-hidden="true"
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{
        duration: 1.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
      style={style}
    />
  );
}

export default function DashboardLoadingSkeleton() {
  const t = useTranslations("DashboardLoadingSkeleton");

  return (
    <main
      className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8"
      aria-busy="true"
      aria-label={t("ariaLabel")}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto max-w-7xl"
      >
        {/* Header Skeleton */}
        <header className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <SkeletonBlock className="h-3 w-44 rounded-full bg-slate-200" />
          <SkeletonBlock className="mt-4 h-8 w-48 rounded-lg bg-slate-200" />
          <SkeletonBlock className="mt-3 h-4 w-80 max-w-full rounded bg-slate-100" />
        </header>

        {/* Store Overview Skeleton */}
        <section className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SkeletonBlock className="h-6 w-40 rounded bg-slate-200" />
              <SkeletonBlock className="mt-2 h-4 w-64 max-w-full rounded bg-slate-100" />
            </div>

            <div className="flex gap-1">
              {[1, 2, 3].map((item) => (
                <SkeletonBlock
                  key={item}
                  className="h-9 w-16 rounded-lg bg-slate-200"
                />
              ))}
            </div>
          </div>

          {/* KPI Cards Skeleton */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }, (_, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(index * 0.04, 0.24),
                  ease: "easeOut",
                }}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <SkeletonBlock className="h-4 w-28 rounded bg-slate-200" />
                    <SkeletonBlock className="mt-4 h-8 w-36 max-w-full rounded bg-slate-100" />
                  </div>

                  <SkeletonBlock className="size-11 shrink-0 rounded-lg bg-slate-100" />
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3">
                  <SkeletonBlock className="h-3 w-36 max-w-full rounded bg-slate-100" />
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Charts Skeleton */}
        <section className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Revenue Chart */}
          <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">
            <SkeletonBlock className="h-6 w-44 rounded bg-slate-200" />
            <SkeletonBlock className="mt-2 h-4 w-64 max-w-full rounded bg-slate-100" />

            <div className="mt-7 flex h-72 items-end gap-3 border-b border-slate-100 px-3">
              {[35, 55, 42, 75, 60, 88, 65, 95, 72, 50, 80, 62].map(
                (height, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.1 + index * 0.035,
                      ease: "easeOut",
                    }}
                    className="flex-1 rounded-t bg-blue-100"
                    style={{ height: `${height}%` }}
                  />
                )
              )}
            </div>
          </article>

          {/* Orders by Status Chart */}
          <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <SkeletonBlock className="h-6 w-40 rounded bg-slate-200" />
            <SkeletonBlock className="mt-2 h-4 w-52 max-w-full rounded bg-slate-100" />

            <div className="mt-7 flex h-72 flex-col justify-center gap-5">
              {[80, 55, 90, 65, 45, 70].map((width, index) => (
                <div key={index} className="flex items-center gap-3">
                  <SkeletonBlock className="h-3 w-20 shrink-0 rounded bg-slate-100" />

                  <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
                    <SkeletonBlock
                      className="h-full rounded bg-blue-100"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* Things Need Attention Skeleton */}
        <section className="mt-8">
          <SkeletonBlock className="h-6 w-48 rounded bg-slate-200" />
          <SkeletonBlock className="mt-2 h-4 w-72 max-w-full rounded bg-slate-100" />

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.1 + index * 0.08,
                }}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5"
              >
                <SkeletonBlock className="size-12 shrink-0 rounded-lg bg-slate-100" />

                <div className="min-w-0 flex-1">
                  <SkeletonBlock className="h-4 w-32 max-w-full rounded bg-slate-200" />
                  <SkeletonBlock className="mt-3 h-3 w-40 max-w-full rounded bg-slate-100" />
                  <SkeletonBlock className="mt-3 h-3 w-24 rounded bg-slate-100" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Orders Skeleton */}
        <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <SkeletonBlock className="h-6 w-36 rounded bg-slate-200" />
            <SkeletonBlock className="mt-2 h-4 w-64 max-w-full rounded bg-slate-100" />
          </div>

          <div className="space-y-5 p-5">
            {[1, 2, 3, 4, 5].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.06,
                }}
                className="flex gap-5"
              >
                <SkeletonBlock className="h-4 w-28 shrink-0 rounded bg-slate-100" />
                <SkeletonBlock className="h-4 w-32 shrink-0 rounded bg-slate-100" />
                <SkeletonBlock className="h-4 w-24 shrink-0 rounded bg-slate-100" />
                <SkeletonBlock className="h-4 w-20 shrink-0 rounded bg-slate-100" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Reviews Skeleton */}
        <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <SkeletonBlock className="h-6 w-36 rounded bg-slate-200" />
            <SkeletonBlock className="mt-2 h-4 w-64 max-w-full rounded bg-slate-100" />
          </div>

          <div className="divide-y divide-slate-100">
            {[1, 2, 3].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.08,
                }}
                className="flex gap-4 p-5 sm:p-6"
              >
                <div className="min-w-0 flex-1">
                  <SkeletonBlock className="h-4 w-40 rounded bg-slate-200" />
                  <SkeletonBlock className="mt-3 h-3 w-32 rounded bg-slate-100" />
                  <SkeletonBlock className="mt-3 h-3 w-full max-w-md rounded bg-slate-100" />
                </div>

                <SkeletonBlock className="h-6 w-24 shrink-0 rounded-full bg-slate-100" />
              </motion.div>
            ))}
          </div>
        </section>

        <div className="h-6 sm:h-8" />
      </motion.div>
    </main>
  );
}