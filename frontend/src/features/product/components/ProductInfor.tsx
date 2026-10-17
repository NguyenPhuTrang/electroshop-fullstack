
"use client";

import { addCartItem } from "@/src/features/cart/services/cart.service";
import { useState } from "react";
import { Review } from "../../review/types/review";
import { toast } from "sonner";

type ProductInforProps = {
  productId: number;
  name: string;
  price: string;
  salePrice: string | null;
  stock: number;
  brandName: string;
  categoryName: string;
  description: string;
  reviews: Review[];
};

export default function ProductInfor({
  productId,
  name,
  price,
  salePrice,
  stock,
  brandName,
  categoryName,
  description,
  reviews,
}: ProductInforProps) {
  const formattedPrice = Number(price).toLocaleString("vi-VN");

  const hasSalePrice = salePrice !== null && salePrice !== "";

  const formattedSalePrice = hasSalePrice
    ? Number(salePrice).toLocaleString("vi-VN")
    : null;

  const numericPrice = Number(price);
  const numericSalePrice = Number(salePrice);

  const hasDiscount =
    hasSalePrice &&
    Number.isFinite(numericPrice) &&
    Number.isFinite(numericSalePrice) &&
    numericPrice > 0 &&
    numericSalePrice >= 0 &&
    numericSalePrice < numericPrice;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((numericPrice - numericSalePrice) / numericPrice) * 100
      )
    : 0;

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      : 0;

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);



 const handleAddToCart = async () => {
  if (stock <= 0 || quantity < 1 || quantity > stock || addingToCart) {
    return;
  }

  setAddingToCart(true);

  const toastId = toast.loading("Adding to your cart...");

  try {
    await addCartItem(productId, quantity);

    toast.success(
      `${quantity} ${
        quantity === 1 ? "item has" : "items have"
      } been added to your cart.`,
      {
        id: toastId,
        description: name,
      }
    );
  } catch (error) {
    console.error("Failed to add product to cart", error);

    toast.error(
      "Unable to add this product to your cart. Please try again.",
      {
        id: toastId,
      }
    );
  } finally {
    setAddingToCart(false);
  }
};

  return (
    <div className="flex flex-col">
      {/* Brand & Category */}
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

      {/* Product Name */}
      <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-[2rem]">
        {name}
      </h1>

      {/* Rating */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <div
          className="flex items-center gap-0.5 text-base text-amber-400"
          role="img"
          aria-label={
            reviews.length > 0
              ? `Rated ${averageRating.toFixed(1)} out of 5`
              : "No ratings yet"
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
              {reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </>
        ) : (
          <span className="text-sm text-slate-500">
            No reviews yet
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mt-6 border-y border-slate-100 py-5">
        <div className="flex flex-wrap items-center gap-3">
          {formattedSalePrice !== null ? (
            <>
              <p className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {formattedSalePrice} VND
              </p>

              {hasDiscount && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                  -{discountPercentage}%
                </span>
              )}
            </>
          ) : (
            <p className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {formattedPrice} VND
            </p>
          )}
        </div>

        {formattedSalePrice !== null && (
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-400 line-through">
              {formattedPrice} VND
            </p>

            {hasDiscount && (
              <p className="text-xs font-medium text-emerald-600">
                You save{" "}
                {(numericPrice - numericSalePrice).toLocaleString(
                  "vi-VN"
                )}{" "}
                VND
              </p>
            )}
          </div>
        )}

        {/* Stock Status */}
        <div className="mt-4">
          {stock <= 0 ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
              <span className="size-1.5 rounded-full bg-red-500" />
              Out of Stock
            </span>
          ) : stock <= 5 ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Only {stock} left in stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              In Stock
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Product Description
        </h2>

        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
          {description.trim() || "No description available."}
        </p>
      </div>

      {/* Quantity Selector */}
      <div className="mt-6">
        <label
          htmlFor="product-quantity"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Quantity
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex h-11 items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              disabled={stock <= 0 || quantity <= 1 || addingToCart}
              onClick={() =>
                setQuantity((current) => Math.max(1, current - 1))
              }
              aria-label="Decrease quantity"
              className="flex h-full w-10 items-center justify-center text-lg text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30"
            >
              −
            </button>

            <input
              id="product-quantity"
              type="number"
              min={1}
              max={stock}
              value={quantity}
              readOnly
              aria-label="Selected quantity"
              className="h-full w-12 border-x border-slate-200 bg-white text-center text-sm font-semibold text-slate-900 outline-none"
            />

            <button
              type="button"
              disabled={
                stock <= 0 || quantity >= stock || addingToCart
              }
              onClick={() =>
                setQuantity((current) =>
                  Math.min(stock, current + 1)
                )
              }
              aria-label="Increase quantity"
              className="flex h-full w-10 items-center justify-center text-lg text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30"
            >
              +
            </button>
          </div>

          <p className="text-xs text-slate-500">
            {stock > 0
              ? `${stock} ${stock === 1 ? "unit" : "units"} available`
              : "Currently unavailable"}
          </p>
        </div>
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        type="button"
        disabled={stock <= 0 || addingToCart}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
      >
        {addingToCart ? (
          <>
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
            Adding to Cart...
          </>
        ) : stock <= 0 ? (
          "Out of Stock"
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

            Add to Cart
          </>
        )}
      </button>
      
      {/* Supporting Note */}
      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
        Secure checkout · Quality products · Customer support
      </p>
    </div>
  );
}
