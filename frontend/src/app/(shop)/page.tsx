
"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ProductCard from "@/src/features/product/components/ProductCard";
import { useProducts } from "@/src/features/product/hooks/useProducts";
import type {
  Product,
  ProductVariant,
} from "@/src/features/product/types/product";

/**
 * Find the active variant with the lowest effective selling price.
 * Use salePrice when available; otherwise use the regular price.
 */
const getLowestPriceVariant = (
  product: Product
): ProductVariant | null => {
  const activeVariants = (product.variants ?? []).filter(
    (variant) => variant.status === "ACTIVE"
  );

  return activeVariants.reduce<ProductVariant | null>(
    (lowest, variant) => {
      if (!lowest) {
        return variant;
      }

      const currentPrice = Number(
        variant.salePrice ?? variant.price
      );

      const lowestPrice = Number(
        lowest.salePrice ?? lowest.price
      );

      return currentPrice < lowestPrice ? variant : lowest;
    },
    null
  );
};

export default function Home() {
  const { products, loading, error } = useProducts({
    page: 1,
    limit: 10,
    sort: "newest",
  });

  // Featured Product Carousel
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);

  const featuredProducts = useMemo(
    () =>
      products
        .filter((product) => Boolean(product.images?.[0]?.url))
        .slice(0, 5),
    [products]
  );

  const featuredProductCount = featuredProducts.length;

  const safeFeaturedIndex =
    featuredProductCount > 0
      ? activeFeaturedIndex % featuredProductCount
      : 0;

  const activeFeaturedProduct = featuredProducts[safeFeaturedIndex];

  // Product Collection Carousel
  const productsScrollerRef = useRef<HTMLDivElement>(null);

  const [canScrollProductsLeft, setCanScrollProductsLeft] =
    useState(false);
  const [canScrollProductsRight, setCanScrollProductsRight] =
    useState(false);

  // Update arrow states based on the horizontal scroll position.
  const updateProductScrollButtons = useCallback(() => {
    const container = productsScrollerRef.current;

    if (!container) {
      return;
    }

    setCanScrollProductsLeft(container.scrollLeft > 4);

    setCanScrollProductsRight(
      container.scrollLeft + container.clientWidth <
        container.scrollWidth - 4
    );
  }, []);

  // Scroll approximately one product card at a time.
  const scrollProducts = useCallback((direction: -1 | 1) => {
    const container = productsScrollerRef.current;

    if (!container) {
      return;
    }

    const firstCard =
      container.querySelector<HTMLElement>("[data-product-slide]");

    if (!firstCard) {
      return;
    }

    const styles = window.getComputedStyle(container);
    const gap = Number.parseFloat(styles.columnGap) || 0;
    const distance = firstCard.getBoundingClientRect().width + gap;

    container.scrollBy({
      left: direction * distance,
      behavior: "smooth",
    });
  }, []);

  // Update carousel controls when products load or the layout changes.
  useEffect(() => {
    const container = productsScrollerRef.current;

    if (!container) {
      return;
    }

    updateProductScrollButtons();

    window.addEventListener("resize", updateProductScrollButtons);

    const resizeObserver = new ResizeObserver(() => {
      updateProductScrollButtons();
    });

    resizeObserver.observe(container);

    return () => {
      window.removeEventListener("resize", updateProductScrollButtons);
      resizeObserver.disconnect();
    };
  }, [
    products.length,
    loading,
    updateProductScrollButtons,
  ]);

  // Automatically switch featured products every 3 seconds.
  useEffect(() => {
    if (loading || error || featuredProductCount <= 1) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveFeaturedIndex(
        (current) => (current + 1) % featuredProductCount
      );
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [
    loading,
    error,
    featuredProductCount,
    activeFeaturedIndex,
  ]);

  // Loading State
  if (loading) {
    return (
      <main
        className="min-h-screen bg-[#f7f8fa]"
        aria-busy="true"
        aria-label="Loading products"
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {/* Heading Skeleton */}
            <div className="mb-6 space-y-3">
              <div className="h-3 w-32 rounded-full bg-slate-200" />
              <div className="h-8 w-72 max-w-full rounded-lg bg-slate-200" />
              <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
            </div>

            {/* Hero Skeleton */}
            <motion.div
              animate={{ opacity: [0.65, 1, 0.65] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mb-10 grid min-h-[280px] overflow-hidden rounded-[2rem] bg-white shadow-sm lg:min-h-[360px] lg:grid-cols-2"
            >
              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
                <div className="h-3 w-36 rounded-full bg-slate-200" />
                <div className="mt-5 h-10 max-w-md rounded-xl bg-slate-200" />
                <div className="mt-4 h-4 max-w-sm rounded bg-slate-100" />
                <div className="mt-2 h-4 w-4/5 max-w-sm rounded bg-slate-100" />
                <div className="mt-7 h-10 w-40 rounded-full bg-slate-200" />
              </div>

              <div className="min-h-[200px] bg-slate-100 lg:min-h-0" />
            </motion.div>

            {/* Collection Heading Skeleton */}
            <div className="mb-6 space-y-3">
              <div className="h-3 w-32 rounded-full bg-slate-200" />
              <div className="h-8 w-80 max-w-full rounded-lg bg-slate-200" />
              <div className="h-4 w-96 max-w-full rounded bg-slate-100" />
            </div>

            {/* Product Carousel Skeleton */}
            <div className="flex gap-5 overflow-hidden">
              {Array.from({ length: 4 }, (_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index * 0.06, 0.24),
                    ease: "easeOut",
                  }}
                  className="min-w-0 flex-1"
                >
                  <motion.div
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="aspect-square rounded-xl bg-slate-100" />
                    <div className="mt-5 h-4 w-4/5 rounded bg-slate-200" />
                    <div className="mt-3 h-4 w-2/5 rounded bg-slate-100" />
                    <div className="mt-5 h-9 rounded-xl bg-slate-100" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // Error State
  if (error) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-[#f7f8fa] px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          role="alert"
          className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm"
        >
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-xl text-red-500">
            !
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Unable to load products
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-500">
            {error}
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-[1440px] px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#101827] shadow-xl shadow-slate-900/10 lg:rounded-[2rem]"
        >
          {/* Background Effects */}
          <motion.div
            aria-hidden="true"
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -right-28 -top-32 -z-10 size-[340px] rounded-full bg-blue-500/20 blur-[90px] sm:size-[400px]"
          />

          <motion.div
            aria-hidden="true"
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -bottom-36 right-1/4 -z-10 size-[280px] rounded-full bg-cyan-400/15 blur-[90px] sm:size-[340px]"
          />

          <div className="grid lg:grid-cols-2">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.1,
                ease: "easeOut",
              }}
              className="relative z-10 flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-8 lg:px-8 lg:py-4 xl:px-10"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-7 bg-cyan-400" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300 sm:text-xs">
                  The modern tech destination
                </span>
              </div>

              <h1 className="max-w-xl text-[2rem] font-semibold leading-[1.05] tracking-[-0.055em] text-white sm:text-4xl xl:text-[2.4rem]">
                Better tech.
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  Better everyday.
                </span>
              </h1>

              <p className="mt-2 max-w-lg text-xs leading-5 text-slate-300 sm:text-sm sm:leading-5">
                Discover thoughtfully selected electronics that bring
                together performance, design, and the way you live.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <motion.a
                  href="#products"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="group inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-black/10 transition-colors hover:bg-cyan-200"
                >
                  Explore collection

                  <motion.span
                    aria-hidden="true"
                    className="inline-block"
                    whileHover={{ x: 4 }}
                  >
                    →
                  </motion.span>
                </motion.a>

                <motion.a
                  href="#products"
                  whileHover={{ x: 3 }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
                >
                  Discover what&apos;s here
                  <span aria-hidden="true">↘</span>
                </motion.a>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-3">
                <div>
                  <p className="text-lg font-semibold text-white">
                    {products.length.toString().padStart(2, "0")}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Latest products
                  </p>
                </div>

                <div className="h-8 w-px bg-white/10" />

                <div>
                  <p className="text-sm font-medium text-white">
                    Made for everyday
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Technology that fits your life
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Featured Product Carousel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: "easeOut",
              }}
              className="relative h-[260px] overflow-hidden sm:h-[300px] lg:h-[330px]"
            >
              {/* Decorative Rings */}
              <motion.div
                aria-hidden="true"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 100,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute left-1/2 top-1/2 aspect-square w-[85%] max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08] bg-white/[0.025]"
              />

              <motion.div
                aria-hidden="true"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 120,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute left-1/2 top-1/2 aspect-square w-[62%] max-w-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.09]"
              />

              <motion.div
                aria-hidden="true"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 top-1/2 aspect-square w-[42%] max-w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl"
              />

              {/* Clickable Featured Product */}
              {activeFeaturedProduct ? (
                <div className="absolute inset-4 sm:inset-7 lg:inset-9">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeFeaturedProduct.id}
                      initial={{ opacity: 0, x: 55, scale: 0.97 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -55, scale: 0.97 }}
                      transition={{
                        duration: 0.4,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0"
                    >
                      <Link
                        href={`/products/${activeFeaturedProduct.slug}`}
                        aria-label={`View ${activeFeaturedProduct.name}`}
                        className="absolute inset-0 block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                      >
                        <motion.div
                          className="absolute inset-0"
                          whileHover={{ scale: 1.035 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Image
                            src={activeFeaturedProduct.images[0].url}
                            alt={activeFeaturedProduct.name}
                            fill
                            sizes="(max-width: 1023px) 90vw, 45vw"
                            priority={safeFeaturedIndex === 0}
                            className="object-contain p-3 drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)] sm:p-5"
                          />
                        </motion.div>

                        <div className="absolute bottom-3 left-1/2 z-10 w-max max-w-[75%] -translate-x-1/2 rounded-xl border border-white/10 bg-slate-950/75 px-4 py-2.5 text-center shadow-lg backdrop-blur-xl transition-colors hover:border-cyan-300/40 sm:bottom-4 sm:px-5">
                          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-cyan-300">
                            Featured product
                          </p>

                          <p className="mt-1 truncate text-xs font-semibold text-white sm:text-sm">
                            {activeFeaturedProduct.name}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                /* Fallback when no product images are available */
                <motion.div
                  aria-hidden="true"
                  animate={{
                    y: [0, -5, 0],
                    rotate: [-8, -5, -8],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-1/2 top-1/2 h-52 w-36 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/40 bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 p-2 shadow-[0_25px_60px_rgba(0,0,0,0.4)] sm:h-64 sm:w-44"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-slate-950">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-300 via-blue-700 to-indigo-950" />

                    <div className="absolute -right-10 top-12 size-32 rounded-full bg-white/20 blur-3xl" />

                    <div className="absolute left-1/2 top-3 h-4 w-16 -translate-x-1/2 rounded-full bg-slate-950/90" />

                    <div className="absolute bottom-6 left-5 right-5">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/70">
                        Explore possibilities
                      </p>

                      <div className="mt-3 h-1 w-16 rounded-full bg-white/80" />
                      <div className="mt-2 h-1 w-10 rounded-full bg-white/30" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Featured Carousel Indicators */}
              {featuredProductCount > 1 && (
                <div className="absolute bottom-3 right-4 z-20 flex items-center gap-2 sm:bottom-5 sm:right-6">
                  {featuredProducts.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      aria-label={`Show product ${index + 1}: ${product.name}`}
                      aria-pressed={index === safeFeaturedIndex}
                      onClick={() => setActiveFeaturedIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 ${
                        index === safeFeaturedIndex
                          ? "w-6 bg-cyan-300"
                          : "w-2 bg-white/40 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Welcome Message */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: [0, -4, 0],
                }}
                transition={{
                  opacity: { duration: 0.4, delay: 0.3 },
                  x: { duration: 0.4, delay: 0.3 },
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="absolute right-3 top-4 z-20 rounded-xl border border-white/10 bg-slate-950/75 px-3 py-2.5 shadow-lg backdrop-blur-xl sm:right-6 sm:top-6 sm:px-4"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-300/15 text-lg text-cyan-200">
                    ✨
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-white sm:text-sm">
                      Welcome ~~~
                    </p>

                    <p className="mt-1 text-[9px] text-slate-300 sm:text-[10px]">
                      Find tech for everyday life
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Product Collection */}
        <motion.section
          id="products"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="scroll-mt-6 pt-4 sm:pt-8"
        >
          {/* Collection Heading */}
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-cyan-500" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-[10px]">
                  Carefully selected
                </p>
              </div>

              <h2 className="text-xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-2xl lg:text-3xl">
                Find your next favorite.
              </h2>

              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
                Explore our latest products for work, entertainment, and
                everyday life.
              </p>
            </div>

            {/* View All and Carousel Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Link
                href="/products"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                View All Products

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
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </Link>

              {products.length > 1 && (
                <div className="flex items-center gap-2">
                  {/* Previous Products */}
                  <button
                    type="button"
                    onClick={() => scrollProducts(-1)}
                    disabled={!canScrollProductsLeft}
                    aria-label="Previous products"
                    className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5"
                      aria-hidden="true"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>

                  {/* Next Products */}
                  <button
                    type="button"
                    onClick={() => scrollProducts(1)}
                    disabled={!canScrollProductsRight}
                    aria-label="Next products"
                    className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5"
                      aria-hidden="true"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Carousel */}
          {products.length > 0 ? (
            <div
              ref={productsScrollerRef}
              onScroll={updateProductScrollButtons}
              aria-label="Latest products"
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {products.map((product, index) => {
                const priceVariant = getLowestPriceVariant(product);

                return (
                  <motion.div
                    key={product.id}
                    data-product-slide
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(index * 0.04, 0.2),
                      ease: "easeOut",
                    }}
                    whileHover={{ y: -4 }}
                    className="min-w-0 basis-[86%] shrink-0 snap-start sm:basis-[calc(50%_-_0.625rem)] lg:basis-[calc(33.333%_-_0.833rem)] xl:basis-[calc(25%_-_0.9375rem)]"
                  >
                    <ProductCard
                      name={product.name}
                      price={priceVariant?.price ?? "0"}
                      salePrice={priceVariant?.salePrice ?? null}
                      image={product.images[0]?.url}
                      slug={product.slug}
                      priority={index === 0}
                    />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center sm:py-16"
            >
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500">
                ✳
              </div>

              <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                Something great is on the way.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Our collection is getting ready. Check back soon to explore
                the products available in Electroshop.
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* Bottom Spacing */}
        <div className="h-6 sm:h-10" />
      </div>
    </main>
  );
}
