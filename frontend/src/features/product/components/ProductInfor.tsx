
"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { addCartItem } from "@/src/features/cart/services/cart.service";
import { useProductVariants } from "@/src/features/product/hooks/useProductVariants";
import type { ProductVariant } from "@/src/features/product/types/product";
import type { Review } from "@/src/features/review/types/review";

type ProductInforProps = {
  productId: number;
  name: string;
  brandName: string;
  categoryName: string;
  description: string | null;
  reviews: Review[];
  onSelectedColorChange?: (colorId: number | null) => void;
};

const isStandardStorage = (storage: string): boolean =>
  storage.trim().toLowerCase() === "standard";

const getStorageSize = (storage: string): number => {
  const normalized = storage.trim().toUpperCase();
  const match = normalized.match(/^([\d.]+)\s*(TB|GB)$/);

  if (!match) return Number.MAX_SAFE_INTEGER;

  const size = Number(match[1]);

  if (!Number.isFinite(size)) return Number.MAX_SAFE_INTEGER;

  return match[2] === "TB" ? size * 1024 : size;
};

const parsePrice = (value: string | null): number | null => {
  if (value === null || value.trim() === "") return null;

  const price = Number(value);

  if (!Number.isFinite(price) || price <= 0) return null;

  return price;
};

const getEffectivePrice = (
  variant: ProductVariant
): number | null => {
  const regularPrice = parsePrice(variant.price);

  if (regularPrice === null) return null;

  const salePrice = parsePrice(variant.salePrice);

  return salePrice !== null && salePrice < regularPrice
    ? salePrice
    : regularPrice;
};

const formatPrice = (price: number, locale: string): string =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(price);

