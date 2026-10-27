"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import ProductCard from "@/src/features/product/components/ProductCard";
import type { ProductSort } from "@/src/features/product/services/product.service";
import { useProducts } from "@/src/features/product/hooks/useProducts";
import type {
  Product,
  ProductVariant,
} from "@/src/features/product/types/product";

import { useCategories } from "@/src/features/category/hooks/useCategories";
import useBrands from "@/src/features/brand/hooks/useBrands";

type PaginationItem = number | "ellipsis";

function getVisiblePages(
  currentPage: number,
  totalPages: number
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

const inputClassName =
  "h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-800 focus:ring-4 focus:ring-slate-900/5";

// Same grid for the skeleton and the real results: 2 / 3 columns.
const productGridClassName =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:gap-5";

function getLowestPriceVariant(
  product: Product
): ProductVariant | null {
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
}

function getPrimaryProductImage(
  product: Product
): string | undefined {
  return product.images?.find(
    (image) => image.isPrimary
  )?.url;
}

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

function ProductsPageLoadingSkeleton() {
  const t = useTranslations("ProductsPage");

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-[1440px] px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          aria-busy="true"
          aria-label={t("loading.page")}
        >
          {/* Heading Skeleton */}
          <div className="mb-6">
            <LoadingBar className="h-3 w-32 rounded-full bg-slate-200" />

            <LoadingBar
              className="mt-4 h-9 w-72 max-w-full rounded-lg bg-slate-200"
              delay={0.1}
            />

            <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-100" />
          </div>

          {/* Search and Sort Skeleton */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
            className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_240px] sm:items-end sm:p-5"
          >
            <div>
              <LoadingBar className="mb-3 h-4 w-32 rounded bg-slate-200" />
              <LoadingBar className="h-11 w-full rounded-xl bg-slate-100" />
            </div>

            <div>
              <LoadingBar className="mb-3 h-4 w-16 rounded bg-slate-200" />
              <LoadingBar className="h-10 w-full rounded-xl bg-slate-100" />
            </div>
          </motion.section>

          {/* Filters and Product Results Skeleton */}
          <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
            {/* Filters Skeleton (desktop only: on mobile filters live in a drawer) */}
            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
              className="hidden min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:block"
            >
              <div className="mb-6 flex items-center gap-3">
                <LoadingBar className="size-8 rounded-lg bg-slate-100" />
                <LoadingBar className="h-5 w-24 rounded bg-slate-200" />
              </div>

              <div className="space-y-6">
                {[0, 1, 2].map((item) => (
                  <div key={item}>
                    <LoadingBar
                      className="mb-2 h-3 w-20 rounded bg-slate-200"
                      delay={item * 0.08}
                    />

                    <LoadingBar
                      className="h-10 w-full rounded-xl bg-slate-100"
                      delay={item * 0.08 + 0.1}
                    />
                  </div>
                ))}

                <div className="flex gap-3 border-t border-slate-100 pt-4">
                  <LoadingBar className="h-10 min-w-0 flex-1 rounded-xl bg-slate-100" />
                  <LoadingBar className="h-10 min-w-0 flex-1 rounded-xl bg-slate-100" />
                </div>
              </div>
            </motion.aside>

            {/* Product Grid Skeleton */}
            <section className="min-w-0">
              <div className="mb-4 flex items-center justify-between gap-4">
                <LoadingBar className="h-6 w-44 rounded-lg bg-slate-200" />
                <LoadingBar className="h-4 w-24 rounded bg-slate-100" />
              </div>

              <div className={productGridClassName}>
                {Array.from({ length: 6 }, (_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.15 + index * 0.06,
                      ease: "easeOut",
                    }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"
                  >
                    <LoadingBar
                      className="aspect-[4/3] rounded-xl bg-slate-100"
                      delay={index * 0.08}
                    />

                    <div className="mt-5 h-4 w-4/5 rounded bg-slate-100" />
                    <div className="mt-3 h-4 w-2/5 rounded bg-slate-100" />
                    <div className="mt-5 h-10 rounded-xl bg-slate-100" />
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  const t = useTranslations("ProductsPage");

  // Search and Filter States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [sort, setSort] = useState<ProductSort | "">("");
  const [page, setPage] = useState(1);

  // Mobile filter drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Initial loading animation
  const [minimumLoadingTimeElapsed, setMinimumLoadingTimeElapsed] =
    useState(false);
  const [hasInitialLoadFinished, setHasInitialLoadFinished] =
    useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMinimumLoadingTimeElapsed(true);
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, []);

  // Drawer: close with Esc, lock page scroll while open,
  // and close automatically when the screen grows to desktop size.
  useEffect(() => {
    if (!isFilterOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFilterOpen(false);
    };

    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsFilterOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    desktopQuery.addEventListener("change", handleDesktopChange);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      desktopQuery.removeEventListener("change", handleDesktopChange);
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  // Load Categories and Brands
  const { categories } = useCategories();
  const { brands } = useBrands();

  // Debounce Search
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  // Parse Price Filters
  const minPriceValue =
    minPrice.trim() !== "" ? Number(minPrice) : undefined;

  const maxPriceValue =
    maxPrice.trim() !== "" ? Number(maxPrice) : undefined;

  // Validate Price Filters
  let priceRangeError = "";

  if (
    minPriceValue !== undefined &&
    (!Number.isFinite(minPriceValue) || minPriceValue < 0)
  ) {
    priceRangeError = t("errors.invalidMinimumPrice");
  } else if (
    maxPriceValue !== undefined &&
    (!Number.isFinite(maxPriceValue) || maxPriceValue < 0)
  ) {
    priceRangeError = t("errors.invalidMaximumPrice");
  } else if (
    minPriceValue !== undefined &&
    maxPriceValue !== undefined &&
    minPriceValue > maxPriceValue
  ) {
    priceRangeError = t("errors.minimumGreaterThanMaximum");
  }

  // Fetch Products
  const {
    products,
    pagination,
    loading,
    error,
  } = useProducts({
    search: debouncedSearch || undefined,
    sort: sort || undefined,

    categoryId: categoryId
      ? Number(categoryId)
      : undefined,

    brandId: brandId
      ? Number(brandId)
      : undefined,

    minPrice: priceRangeError
      ? undefined
      : minPriceValue,

    maxPrice: priceRangeError
      ? undefined
      : maxPriceValue,

    page,
    limit: 12,
  });

  // Active Filters
  const hasActiveFilters = Boolean(
    search.trim() ||
      categoryId ||
      brandId ||
      minPrice ||
      maxPrice ||
      sort
  );

  // Only the filters inside the filter panel (not search or sort).
  const activeFilterCount = [
    categoryId,
    brandId,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  const isSearchPending = search.trim() !== debouncedSearch;

  // Complete initial loading only after the API and minimum duration finish.
  useEffect(() => {
    if (
      minimumLoadingTimeElapsed &&
      !loading &&
      !isSearchPending
    ) {
      setHasInitialLoadFinished(true);
    }
  }, [
    minimumLoadingTimeElapsed,
    loading,
    isSearchPending,
  ]);

  // Subsequent searches and filter changes only load the result grid.
  const isLoading = loading || isSearchPending;

  const visiblePages = getVisiblePages(
    page,
    pagination.totalPages
  );

  // Clear All Filters
  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");

    setCategoryId("");
    setBrandId("");

    setMinPrice("");
    setMaxPrice("");

    setSort("");
    setPage(1);
  };

  // Full-page skeleton is only used during the initial load.
  if (!hasInitialLoadFinished && !error) {
    return <ProductsPageLoadingSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-[1440px] px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
        {/* Page Heading */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan-500" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:text-xs">
              {t("heading.eyebrow")}
            </p>
          </div>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                {t("heading.title")}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {t("heading.description")}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Top Row: Search and Sort */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          aria-label={t("searchSort.ariaLabel")}
          className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_240px] sm:items-end sm:p-5"
        >
          {/* Search */}
          <div>
            <label
              htmlFor="product-search"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              {t("searchSort.searchLabel")}
            </label>

            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" strokeLinecap="round" />
              </svg>

              <input
                id="product-search"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={t("searchSort.searchPlaceholder")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-800 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label
              htmlFor="product-sort"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              {t("searchSort.sortLabel")}
            </label>

            <select
              id="product-sort"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as ProductSort | "");
                setPage(1);
              }}
              className={inputClassName}
            >
              <option value="">{t("sort.default")}</option>
              <option value="newest">{t("sort.newest")}</option>
              <option value="price_asc">{t("sort.priceAscending")}</option>
              <option value="price_desc">{t("sort.priceDescending")}</option>
            </select>
          </div>
        </motion.section>

        {/* Main Layout: Filters Left, Products Right */}
        <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          {/* Backdrop behind the mobile filter drawer */}
          {isFilterOpen && (
            <div
              aria-hidden="true"
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 z-[55] bg-slate-900/40 lg:hidden"
            />
          )}

          {/* Filters: slide-in drawer on mobile, fixed sidebar on desktop */}
          <aside
            className={`fixed inset-y-0 left-0 z-[60] w-[88%] min-w-0 max-w-sm overflow-y-auto bg-white p-4 shadow-xl transition-transform duration-300 sm:p-5 ${
              isFilterOpen ? "translate-x-0" : "-translate-x-full"
            } lg:static lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0 lg:overflow-visible lg:rounded-2xl lg:border lg:border-slate-200 lg:shadow-sm`}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="size-4 text-slate-700"
                  >
                    <path
                      d="M4 7h16M7 12h10m-7 5h4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                <h2 className="text-base font-semibold text-slate-900">
                  {t("filters.title")}
                </h2>

                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    {t("filters.clearAll")}
                  </button>
                )}

                {/* Close button (mobile drawer only) */}
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  aria-label={t("filters.close")}
                  className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 lg:hidden"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    className="size-5"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div className="min-w-0">
                <label
                  htmlFor="product-category-filter"
                  className="mb-1.5 block text-xs font-medium text-slate-600"
                >
                  {t("filters.category")}
                </label>

                <div className="relative">
                  <select
                    id="product-category-filter"
                    value={categoryId}
                    onChange={(event) => {
                      setCategoryId(event.target.value);
                      setPage(1);
                    }}
                    className={`${inputClassName} appearance-none pr-9`}
                  >
                    <option value="">{t("filters.allCategories")}</option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  >
                    <path
                      d="m6 9 6 6 6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Brand */}
              <div className="min-w-0">
                <label
                  htmlFor="product-brand-filter"
                  className="mb-1.5 block text-xs font-medium text-slate-600"
                >
                  {t("filters.brand")}
                </label>

                <div className="relative">
                  <select
                    id="product-brand-filter"
                    value={brandId}
                    onChange={(event) => {
                      setBrandId(event.target.value);
                      setPage(1);
                    }}
                    className={`${inputClassName} appearance-none pr-9`}
                  >
                    <option value="">{t("filters.allBrands")}</option>

                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>

                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  >
                    <path
                      d="m6 9 6 6 6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Price Range */}
              <div className="border-t border-slate-100 pt-4">
                <p className="mb-1.5 text-xs font-medium text-slate-600">
                  {t("filters.priceRange")}
                </p>

                <div className="flex items-center gap-2">
                  <div className="relative min-w-0 flex-1">
                    <label
                      htmlFor="product-min-price"
                      className="sr-only"
                    >
                      {t("filters.minimumPrice")}
                    </label>

                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      VND
                    </span>

                    <input
                      id="product-min-price"
                      type="number"
                      min="0"
                      step="any"
                      value={minPrice}
                      onChange={(event) => {
                        setMinPrice(event.target.value);
                        setPage(1);
                      }}
                      placeholder={t("filters.minimumPlaceholder")}
                      className={`${inputClassName} pl-12 ${
                        priceRangeError && minPrice
                          ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500/10"
                          : ""
                      }`}
                    />
                  </div>

                  <span
                    aria-hidden="true"
                    className="text-slate-300"
                  >
                    –
                  </span>

                  <div className="relative min-w-0 flex-1">
                    <label
                      htmlFor="product-max-price"
                      className="sr-only"
                    >
                      {t("filters.maximumPrice")}
                    </label>

                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      VND
                    </span>

                    <input
                      id="product-max-price"
                      type="number"
                      min="0"
                      step="any"
                      value={maxPrice}
                      onChange={(event) => {
                        setMaxPrice(event.target.value);
                        setPage(1);
                      }}
                      placeholder={t("filters.maximumPlaceholder")}
                      className={`${inputClassName} pl-12 ${
                        priceRangeError && maxPrice
                          ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500/10"
                          : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Price Validation Message */}
            {priceRangeError && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mt-0.5 size-4 shrink-0"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    d="M12 8v4m0 4h.01"
                    strokeLinecap="round"
                  />
                </svg>

                <span>{priceRangeError}</span>
              </motion.p>
            )}

            {/* Show results (mobile drawer only) */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="mt-5 h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-700 lg:hidden"
            >
              {t("filters.showResults")}
            </button>
          </aside>

          {/* Right Side: Product Results */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="min-w-0"
            aria-label={t("results.ariaLabel")}
            aria-busy={isLoading}
          >
            {/* Results Heading */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                {debouncedSearch
                  ? t("results.searchTitle")
                  : t("results.exploreTitle")}
              </h2>

              {/* Open filter drawer (mobile/tablet only) */}
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                aria-expanded={isFilterOpen}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 lg:hidden"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="size-4"
                >
                  <path d="M4 7h16M7 12h10m-7 5h4" strokeLinecap="round" />
                </svg>

                {t("filters.title")}

                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {!isLoading &&
                !error &&
                !priceRangeError &&
                products.length > 0 && (
                  <p className="w-full text-xs text-slate-500 lg:w-auto">
                    {t("results.summary", {
                      count: products.length,
                      page,
                      totalPages: pagination.totalPages,
                    })}
                  </p>
                )}
            </div>

            {/* Invalid Price Range */}
            {priceRangeError ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-10 text-center"
              >
                <h3 className="text-base font-semibold text-slate-900">
                  {t("priceError.title")}
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  {t("priceError.description")}
                </p>
              </motion.div>
            ) : isLoading ? (
              /* Result Loading Skeleton */
              <div className={productGridClassName}>
                {Array.from({ length: 6 }, (_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.15 + index * 0.06,
                      ease: "easeOut",
                    }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"
                  >
                    <LoadingBar
                      className="aspect-[4/3] rounded-xl bg-slate-100"
                      delay={index * 0.08}
                    />

                    <div className="mt-5 h-4 w-4/5 rounded bg-slate-100" />
                    <div className="mt-3 h-4 w-2/5 rounded bg-slate-100" />
                    <div className="mt-5 h-10 rounded-xl bg-slate-100" />
                  </motion.div>
                ))}
              </div>
            ) : error ? (
              /* Error State */
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                role="alert"
                className="rounded-2xl border border-red-200 bg-white px-5 py-12 text-center"
              >
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-50 text-xl font-semibold text-red-500">
                  !
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {t("errorState.title")}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {error}
                </p>
              </motion.div>
            ) : products.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center sm:py-16"
              >
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="size-7"
                  >
                    <circle cx="10.5" cy="10.5" r="6.5" />
                    <path d="m16 16 4 4" strokeLinecap="round" />
                  </svg>
                </div>

                <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                  {t("empty.title")}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {t("empty.description")}
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    {t("filters.clearAll")}
                  </button>
                )}
              </motion.div>
            ) : (
              /* Product Grid */
              <div className={productGridClassName}>
                {products.map((product, index) => {
                  const priceVariant = getLowestPriceVariant(product);

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(index * 0.06, 0.36),
                        ease: "easeOut",
                      }}
                      whileHover={{ y: -5 }}
                      className="min-w-0"
                    >
                      <ProductCard
                        name={product.name}
                        price={priceVariant?.price ?? "0"}
                        salePrice={priceVariant?.salePrice ?? null}
                        image={getPrimaryProductImage(product)}
                        slug={product.slug}
                        priority={page === 1 && index < 3}
                      />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>
        </div>

        {/* Pagination */}
        {!isLoading &&
          !error &&
          !priceRangeError &&
          products.length > 0 &&
          pagination.totalPages > 1 && (
            <motion.nav
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12, ease: "easeOut" }}
              aria-label={t("pagination.ariaLabel")}
              className="mt-7 flex flex-wrap items-center justify-center gap-1.5 border-t border-slate-200 pt-5"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                aria-label={t("pagination.previousAriaLabel")}
                className="flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span aria-hidden="true">←</span>
                <span className="ml-1.5">{t("pagination.previous")}</span>
              </button>

              {visiblePages.map((pageNumber, index) =>
                pageNumber === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    aria-hidden="true"
                    className="flex h-9 w-6 items-center justify-center text-sm text-slate-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    aria-label={t("pagination.goToPage", {
                      page: pageNumber,
                    })}
                    aria-current={
                      page === pageNumber ? "page" : undefined
                    }
                    className={`flex size-9 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                      page === pageNumber
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(pagination.totalPages, current + 1)
                  )
                }
                aria-label={t("pagination.nextAriaLabel")}
                className="flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="mr-1.5">{t("pagination.next")}</span>
                <span aria-hidden="true">→</span>
              </button>
            </motion.nav>
          )}
      </div>

      {/* Bottom Spacing */}
      <div className="h-6 sm:h-10" />
    </main>
  );
}