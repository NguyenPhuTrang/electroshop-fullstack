"use client";

import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import AdminProductModal from "@/src/features/product/components/AdminProductModal";

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

// Shortcuts to the product sub-pages (video, images, variants, specifications).
const MANAGE_LINKS: {
  path: string;
  labelKey: string;
  ariaKey: string;
  titleKey: string;
  icon: ReactNode;
}[] = [
  {
    path: "video",
    labelKey: "video",
    ariaKey: "manageVideoAria",
    titleKey: "manageVideoTitle",
    icon: (
      <>
        <rect x="3" y="5" width="13" height="14" rx="2" />
        <path d="m16 10 5-3v10l-5-3" />
      </>
    ),
  },
  {
    path: "images",
    labelKey: "images",
    ariaKey: "manageImagesAria",
    titleKey: "manageImagesTitle",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),
  },
  {
    path: "variants",
    labelKey: "variants",
    ariaKey: "manageVariantsAria",
    titleKey: "manageVariantsTitle",
    icon: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </>
    ),
  },
  {
    path: "specifications",
    labelKey: "specifications",
    ariaKey: "manageSpecificationsAria",
    titleKey: "manageSpecificationsTitle",
    icon: (
      <>
        <path d="M8 4h13M8 12h13M8 20h13" />
        <path d="M3 4h.01M3 12h.01M3 20h.01" />
      </>
    ),
  },
];

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

  const hasLowStockVariant = activeVariants.length > 0 && stock <= 10;

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
  const searchParams = useSearchParams();
  const t = useTranslations("AdminProductsPage");
  const locale = useLocale();

  const lowStock = searchParams.get("lowStock") === "true";

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [sort, setSort] = useState<ProductSort | "">("");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Add / Edit Product Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(
    null
  );

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

  const formatPrice = (value: number) =>
    `${new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(value)} ₫`;

  // Open Create Product Modal
  const openCreateProduct = () => {
    if (deletingId !== null) return;

    setEditingProductId(null);
    setProductModalOpen(true);
  };

  // Open Edit Product Modal
  const openEditProduct = (id: number) => {
    if (deletingId !== null) return;

    setEditingProductId(id);
    setProductModalOpen(true);
  };

  // Close Modal
  const closeProductModal = () => {
    setProductModalOpen(false);
    setEditingProductId(null);
  };

  // After creating a product, continue to its edit form in the same modal.
  const handleProductCreated = async (id: number) => {
    setEditingProductId(id);

    try {
      await refetch();
    } catch (refreshError) {
      console.error(
        "Failed to refresh products after creation:",
        refreshError
      );

      toast.error(t("toast.refreshFailedAfterSave"));
    }
  };

  // Close the modal and refresh the list after updating.
  const handleProductUpdated = async () => {
    closeProductModal();

    try {
      await refetch();
    } catch (refreshError) {
      console.error(
        "Failed to refresh products after update:",
        refreshError
      );

      toast.error(t("toast.refreshFailedAfterSave"));
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: number) => {
    if (deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(t("confirmDelete"));

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading(t("toast.deleting"));

    setDeletingId(id);

    try {
      await deleteProduct(id);

      toast.success(t("toast.deleted"), {
        id: toastId,
      });
    } catch (error) {
      console.error("Failed to delete product:", error);

      toast.error(t("toast.deleteFailed"), {
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

      toast.error(t("toast.refreshFailedAfterDelete"));
    } finally {
      setDeletingId(null);
    }
  };

  // Everything derived from one product that both the cards and the table show.
  const getProductView = (product: Product) => {
    const summary = getProductVariantSummary(product);
    const { activeVariantCount, stock, hasLowStockVariant } = summary;

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
        ? t("stock.noActiveVariants")
        : stock === 0
          ? t("stock.outOfStock")
          : t("stock.totalUnits", { count: stock });

    const statusStyle =
      product.status === "ACTIVE"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : product.status === "INACTIVE"
          ? "border-slate-200 bg-slate-100 text-slate-600"
          : "border-amber-200 bg-amber-50 text-amber-700";

    const statusLabel =
      product.status === "ACTIVE"
        ? t("statuses.active")
        : product.status === "INACTIVE"
          ? t("statuses.inactive")
          : product.status;

    return { ...summary, stockStyle, stockLabel, statusStyle, statusLabel };
  };

  const renderProductImage = (product: Product) =>
    product.images?.[0]?.url ? (
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
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );

  const renderPrice = (view: ReturnType<typeof getProductView>) =>
    view.lowestPriceVariant && view.lowestSellingPrice !== null ? (
      <div className="flex flex-col items-start gap-1">
        <span className="font-semibold text-blue-700">
          {formatPrice(view.lowestSellingPrice)}
        </span>

        {view.hasDiscount && (
          <span className="text-xs text-slate-400 line-through">
            {formatPrice(Number(view.lowestPriceVariant.price))}
          </span>
        )}
      </div>
    ) : (
      <span className="text-slate-400">
        {t("stock.noActiveVariantPrice")}
      </span>
    );

  const renderBadge = (style: string, label: string) => (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${style}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );

  // Edit + Delete buttons. On cards they split the row and are tall enough to tap.
  const renderPrimaryActions = (product: Product, fullWidth: boolean) => (
    <div
      className={
        fullWidth
          ? "grid grid-cols-2 gap-2"
          : "flex items-center justify-end gap-2"
      }
    >
      <button
        type="button"
        onClick={() => openEditProduct(product.id)}
        disabled={deletingId !== null}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
          fullWidth ? "min-h-10" : "h-9"
        }`}
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

        {t("buttons.edit")}
      </button>

      <button
        type="button"
        onClick={() => void handleDeleteProduct(product.id)}
        disabled={deletingId !== null}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
          fullWidth ? "min-h-10" : "h-9"
        }`}
      >
        {deletingId === product.id ? (
          <>
            <span className="size-3.5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
            {t("buttons.deleting")}
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

            {t("buttons.delete")}
          </>
        )}
      </button>
    </div>
  );

  // Links to video / images / variants / specifications.
  const renderManageLinks = (product: Product, asGrid: boolean) => (
    <div
      className={
        asGrid
          ? "grid grid-cols-2 gap-2"
          : "flex flex-wrap items-center justify-end gap-1"
      }
    >
      {MANAGE_LINKS.map((item) => (
        <Link
          key={item.path}
          href={`/admin/products/${product.id}/${item.path}`}
          aria-label={t(`links.${item.ariaKey}`, { name: product.name })}
          title={t(`links.${item.titleKey}`)}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap bg-slate-50 font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            asGrid
              ? "min-h-9 justify-center rounded-lg border border-slate-200 px-2 text-xs"
              : "h-8 rounded-md px-1.5 text-[10px]"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5 shrink-0"
            aria-hidden="true"
          >
            {item.icon}
          </svg>

          {t(`links.${item.labelKey}`)}
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="space-y-4 sm:space-y-6"
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-6"
        >
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="size-2 rounded-full bg-cyan-500" />

              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                {t("header.eyebrow")}
              </p>
            </div>

            <h1 className="break-words text-xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t("header.title")}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {lowStock
                ? t("header.lowStockDescription")
                : t("header.description")}
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

                {t("header.lowStockBadge")}
              </div>
            )}
          </div>

          {/* Add Product: Open Modal */}
          <button
            type="button"
            onClick={openCreateProduct}
            disabled={deletingId !== null}
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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

            {t("buttons.addProduct")}
          </button>
        </motion.header>

        {/* Filters */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          aria-label={t("filters.ariaLabel")}
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
              {t("filters.title")}
            </h2>
          </div>

          {/* 1 column on phones, 2 on tablets, 4 only when there is room for them */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                placeholder={t("filters.searchPlaceholder")}
                aria-label={t("filters.searchAriaLabel")}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Category: custom dropdown with controlled position and size */}
            <div className="relative min-w-0">
              <button
                type="button"
                aria-label={t("filters.categoryAriaLabel")}
                aria-haspopup="listbox"
                aria-expanded={categoryDropdownOpen}
                onClick={() => {
                  setCategoryDropdownOpen((open) => !open);
                  setBrandDropdownOpen(false);
                  setSortDropdownOpen(false);
                }}
                className={`flex h-11 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left text-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${categoryDropdownOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}
              >
                <span className="min-w-0 truncate text-slate-700">
                  {categories.find((category) => String(category.id) === categoryId)?.name ?? t("filters.allCategories")}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`size-4 shrink-0 text-slate-400 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {categoryDropdownOpen && (
                <>
                  <button type="button" aria-label={t("filters.categoryAriaLabel")} className="fixed inset-0 z-40 cursor-default" onClick={() => setCategoryDropdownOpen(false)} />
                  <div role="listbox" aria-label={t("filters.categoryAriaLabel")} className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/60">
                    {[{ value: "", label: t("filters.allCategories") }, ...categories.map((category) => ({ value: String(category.id), label: category.name }))].map((option) => (
                      <button key={option.value || "all-categories"} type="button" role="option" aria-selected={categoryId === option.value} onClick={() => { setCategoryId(option.value); setPage(1); setCategoryDropdownOpen(false); }} className={`flex min-h-10 w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors ${categoryId === option.value ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}>
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                        {categoryId === option.value && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ml-2 size-4 shrink-0 text-blue-600"><path d="m5 12 4 4L19 6" /></svg>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Brand: custom dropdown with controlled position and size */}
            <div className="relative min-w-0">
              <button
                type="button"
                aria-label={t("filters.brandAriaLabel")}
                aria-haspopup="listbox"
                aria-expanded={brandDropdownOpen}
                onClick={() => {
                  setBrandDropdownOpen((open) => !open);
                  setCategoryDropdownOpen(false);
                  setSortDropdownOpen(false);
                }}
                className={`flex h-11 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left text-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${brandDropdownOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}
              >
                <span className="min-w-0 truncate text-slate-700">
                  {brands.find((brand) => String(brand.id) === brandId)?.name ?? t("filters.allBrands")}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`size-4 shrink-0 text-slate-400 transition-transform ${brandDropdownOpen ? "rotate-180" : ""}`}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {brandDropdownOpen && (
                <>
                  <button type="button" aria-label={t("filters.brandAriaLabel")} className="fixed inset-0 z-40 cursor-default" onClick={() => setBrandDropdownOpen(false)} />
                  <div role="listbox" aria-label={t("filters.brandAriaLabel")} className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/60">
                    {[{ value: "", label: t("filters.allBrands") }, ...brands.map((brand) => ({ value: String(brand.id), label: brand.name }))].map((option) => (
                      <button key={option.value || "all-brands"} type="button" role="option" aria-selected={brandId === option.value} onClick={() => { setBrandId(option.value); setPage(1); setBrandDropdownOpen(false); }} className={`flex min-h-10 w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors ${brandId === option.value ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}>
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                        {brandId === option.value && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ml-2 size-4 shrink-0 text-blue-600"><path d="m5 12 4 4L19 6" /></svg>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sort: custom dropdown for consistent position and sizing */}
            <div className="relative min-w-0">
              <button
                type="button"
                aria-label={t("filters.sortAriaLabel")}
                aria-haspopup="listbox"
                aria-expanded={sortDropdownOpen}
                onClick={() => {
                  setSortDropdownOpen((open) => !open);
                  setCategoryDropdownOpen(false);
                  setBrandDropdownOpen(false);
                }}
                className={`flex h-11 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left text-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  sortDropdownOpen
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : "border-slate-200"
                }`}
              >
                <span className="min-w-0 truncate text-slate-700">
                  {sort === "newest"
                    ? t("sort.newest")
                    : sort === "price_asc"
                      ? t("sort.priceAscending")
                      : sort === "price_desc"
                        ? t("sort.priceDescending")
                        : t("sort.label")}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={`size-4 shrink-0 text-slate-400 transition-transform ${
                    sortDropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {sortDropdownOpen && (
                <>
                  <button
                    type="button"
                    aria-label={t("filters.sortAriaLabel")}
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setSortDropdownOpen(false)}
                  />
                  <div
                    role="listbox"
                    aria-label={t("filters.sortAriaLabel")}
                    className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/60"
                  >
                    {[
                      { value: "", label: t("sort.label") },
                      { value: "newest", label: t("sort.newest") },
                      { value: "price_asc", label: t("sort.priceAscending") },
                      { value: "price_desc", label: t("sort.priceDescending") },
                    ].map((option) => (
                      <button
                        key={option.value || "default"}
                        type="button"
                        role="option"
                        aria-selected={sort === option.value}
                        onClick={() => {
                          setSort(option.value as ProductSort | "");
                          setPage(1);
                          setSortDropdownOpen(false);
                        }}
                        className={`flex min-h-10 w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          sort === option.value
                            ? "bg-blue-50 font-medium text-blue-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="min-w-0 flex-1">{option.label}</span>
                        {sort === option.value && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="ml-2 size-4 shrink-0 text-blue-600"
                          >
                            <path d="m5 12 4 4L19 6" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.section>

        {/* Product List */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          aria-label={t("table.ariaLabel")}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {t("table.title")}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {t("table.description")}
              </p>
            </div>

            {!loading && !error && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                <span className="size-1.5 rounded-full bg-cyan-500" />

                {t("table.productsOnPage", { count: products.length })}
              </span>
            )}
          </div>

          {loading ? (
            <div
              className="space-y-4 p-4 sm:p-6"
              aria-busy="true"
              aria-label={t("loading.products")}
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
                {t("errorState.title")}
              </p>

              <p className="mt-1 max-w-md text-sm leading-6 text-rose-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
              >
                {t("buttons.tryAgain")}
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
                  ? t("empty.lowStockTitle")
                  : t("empty.title")}
              </h3>

              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                {lowStock
                  ? t("empty.lowStockDescription")
                  : t("empty.description")}
              </p>
            </div>
          ) : (
            <>
              {/* Phones and tablets (below 1280px): one card per product,
                  in 1 column on phones and 2 columns on tablets */}
              <ul className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 xl:hidden">
                {products.map((product) => {
                  const view = getProductView(product);

                  return (
                    <li
                      key={product.id}
                      className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start gap-3">
                        {renderProductImage(product)}

                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-semibold leading-5 text-slate-900">
                            {product.name}
                          </p>

                          <p className="mt-1 break-all font-mono text-xs text-slate-500">
                            {product.sku}
                          </p>
                        </div>
                      </div>

                      <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 text-sm">
                        <dt className="text-slate-500">{t("table.brand")}</dt>
                        <dd className="truncate text-right text-slate-700">
                          {product.brand?.name ?? "—"}
                        </dd>

                        <dt className="text-slate-500">
                          {t("table.category")}
                        </dt>
                        <dd className="truncate text-right text-slate-700">
                          {product.category?.name ?? "—"}
                        </dd>

                        <dt className="text-slate-500">{t("table.price")}</dt>
                        <dd className="flex justify-end text-right">
                          {renderPrice(view)}
                        </dd>

                        <dt className="text-slate-500">{t("table.stock")}</dt>
                        <dd className="flex justify-end">
                          {renderBadge(view.stockStyle, view.stockLabel)}
                        </dd>

                        <dt className="text-slate-500">{t("table.status")}</dt>
                        <dd className="flex justify-end">
                          {renderBadge(view.statusStyle, view.statusLabel)}
                        </dd>
                      </dl>

                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          {t("buttons.manage")}
                        </p>

                        {renderManageLinks(product, true)}
                      </div>

                      {renderPrimaryActions(product, true)}
                    </li>
                  );
                })}
              </ul>

              {/* Wide screens (from 1280px): table */}
              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr className="text-left">
                      <th className="px-5 py-4 font-semibold text-slate-600 sm:px-6">
                        {t("table.product")}
                      </th>

                      <th className="px-5 py-4 font-semibold text-slate-600">
                        {t("table.sku")}
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">
                        {t("table.brand")}
                      </th>

                      <th className="px-5 py-4 font-semibold text-slate-600">
                        {t("table.category")}
                      </th>

                      <th className="px-5 py-4 font-semibold text-slate-600">
                        {t("table.price")}
                      </th>

                      <th className="px-5 py-4 font-semibold text-slate-600">
                        {t("table.stock")}
                      </th>

                      <th className="px-5 py-4 font-semibold text-slate-600">
                        {t("table.status")}
                      </th>

                      <th className="px-5 py-4 text-right font-semibold text-slate-600">
                        {t("table.actions")}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {products.map((product, index) => {
                      const view = getProductView(product);

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
                              {renderProductImage(product)}

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
                            {renderPrice(view)}
                          </td>

                          {/* Total stock across active variants */}
                          <td className="whitespace-nowrap px-5 py-4">
                            {renderBadge(view.stockStyle, view.stockLabel)}
                          </td>

                          {/* Product Status */}
                          <td className="whitespace-nowrap px-5 py-4">
                            {renderBadge(view.statusStyle, view.statusLabel)}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex min-w-[280px] flex-col items-end gap-2.5">
                              {renderPrimaryActions(product, false)}

                              <div className="flex flex-wrap items-center justify-end gap-1 border-t border-slate-100 pt-2">
                                <span className="mr-0.5 shrink-0 whitespace-nowrap text-[10px] font-semibold uppercase tracking-normal text-slate-400">
                                  {t("buttons.manage")}:
                                </span>

                                {renderManageLinks(product, false)}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.section>

        {/* Pagination */}
        {products.length > 0 && !loading && !error && (
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
            <p className="text-center text-sm text-slate-500 sm:text-left">
              {t("pagination.page")}{" "}
              <span className="font-semibold text-slate-900">
                {pagination.page}
              </span>{" "}
              {t("pagination.of")}{" "}
              <span className="font-semibold text-slate-900">
                {pagination.totalPages}
              </span>
            </p>

            <div className="grid grid-cols-2 items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() =>
                  setPage((prev) => Math.max(1, prev - 1))
                }
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

                {t("pagination.previous")}
              </button>

              <button
                type="button"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= pagination.totalPages || loading}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("pagination.next")}

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

      {/* Add / Edit Product Modal */}
      {productModalOpen && (
        <AdminProductModal
          productId={editingProductId}
          onClose={closeProductModal}
          onCreated={handleProductCreated}
          onUpdated={handleProductUpdated}
        />
      )}
    </>
  );
}

export default function AdminProductsPage() {
  const t = useTranslations("AdminProductsPage");

  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500"
          aria-busy="true"
        >
          <span className="size-4 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
          {t("loading.loadingProductsPage")}
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}