export default function ProductInfor({
  productId,
  name,
  brandName,
  categoryName,
  description,
  reviews,
  onSelectedColorChange,
}: ProductInforProps) {
  const t = useTranslations("ProductInfo");
  const locale = useLocale();

  const {
    variants,
    loading: variantsLoading,
    error: variantsError,
  } = useProductVariants(productId);

  const [selectedStorage, setSelectedStorage] = useState<string | null>(
    null
  );
  const [selectedColorId, setSelectedColorId] = useState<number | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    setSelectedStorage(null);
    setSelectedColorId(null);
    setQuantity(1);
  }, [productId]);

  useEffect(() => {
    onSelectedColorChange?.(selectedColorId);
  }, [selectedColorId, onSelectedColorChange]);

  const visibleVariants = variants.filter(
    (variant) => variant.status !== "INACTIVE"
  );

  const purchasableVariants = visibleVariants.filter(
    (variant) =>
      variant.status === "ACTIVE" && variant.stock > 0
  );

  const rawStorageOptions = Array.from(
    new Set(
      visibleVariants
        .map((variant) => variant.storage)
        .filter((storage): storage is string => storage !== null)
    )
  ).sort(
    (a, b) =>
      getStorageSize(a) - getStorageSize(b) ||
      a.localeCompare(b)
  );

  const hasRealStorageOptions = rawStorageOptions.some(
    (storage) => !isStandardStorage(storage)
  );

  const storageOptions = hasRealStorageOptions
    ? rawStorageOptions
    : [];

  const hasStorageOptions = storageOptions.length > 0;

  const allColorOptions = Array.from(
    new Map(
      visibleVariants.flatMap((variant) =>
        variant.colorOption
          ? [[variant.colorOption.id, variant.colorOption] as const]
          : []
      )
    ).values()
  ).sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      a.name.localeCompare(b.name)
  );

  const hasColorOptions = allColorOptions.length > 0;

  const colorOptions =
    selectedStorage === null
      ? allColorOptions
      : allColorOptions.filter((color) =>
          visibleVariants.some(
            (variant) =>
              variant.storage === selectedStorage &&
              variant.colorId === color.id
          )
        );

  const selectedVariant: ProductVariant | null = (() => {
    if (visibleVariants.length === 0) return null;

    if (hasStorageOptions && selectedStorage === null) return null;

    if (hasColorOptions && selectedColorId === null) return null;

    return (
      visibleVariants.find(
        (variant) =>
          (!hasStorageOptions ||
            variant.storage === selectedStorage) &&
          (!hasColorOptions ||
            variant.colorId === selectedColorId)
      ) ?? null
    );
  })();

  const requiresVariantSelection =
    visibleVariants.length > 0 && selectedVariant === null;

  const lowestPriceVariant = purchasableVariants.reduce<
    ProductVariant | null
  >((lowest, variant) => {
    if (!lowest) return variant;

    const currentPrice = getEffectivePrice(variant);
    const lowestPrice = getEffectivePrice(lowest);

    if (currentPrice === null) return lowest;

    if (lowestPrice === null || currentPrice < lowestPrice) {
      return variant;
    }

    return lowest;
  }, null);

  const priceVariant = selectedVariant ?? lowestPriceVariant;

  const displayedPrice = priceVariant
    ? parsePrice(priceVariant.price)
    : null;

  const numericSalePrice = priceVariant
    ? parsePrice(priceVariant.salePrice)
    : null;

  const hasDiscount =
    displayedPrice !== null &&
    numericSalePrice !== null &&
    numericSalePrice < displayedPrice;

  const displayedEffectivePrice =
    hasDiscount && numericSalePrice !== null
      ? numericSalePrice
      : displayedPrice;

  const discountPercentage =
    hasDiscount &&
    displayedPrice !== null &&
    numericSalePrice !== null
      ? Math.round(
          ((displayedPrice - numericSalePrice) / displayedPrice) * 100
        )
      : 0;

  const formattedPrice =
    displayedPrice !== null
      ? formatPrice(displayedPrice, locale)
      : null;

  const formattedEffectivePrice =
    displayedEffectivePrice !== null
      ? formatPrice(displayedEffectivePrice, locale)
      : null;

  const formattedSalePrice =
    hasDiscount && numericSalePrice !== null
      ? formatPrice(numericSalePrice, locale)
      : null;

  const displayedStock = selectedVariant?.stock ?? null;

  const selectedVariantAvailable =
    selectedVariant !== null &&
    selectedVariant.status === "ACTIVE" &&
    selectedVariant.stock > 0;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      : 0;

  const handleStorageChange = (storage: string) => {
    const colorIsAvailable =
      selectedColorId !== null &&
      visibleVariants.some(
        (variant) =>
          variant.storage === storage &&
          variant.colorId === selectedColorId
      );

    if (selectedColorId !== null && !colorIsAvailable) {
      setSelectedColorId(null);
    }

    setSelectedStorage(storage);
    setQuantity(1);
  };

  const handleColorChange = (colorId: number) => {
    setSelectedColorId(colorId);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (variantsLoading || variantsError) {
      toast.error(t("toast.verifyError"));
      return;
    }

    if (!selectedVariant) {
      toast.error(t("toast.selectRequired"));
      return;
    }

    if (!selectedVariantAvailable) {
      toast.error(t("toast.configurationOutOfStock"));
      return;
    }

    if (
      quantity < 1 ||
      quantity > selectedVariant.stock ||
      addingToCart
    ) {
      return;
    }

    setAddingToCart(true);

    const toastId = toast.loading(t("addingToCart"));

    try {
      await addCartItem(
        productId,
        quantity,
        selectedVariant.id
      );

      const configuration = [
        selectedVariant.storage &&
        !isStandardStorage(selectedVariant.storage)
          ? selectedVariant.storage
          : null,
        selectedVariant.colorOption?.name,
      ]
        .filter(Boolean)
        .join(" / ");

      toast.success(t("toast.addedToCart"), {
        id: toastId,
        description: configuration
          ? t("toast.addedDescription", { name, configuration })
          : name,
      });
    } catch (error) {
      console.error("Failed to add product to cart", error);

      toast.error(t("toast.addError"), {
        id: toastId,
      });
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {brandName}
        </span>

        <span className="text-slate-300" aria-hidden="true">
          /
        </span>

        <span className="text-xs font-medium text-slate-500">
          {categoryName}
        </span>
      </div>

      <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-[2rem]">
        {name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <div
          className="flex items-center gap-0.5 text-base text-amber-400"
          role="img"
          aria-label={
            reviews.length > 0
              ? t("ratedOutOfFive", {
                  rating: averageRating.toFixed(1),
                })
              : t("noRatings")
          }
        >
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} aria-hidden="true">
              {index < Math.round(averageRating) ? "★" : "☆"}
            </span>
          ))}
        </div>

        {reviews.length > 0 ? (
          <>
            <span className="text-sm font-semibold text-slate-800">
              {averageRating.toFixed(1)}
            </span>

            <span className="text-slate-300" aria-hidden="true">
              |
            </span>

            <span className="text-sm text-slate-500">
              {t("reviewCount", { count: reviews.length })}
            </span>
          </>
        ) : (
          <span className="text-sm text-slate-500">
            {t("noReviews")}
          </span>
        )}
      </div>

      {variantsLoading && (
        <p className="mt-5 text-sm text-slate-500">
          {t("loadingConfigurations")}
        </p>
      )}

      {variantsError && (
        <p className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
          {t("configurationLoadError")}
        </p>
      )}

      {!variantsLoading &&
        !variantsError &&
        visibleVariants.length === 0 && (
          <p className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
            {t("unavailable")}
          </p>
        )}

      {!variantsLoading &&
        !variantsError &&
        visibleVariants.length > 0 && (
          <div className="mt-5 space-y-5">
            {storageOptions.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  {t("storage")}
                </p>

                <div className="flex flex-wrap gap-2">
                  {storageOptions.map((storage) => {
                    const isSelected = selectedStorage === storage;

                    return (
                      <button
                        key={storage}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleStorageChange(storage)}
                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                        }`}
                      >
                        {storage}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {colorOptions.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  {t("color")}
                </p>

                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => {
                    const isSelected = selectedColorId === color.id;

                    return (
                      <button
                        key={color.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleColorChange(color.id)}
                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                        }`}
                      >
                        {color.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedVariant && (
              <p className="text-xs text-slate-500">
                {t("sku")}: {selectedVariant.sku}
              </p>
            )}

            {requiresVariantSelection && (
              <p className="text-sm text-slate-500">
                {t("selectOptionsHint")}
              </p>
            )}
          </div>
        )}

      <div className="mt-6 border-y border-slate-100 py-5">
        {priceVariant && formattedEffectivePrice !== null ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              {!selectedVariant && (
                <span className="text-sm font-medium text-slate-500">
                  {t("from")}
                </span>
              )}

              <p className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {formattedEffectivePrice}
              </p>

              {hasDiscount && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                  -{discountPercentage}%
                </span>
              )}
            </div>

            {formattedSalePrice !== null && formattedPrice !== null && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <p className="text-sm text-slate-400 line-through">
                  {formattedPrice}
                </p>

                {hasDiscount &&
                  displayedPrice !== null &&
                  numericSalePrice !== null && (
                    <p className="text-xs font-medium text-emerald-600">
                      {t("youSave", {
                        amount: formatPrice(
                          displayedPrice - numericSalePrice,
                          locale
                        ),
                      })}
                    </p>
                  )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500">
            {t("priceUnavailable")}
          </p>
        )}

        <div className="mt-4">
          {!selectedVariant ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {t("selectOptionsForStock")}
            </span>
          ) : !selectedVariantAvailable || displayedStock === 0 ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
              <span className="size-1.5 rounded-full bg-red-500" />
              {t("outOfStock")}
            </span>
          ) : displayedStock !== null && displayedStock <= 5 ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <span className="size-1.5 rounded-full bg-amber-500" />
              {t("onlyLeftInStock", { count: displayedStock })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {t("inStock")}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <h2 className="text-sm font-semibold text-slate-900">
          {t("description")}
        </h2>

        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
          {description?.trim() || t("noDescription")}
        </p>
      </div>

      <div className="mt-6">
        <label
          htmlFor="product-quantity"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          {t("quantity")}
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex h-11 items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              disabled={
                !selectedVariantAvailable ||
                quantity <= 1 ||
                addingToCart
              }
              onClick={() =>
                setQuantity((current) => Math.max(1, current - 1))
              }
              aria-label={t("decreaseQuantity")}
              className="flex h-full w-10 items-center justify-center text-lg text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30"
            >
              −
            </button>

            <input
              id="product-quantity"
              type="number"
              min={1}
              max={selectedVariant?.stock ?? undefined}
              value={quantity}
              readOnly
              aria-label={t("selectedQuantity")}
              className="h-full w-12 border-x border-slate-200 bg-white text-center text-sm font-semibold text-slate-900 outline-none"
            />

            <button
              type="button"
              disabled={
                !selectedVariantAvailable ||
                !selectedVariant ||
                quantity >= selectedVariant.stock ||
                addingToCart
              }
              onClick={() =>
                setQuantity((current) =>
                  selectedVariantAvailable && selectedVariant
                    ? Math.min(selectedVariant.stock, current + 1)
                    : current
                )
              }
              aria-label={t("increaseQuantity")}
              className="flex h-full w-10 items-center justify-center text-lg text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30"
            >
              +
            </button>
          </div>

          <p className="text-xs text-slate-500">
            {!selectedVariant
              ? t("selectOptionsFirst")
              : selectedVariantAvailable
                ? t("unitsAvailable", {
                    count: selectedVariant.stock,
                  })
                : t("currentlyUnavailable")}
          </p>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        type="button"
        disabled={
          !selectedVariant ||
          !selectedVariantAvailable ||
          addingToCart ||
          variantsLoading ||
          Boolean(variantsError)
        }
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
      >
        {addingToCart ? (
          <>
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
            {t("addingToCart")}
          </>
        ) : !selectedVariant ? (
          t("selectOptions")
        ) : !selectedVariantAvailable ? (
          t("outOfStock")
        ) : (
          <>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6"
              />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>

            {t("addToCart")}
          </>
        )}
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
        {t("trustLine")}
      </p>
    </div>
  );
}
