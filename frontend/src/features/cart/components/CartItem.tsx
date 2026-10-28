"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import type { CartItem as CartItemType } from "@/src/features/cart/types/cart";
import {
  removeCartItem,
  updateCartItem,
} from "@/src/features/cart/services/cart.service";

type CartItemProps = {
  item: CartItemType;
  onRemove: (cartItemId: number) => void;
  onQuantityChange: (cartItemId: number, quantity: number) => void;
};

type CartProductImage = {
  id?: number;
  url?: string | null;
  alt?: string | null;
  colorId?: number | null;
  isPrimary?: boolean;
  sortOrder?: number;
};

type VariantDisplayInfo = {
  sku?: string | null;
  storage?: string | null;
  colorId?: number | null;
  colorOption?: {
    id?: number;
    name?: string | null;
    hexCode?: string | null;
  } | null;
};

type ProductDisplayInfo = {
  sku?: string | null;
  images?: CartProductImage[];
};

export default function CartItem({
  item,
  onRemove,
  onQuantityChange,
}: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);

  const quantity = item.quantity;

  // The casts let this component handle the richer API response while
  // remaining compatible with the existing Cart type during migration.
  const product = item.product as CartItemType["product"] & ProductDisplayInfo;
  const variant = item.variant as
    | (NonNullable<CartItemType["variant"]> & VariantDisplayInfo)
    | null;

  const images = (product.images ?? [])
    .filter((image) => Boolean(image.url))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  // Prefer the image for the selected color, then a general product image.
  const colorSpecificImage =
    variant?.colorId != null
      ? images.find(
          (image) =>
            image.colorId === variant.colorId && image.isPrimary
        ) ?? images.find((image) => image.colorId === variant.colorId)
      : undefined;

  const productImage =
    colorSpecificImage ??
    images.find((image) => image.colorId == null && image.isPrimary) ??
    images.find((image) => image.colorId == null) ??
    images.find((image) => image.isPrimary) ??
    images[0];

  // Stock and prices belong to the selected product variant.
  const availableStock = Number(variant?.stock ?? 0);
  const stock =
    Number.isFinite(availableStock) && availableStock > 0
      ? availableStock
      : 0;

  const regularPrice = Number(variant?.price);
  const hasValidRegularPrice =
    variant !== null &&
    Number.isFinite(regularPrice) &&
    regularPrice >= 0;

  const rawSalePrice = variant?.salePrice;
  const parsedSalePrice =
    rawSalePrice !== null && rawSalePrice !== undefined && rawSalePrice !== ""
      ? Number(rawSalePrice)
      : null;

  const salePrice =
    parsedSalePrice !== null &&
    Number.isFinite(parsedSalePrice) &&
    parsedSalePrice >= 0
      ? parsedSalePrice
      : null;

  const price = salePrice ?? regularPrice;
  const hasValidPrice = Number.isFinite(price) && price >= 0;
  const subtotal = hasValidPrice ? price * quantity : null;
  const formattedPrice = (value: number) =>
    `${value.toLocaleString("vi-VN")} VND`;

  const hasDiscount =
    salePrice !== null &&
    hasValidRegularPrice &&
    regularPrice > 0 &&
    salePrice < regularPrice;

  const discountPercentage = hasDiscount
    ? Math.round(((regularPrice - salePrice!) / regularPrice) * 100)
    : 0;

  const variantSku = variant?.sku || product.sku || null;
  const storage = variant?.storage?.trim() || null;
  const colorName = variant?.colorOption?.name?.trim() || null;
  const colorHex = variant?.colorOption?.hexCode || null;
  const colorId = variant?.colorId ?? null;
  const hasConfiguration = Boolean(variantSku || storage || colorName || colorId !== null);
  const isBusy = isUpdating || isRemoving;

  // Close the remove-item dialog with Esc, except while removal is running.
  useEffect(() => {
    if (!isRemoveConfirmOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isRemoving) {
        setIsRemoveConfirmOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRemoveConfirmOpen, isRemoving]);

  const handleQuantityUpdate = async (newQuantity: number) => {
    if (
      isBusy ||
      !Number.isInteger(newQuantity) ||
      newQuantity < 1 ||
      newQuantity > stock
    ) {
      return;
    }

    const toastId = toast.loading("Updating cart quantity...");
    setIsUpdating(true);

    try {
      await updateCartItem(item.id, newQuantity);
      onQuantityChange(item.id, newQuantity);

      toast.success("Cart quantity updated.", {
        id: toastId,
        description: `${item.product.name} · Quantity: ${newQuantity}`,
      });
    } catch (error) {
      console.error("Failed to update cart quantity:", error);
      toast.error("Unable to update quantity. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrease = async () => {
    if (isBusy || quantity >= stock || stock <= 0) return;
    await handleQuantityUpdate(quantity + 1);
  };

  const handleDecrease = async () => {
    if (isBusy || quantity <= 1) return;
    await handleQuantityUpdate(quantity - 1);
  };

  const handleRemove = async () => {
    if (isBusy) return;

    const toastId = toast.loading("Removing item from cart...");
    setIsRemoving(true);

    try {
      await removeCartItem(item.id);
      onRemove(item.id);

      toast.success("Item removed from cart.", {
        id: toastId,
        description: item.product.name,
      });
    } catch (error) {
      console.error("Failed to remove cart item:", error);
      toast.error("Unable to remove this item. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsRemoving(false);
      setIsRemoveConfirmOpen(false);
    }
  };

  return (
    <>
    <article className="min-w-0 rounded-xl transition-colors duration-200 hover:bg-slate-50/70">
      <div className="flex flex-col gap-4 p-2 sm:flex-row sm:items-start sm:gap-4">
        {/* Product image: color-specific image first, then primary general image. */}
        <div className="flex shrink-0 justify-center sm:justify-start">
          <div className="flex size-28 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white sm:size-32">
            {productImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productImage.url}
                alt={productImage.alt || item.product.name}
                className="h-full w-full object-contain p-2"
                loading="lazy"
              />
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                className="size-10 text-slate-300"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9" r="1.5" />
                <path d="m4 17 5-5 3 3 3-4 5 6" />
              </svg>
            )}
          </div>
        </div>

        {/* Product name and selected variant configuration. */}
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-semibold leading-5 text-slate-800 sm:text-base">
            {item.product.name}
          </h3>

          {hasConfiguration && (
            <div className="mt-2 space-y-1.5 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
              {variantSku && (
                <p className="break-all">
                  <span className="font-medium text-slate-500">SKU:</span>{" "}
                  <span className="font-semibold text-slate-700">{variantSku}</span>
                </p>
              )}

              {storage && (
                <p>
                  <span className="font-medium text-slate-500">Storage:</span>{" "}
                  <span className="font-medium text-slate-700">{storage}</span>
                </p>
              )}

              {colorName ? (
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-500">Color:</span>
                  {colorHex && (
                    <span
                      aria-hidden="true"
                      className="size-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: colorHex }}
                    />
                  )}
                  <span className="font-medium text-slate-700">{colorName}</span>
                </p>
              ) : colorId !== null ? (
                <p>
                  <span className="font-medium text-slate-500">Color option:</span>{" "}
                  <span className="font-medium text-slate-700">#{colorId}</span>
                </p>
              ) : null}

              {!variantSku && !storage && !colorName && colorId === null && (
                <p className="text-slate-500">Standard configuration</p>
              )}
            </div>
          )}

          {/* Unit price */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-blue-700">
              {hasValidPrice ? formattedPrice(price) : "Price unavailable"}
            </span>

            {hasDiscount && (
              <>
                <span className="text-xs text-slate-400 line-through">
                  {formattedPrice(regularPrice)}
                </span>
                <span className="rounded-full border border-rose-100 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                  -{discountPercentage}%
                </span>
              </>
            )}
          </div>

          {/* Quantity controls and remove action */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <div
              className="inline-flex h-9 items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              aria-label="Quantity controls"
            >
              <button
                type="button"
                onClick={() => void handleDecrease()}
                disabled={isBusy || quantity <= 1}
                aria-label={`Decrease quantity of ${item.product.name}`}
                className="flex h-full w-9 items-center justify-center text-lg text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-900 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                −
              </button>

              <span
                className="flex h-full min-w-9 items-center justify-center border-x border-slate-200 bg-slate-50 px-2 text-sm font-semibold text-slate-700"
                aria-live="polite"
              >
                {isUpdating ? (
                  <span
                    aria-label="Updating quantity"
                    className="size-3.5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600"
                  />
                ) : (
                  quantity
                )}
              </span>

              <button
                type="button"
                onClick={() => void handleIncrease()}
                disabled={isBusy || quantity >= stock || stock <= 0}
                aria-label={`Increase quantity of ${item.product.name}`}
                className="flex h-full w-9 items-center justify-center text-lg text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-900 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsRemoveConfirmOpen(true)}
              disabled={isBusy}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRemoving ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-3 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600"
                  />
                  Removing...
                </>
              ) : (
                <>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="size-4"
                  >
                    <path
                      d="M3 6h18M8 6V4h8v2m3 0-.9 14H5.9L5 6m4 4v6m6-6v6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Remove
                </>
              )}
            </button>
          </div>

          {/* Stock hint */}
          <p
            className={`mt-2 text-xs ${
              !variant
                ? "text-rose-600"
                : stock <= 0
                  ? "text-rose-600"
                  : quantity >= stock
                    ? "text-amber-600"
                    : "text-slate-400"
            }`}
          >
            {!variant
              ? "Variant unavailable"
              : stock <= 0
                ? "Currently out of stock"
                : quantity >= stock
                  ? "Maximum available quantity selected"
                  : `${stock} units available`}
          </p>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 sm:min-w-[155px] sm:flex-col sm:items-end sm:justify-center sm:bg-transparent sm:px-0 sm:py-0">
          <p className="text-xs font-medium text-slate-500 sm:text-right">Subtotal</p>
          <p className="text-base font-bold tracking-tight text-blue-800 sm:text-right">
            {subtotal !== null ? formattedPrice(subtotal) : "Price unavailable"}
          </p>
        </div>
      </div>
    </article>

    {isRemoveConfirmOpen &&
      createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4"
          onMouseDown={(event) => {
            event.stopPropagation();
            if (event.target === event.currentTarget && !isRemoving) {
              setIsRemoveConfirmOpen(false);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`remove-item-confirm-title-${item.id}`}
            aria-describedby={`remove-item-confirm-description-${item.id}`}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl"
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
                aria-hidden="true"
              >
                <path d="M3 6h18M8 6V4h8v2m3 0-.9 14H5.9L5 6m4 4v6m6-6v6" />
              </svg>
            </div>

            <h2
              id={`remove-item-confirm-title-${item.id}`}
              className="mt-4 text-lg font-semibold text-slate-900"
            >
              Remove this item?
            </h2>

            <p
              id={`remove-item-confirm-description-${item.id}`}
              className="mt-2 break-words text-sm leading-6 text-slate-500"
            >
              Are you sure you want to remove &quot;{item.product.name}&quot; from your cart?
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsRemoveConfirmOpen(false)}
                disabled={isRemoving}
                className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleRemove()}
                disabled={isRemoving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRemoving ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    Removing...
                  </>
                ) : (
                  "Remove"
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
