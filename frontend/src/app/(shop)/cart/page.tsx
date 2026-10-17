"use client";

import {
  clearCart,
  getCart,
} from "@/src/features/cart/services/cart.service";
import CartItem from "@/src/features/cart/components/CartItem";
import type { Cart } from "@/src/features/cart/types/cart";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Fetch Cart
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setRequiresLogin(false);
    setLoadError(false);

    try {
      const data = await getCart();
      setCart(data);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        setRequiresLogin(true);
        return;
      }

      console.error("Failed to get cart", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  // Remove Item from Local Cart State
  const handleRemoveItem = (productId: number) => {
    setCart((currentCart) => {
      if (!currentCart) return currentCart;

      return {
        ...currentCart,
        items: currentCart.items.filter(
          (item) => item.productId !== productId
        ),
      };
    });
  };

  // Update Quantity in Local Cart State
  const handleQuantityChange = (
    productId: number,
    quantity: number
  ) => {
    setCart((currentCart) => {
      if (!currentCart) return currentCart;

      return {
        ...currentCart,
        items: currentCart.items.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity,
              }
            : item
        ),
      };
    });
  };

  // Clear Cart
  const handleClearCart = async () => {
    if (!cart || cart.items.length === 0 || isClearing) return;

    const toastId = toast.loading("Clearing cart...");

    setIsClearing(true);

    try {
      await clearCart();

      setCart((currentCart) => {
        if (!currentCart) return currentCart;

        return {
          ...currentCart,
          items: [],
        };
      });

      toast.success("Cart cleared successfully.", {
        id: toastId,
      });
    } catch (error) {
      console.error("Failed to clear cart", error);

      toast.error("Unable to clear your cart. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <main
        className="min-h-screen bg-[#f7f8fa]"
        aria-busy="true"
        aria-label="Loading cart"
      >
        <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-7 lg:px-6">
          <div className="mb-7 space-y-3">
            <div className="h-3 w-28 animate-pulse rounded-full bg-cyan-100" />
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-64 max-w-full animate-pulse rounded bg-slate-100" />
          </div>

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-100" />

              <div className="p-4 sm:p-5">
                <div className="mb-5 h-5 w-32 animate-pulse rounded bg-slate-200" />

                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex gap-4 border-t border-slate-100 py-5 first:border-t-0"
                  >
                    <div className="size-24 shrink-0 animate-pulse rounded-xl bg-slate-100 sm:size-28" />

                    <div className="flex flex-1 flex-col gap-3">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                      <div className="mt-auto h-5 w-28 animate-pulse rounded bg-blue-100" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />

              <div className="p-5">
                <div className="mb-6 h-5 w-36 animate-pulse rounded bg-slate-200" />

                <div className="space-y-4">
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-10 w-full animate-pulse rounded-xl bg-blue-100" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  // Login Required
  if (requiresLogin) {
    return (
      <main className="min-h-[65vh] bg-[#f7f8fa] px-4 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-100" />

          <div className="px-6 py-9">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-100 text-blue-700 shadow-sm">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="size-7"
              >
                <circle cx="12" cy="8" r="4" />
                <path
                  d="M4 21a8 8 0 0 1 16 0"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
              Sign in to view your cart
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Log in to access your cart and continue shopping.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 text-sm font-semibold text-white shadow-md shadow-blue-600/15 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Log In
              <span aria-hidden="true">→</span>
            </Link>

            <div>
              <Link
                href="/products"
                className="mt-4 inline-block text-sm font-medium text-slate-500 transition hover:text-blue-700"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Load Error
  if (loadError || !cart) {
    return (
      <main className="min-h-[65vh] bg-[#f7f8fa] px-4 py-12">
        <div
          role="alert"
          className="mx-auto flex max-w-md flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-center shadow-sm"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-300 to-rose-100" />

          <div className="px-6 py-9">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-xl font-semibold text-rose-600">
              !
            </div>

            <h1 className="mt-4 text-xl font-semibold text-slate-900">
              Unable to load your cart
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Something went wrong while loading your cart. Please try again.
            </p>

            <button
              type="button"
              onClick={() => void fetchCart()}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Calculate Cart Total
  const total = cart.items.reduce((sum, item) => {
    const price = Number(
      item.product.salePrice ?? item.product.price
    );

    return sum + price * item.quantity;
  }, 0);

  const totalQuantity = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-7 lg:px-6 lg:py-8">
        {/* Page Heading */}
        <section className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6 sm:py-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-16 size-44 rounded-full"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 bottom-0 h-1 w-36 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
          />

          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1">
              <span className="size-1.5 rounded-full bg-cyan-500" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-800 sm:text-xs">
                Your shopping bag
              </p>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  My Cart
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review your items before checking out.
                </p>
              </div>

              {cart.items.length > 0 && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 px-3.5 py-2.5">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="size-4 text-blue-600"
                  >
                    <path
                      d="M3 3h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="10" cy="20" r="1" />
                    <circle cx="18" cy="20" r="1" />
                  </svg>

                  <span className="text-xs font-semibold text-blue-800">
                    {totalQuantity}{" "}
                    {totalQuantity === 1 ? "item" : "items"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Empty Cart */}
        {cart.items.length === 0 ? (
          <section className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-12 top-0 size-40 rounded-full"
            />

            <div className="relative">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-100 text-blue-700 shadow-sm">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="size-8"
                >
                  <path
                    d="M3 3h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </svg>
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
                Your cart is empty
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Looks like you haven&apos;t added anything to your cart yet.
                Explore our collection to find something you love.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 text-sm font-semibold text-white shadow-md shadow-blue-600/15 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg"
              >
                Explore Products
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        ) : (
          /* Cart Items and Summary */
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Cart Items */}
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-100" />

              <div className="p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="size-5"
                      >
                        <path
                          d="M3 3h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="10" cy="20" r="1" />
                        <circle cx="18" cy="20" r="1" />
                      </svg>
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        Cart Items
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {cart.items.length}{" "}
                        {cart.items.length === 1 ? "product" : "products"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleClearCart()}
                    disabled={isClearing}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isClearing ? (
                      <>
                        <span className="size-3.5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
                        Clearing...
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
                            d="M3 6h18M8 6V4h8v2m3 0-.9 14H5.9L5 6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        Clear Cart
                      </>
                    )}
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 first:pt-2 last:pb-1"
                    >
                      <CartItem
                        item={item}
                        onRemove={handleRemoveItem}
                        onQuantityChange={handleQuantityChange}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 hover:text-blue-900"
                  >
                    <span aria-hidden="true">←</span>
                    Continue shopping
                  </Link>
                </div>
              </div>
            </section>

            {/* Order Summary */}
            <aside className="min-w-0 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm lg:sticky lg:top-6">
              <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400" />

              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-100 text-blue-700">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="size-5"
                    >
                      <path
                        d="M4 5h16v15H4zM8 9h8M8 13h5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-base font-semibold tracking-tight text-slate-900">
                      Order Summary
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Your order at a glance
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-slate-500">
                      Subtotal
                      <span className="ml-1 text-xs">
                        ({totalQuantity}{" "}
                        {totalQuantity === 1 ? "item" : "items"})
                      </span>
                    </span>

                    <span className="text-right font-semibold text-slate-800">
                      {total.toLocaleString("vi-VN")} VND
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-slate-500">Shipping</span>

                    <span className="text-right text-xs text-slate-500">
                      Calculated at checkout
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/70 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Estimated total
                  </p>

                  <p className="mt-1.5 break-words text-xl font-bold tracking-tight text-blue-800 sm:text-2xl">
                    {total.toLocaleString("vi-VN")} VND
                  </p>

                  <div className="mt-3 flex items-center gap-2 border-t border-blue-100 pt-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-3"
                      >
                        <path
                          d="m4 10 4 4 8-8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <p className="text-xs leading-5 text-slate-600">
                      Shipping calculated at checkout
                    </p>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Proceed to Checkout
                  <span
                    aria-hidden="true"
                    className="text-base transition-transform duration-200"
                  >
                    →
                  </span>
                </Link>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="size-4 text-emerald-600"
                  >
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                    />
                    <path
                      d="M8 10V7a4 4 0 0 1 8 0v3"
                      strokeLinecap="round"
                    />
                  </svg>

                  Secure checkout
                </div>
              </div>
            </aside>
          </div>
        )}

        <div className="h-5 sm:h-8" />
      </div>
    </main>
  );
}