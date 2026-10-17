"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { CartItem as CartItemType } from "@/src/features/cart/types/cart";
import {
  removeCartItem,
  updateCartItem,
} from "@/src/features/cart/services/cart.service";

type CartItemProps = {
  item: CartItemType;
  onRemove: (productId: number) => void;
  onQuantityChange: (productId: number, quantity: number) => void;
};

export default function CartItem({
  item,
  onRemove,
  onQuantityChange,
}: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const quantity = item.quantity;
  const stock = item.product.stock;

  const regularPrice = Number(item.product.price);

  const hasSalePrice =
    item.product.salePrice !== null &&
    item.product.salePrice !== "";

  const salePrice = hasSalePrice
    ? Number(item.product.salePrice)
    : null;

  const price = salePrice ?? regularPrice;
  const subtotal = price * quantity;

  const formattedPrice = (value: number) =>
    `${value.toLocaleString("vi-VN")} VND`;

  const hasDiscount =
    salePrice !== null &&
    Number.isFinite(regularPrice) &&
    Number.isFinite(salePrice) &&
    regularPrice > 0 &&
    salePrice >= 0 &&
    salePrice < regularPrice;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((regularPrice - salePrice) / regularPrice) * 100
      )
    : 0;

  const isBusy = isUpdating || isRemoving;

  // Update Quantity
  const handleQuantityUpdate = async (newQuantity: number) => {
    if (isBusy || newQuantity < 1 || newQuantity > stock) {
      return;
    }

    const toastId = toast.loading("Updating cart quantity...");

    setIsUpdating(true);

    try {
      await updateCartItem(item.productId, newQuantity);

      onQuantityChange(item.productId, newQuantity);

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

  // Increase Quantity
  const handleIncrease = async () => {
    if (isBusy || quantity >= stock || stock <= 0) {
      return;
    }

    await handleQuantityUpdate(quantity + 1);
  };

  // Decrease Quantity
  const handleDecrease = async () => {
    if (isBusy || quantity <= 1) {
      return;
    }

    await handleQuantityUpdate(quantity - 1);
  };

  // Remove Item
  const handleRemove = async () => {
    if (isBusy) {
      return;
    }

    const toastId = toast.loading("Removing item from cart...");

    setIsRemoving(true);

    try {
      await removeCartItem(item.productId);

      onRemove(item.productId);

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
    }
  };

  return (
    <article className="min-w-0 rounded-xl transition-colors duration-200 hover:bg-slate-50/70">
      <div className="flex flex-col gap-4 p-2 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        {/* Product Information */}
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-semibold leading-5 text-slate-800 transition-colors hover:text-blue-700 sm:text-base">
            {item.product.name}
          </h3>

          {/* Unit Price */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-blue-700">
              {formattedPrice(price)}
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

          {/* Quantity Controls */}
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
              onClick={() => void handleRemove()}
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

          {/* Stock Hint */}
          <p
            className={`mt-2 text-xs ${
              stock <= 0
                ? "text-rose-600"
                : quantity >= stock
                  ? "text-amber-600"
                  : "text-slate-400"
            }`}
          >
            {stock <= 0
              ? "Currently out of stock"
              : quantity >= stock
                ? "Maximum available quantity selected"
                : `${stock} units available`}
          </p>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between gap-3 rounded-lg bg-blue-50/60 px-3 py-2 sm:min-w-[155px] sm:flex-col sm:items-end sm:justify-center sm:bg-transparent sm:px-0 sm:py-0">
          <p className="text-xs font-medium text-slate-500 sm:text-right">
            Subtotal
          </p>

          <p className="text-base font-bold tracking-tight text-blue-800 sm:text-right">
            {formattedPrice(subtotal)}
          </p>
        </div>
      </div>
    </article>
  );
}