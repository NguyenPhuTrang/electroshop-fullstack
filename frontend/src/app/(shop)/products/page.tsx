
"use client";

import { useEffect, useState } from "react";

import ProductCard from "@/src/features/product/components/ProductCard";
import type { ProductSort } from "@/src/features/product/services/product.service";
import { useProducts } from "@/src/features/product/hooks/useProducts";

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

export default function ProductsPage() {
  // Search and Filter States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [sort, setSort] = useState<ProductSort | "">("");
  const [page, setPage] = useState(1);

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
    priceRangeError =
      "Minimum price must be a valid non-negative number.";
  } else if (
    maxPriceValue !== undefined &&
    (!Number.isFinite(maxPriceValue) || maxPriceValue < 0)
  ) {
    priceRangeError =
      "Maximum price must be a valid non-negative number.";
  } else if (
    minPriceValue !== undefined &&
    maxPriceValue !== undefined &&
    minPriceValue > maxPriceValue
  ) {
    priceRangeError =
      "Minimum price cannot be greater than maximum price.";
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

  const isSearchPending = search.trim() !== debouncedSearch;
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

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-[1440px] px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">

        {/* Page Heading */}
        <section className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan-500" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:text-xs">
              Explore our collection
            </p>
          </div>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                All Products
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Discover electronics for work, entertainment, and
                everyday life.
              </p>
            </div>
          </div>
        </section>

        {/* Top Row: Search and Sort */}
        <section
          aria-label="Search and sort products"
          className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_240px] sm:items-end sm:p-5"
        >
          {/* Search */}
          <div>
            <label
              htmlFor="product-search"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Search products
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
                <path
                  d="m16 16 4 4"
                  strokeLinecap="round"
                />
              </svg>

              <input
                id="product-search"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by product name..."
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
              Sort by
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
              <option value="">Default order</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </section>

        {/* Main Layout: Filters Left, Products Right */}
        <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">

          {/* Left Sidebar: Filters */}
            <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
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
                        <path d="M4 7h16M7 12h10m-7 5h4" strokeLinecap="round" />
                      </svg>
                    </span>

                    <h2 className="text-base font-semibold text-slate-900">Filters</h2>

                    {hasActiveFilters && (
                      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                        {[categoryId, brandId, minPrice, maxPrice].filter(Boolean).length}
                      </span>
                    )}
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Category */}
                  <div className="min-w-0">
                    <label
                      htmlFor="product-category-filter"
                      className="mb-1.5 block text-xs font-medium text-slate-600"
                    >
                      Category
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
                        <option value="">All categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
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
                        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Brand */}
                  <div className="min-w-0">
                    <label
                      htmlFor="product-brand-filter"
                      className="mb-1.5 block text-xs font-medium text-slate-600"
                    >
                      Brand
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
                        <option value="">All brands</option>
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
                        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Price range */}
                  <div className="border-t border-slate-100 pt-4">
                    <p className="mb-1.5 text-xs font-medium text-slate-600">Price range</p>

                    <div className="flex items-center gap-2">
                      <div className="relative min-w-0 flex-1">
                        <label htmlFor="product-min-price" className="sr-only">
                          Minimum price
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
                          placeholder="Min"
                          className={`${inputClassName} pl-12 ${
                            priceRangeError && minPrice
                              ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500/10"
                              : ""
                          }`}
                        />
                      </div>

                      <span aria-hidden="true" className="text-slate-300">–</span>

                      <div className="relative min-w-0 flex-1">
                        <label htmlFor="product-max-price" className="sr-only">
                          Maximum price
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
                          placeholder="Max"
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
                  <p
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
                      <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                    </svg>
                    <span>{priceRangeError}</span>
                  </p>
                )}
              </aside>

          {/* Right Side: Product Results */}
          <div className="min-w-0">
            <section
              aria-label="Product results"
              aria-busy={isLoading}
            >
              {/* Results Heading */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  {debouncedSearch
                    ? "Search Results"
                    : "Explore Products"}
                </h2>

                {!isLoading &&
                  !error &&
                  !priceRangeError &&
                  products.length > 0 && (
                    <p className="text-xs text-slate-500">
                      {products.length}{" "}
                      {products.length === 1 ? "product" : "products"}
                      {" · "}
                      Page {page} of {pagination.totalPages}
                    </p>
                  )}
              </div>

              {/* Invalid Price Range */}
              {priceRangeError ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-10 text-center">
                  <h3 className="text-base font-semibold text-slate-900">
                    Check your price range
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    Correct the price filters above to see matching
                    products.
                  </p>
                </div>
              ) : isLoading ? (
                /* Loading Skeleton */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                      <div className="aspect-[4/3] bg-slate-100" />

                      <div className="space-y-3 p-4">
                        <div className="h-4 w-4/5 rounded bg-slate-100" />
                        <div className="h-4 w-2/5 rounded bg-slate-100" />
                        <div className="mt-4 h-9 rounded-xl bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                /* Error State */
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-white px-5 py-12 text-center"
                >
                  <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-50 text-xl font-semibold text-red-500">
                    !
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    Unable to load products
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {error}
                  </p>
                </div>
              ) : products.length === 0 ? (
                /* Empty State */
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center sm:py-16">
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
                      <path
                        d="m16 16 4 4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    No products found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Try a different keyword or adjust your filters to find
                    what you are looking for.
                  </p>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                /* Product Grid */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="min-w-0"
                    >
                      <ProductCard
                        name={product.name}
                        price={product.price}
                        salePrice={product.salePrice}
                        image={product.images?.[0]?.url}
                        slug={product.slug}
                        priority={page === 1 && index < 3}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Pagination */}
            {!isLoading &&
              !error &&
              !priceRangeError &&
              products.length > 0 &&
              pagination.totalPages > 1 && (
                <nav
                  aria-label="Product pagination"
                  className="mt-7 flex flex-wrap items-center justify-center gap-1.5 border-t border-slate-200 pt-5"
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    aria-label="Previous page"
                    className="flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span aria-hidden="true">←</span>
                    <span className="ml-1.5">Previous</span>
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
                        aria-label={`Go to page ${pageNumber}`}
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
                    aria-label="Next page"
                    className="flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="mr-1.5">Next</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </nav>
              )}
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-6 sm:h-10" />
      </div>
    </main>
  );
}
