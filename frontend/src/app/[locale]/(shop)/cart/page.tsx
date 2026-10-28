"use client";

import { useCart } from "@/src/features/cart/context/CartContext";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { Link } from "@/src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  clearCart,
  getCart,
} from "@/src/features/cart/services/cart.service";
import CartItem from "@/src/features/cart/components/CartItem";
import type { Cart } from "@/src/features/cart/types/cart";

function LoadingBar({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      aria-hidden="true"
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

function CartLoadingSkeleton() {
  const t = useTranslations("CartPage");

  return (
    <main
      className="min-h-screen bg-[#f7f8fa]"
      aria-busy="true"
      aria-label={t("loading.label")}
    >
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-7 lg:px-6 lg:py-8">
        {/* Heading skeleton */}
        <section className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6 sm:py-6">
          <div className="mb-2">
            <LoadingBar className="h-6 w-36 rounded-full bg-slate-200" />
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <LoadingBar className="h-8 w-44 rounded-lg bg-slate-200 sm:h-9" />

              <LoadingBar
                className="mt-3 h-4 w-64 max-w-full rounded bg-slate-100"
                delay={0.1}
              />
            </div>

            <LoadingBar className="h-10 w-24 rounded-xl bg-slate-200" />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 bottom-0 h-1 w-36 rounded-full bg-slate-200"
          />
        </section>

        {/* Same two-column grid as the loaded cart */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Cart items skeleton */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1 bg-slate-200" />

            <div className="p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <LoadingBar className="size-5 rounded-md bg-slate-200" />
                  </div>

                  <div className="space-y-2">
                    <LoadingBar className="h-4 w-24 rounded bg-slate-200" />
                    <LoadingBar className="h-3 w-16 rounded bg-slate-100" />
                  </div>
                </div>

                <LoadingBar className="h-9 w-24 rounded-lg bg-slate-200" />
              </div>

              <div className="divide-y divide-slate-100">
                {Array.from({ length: 3 }, (_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.08 + index * 0.06,
                      ease: "easeOut",
                    }}
                    className="flex gap-3 py-4 first:pt-2 sm:gap-4"
                  >
                    <LoadingBar className="size-20 shrink-0 rounded-xl bg-slate-100 sm:size-28" />

                    <div className="flex min-w-0 flex-1 flex-col">
                      <LoadingBar className="h-4 w-3/4 max-w-56 rounded bg-slate-200" />

                      <LoadingBar
                        className="mt-2 h-3 w-2/5 max-w-32 rounded bg-slate-100"
                        delay={0.1}
                      />

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <LoadingBar className="h-5 w-24 rounded bg-slate-200" />
                        <LoadingBar className="h-8 w-24 rounded-lg bg-slate-100" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <LoadingBar className="h-9 w-36 rounded-lg bg-slate-200" />
              </div>
            </div>
          </section>

          {/* Order summary skeleton */}
          <aside className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-6">
            <div className="h-1.5 bg-slate-200" />

            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <LoadingBar className="size-5 rounded-md bg-slate-200" />
                </div>

                <div className="flex-1 space-y-2">
                  <LoadingBar className="h-4 w-28 rounded bg-slate-200" />
                  <LoadingBar className="h-3 w-32 max-w-full rounded bg-slate-100" />
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <LoadingBar className="h-4 w-16 rounded bg-slate-100" />
                  <LoadingBar className="h-4 w-24 rounded bg-slate-200" />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <LoadingBar className="h-4 w-16 rounded bg-slate-100" />
                  <LoadingBar className="h-4 w-28 rounded bg-slate-100" />
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                <LoadingBar className="h-3 w-28 rounded bg-slate-100" />

                <LoadingBar
                  className="mt-2 h-7 w-36 max-w-full rounded bg-slate-200"
                  delay={0.1}
                />

                <div className="mt-3 border-t border-slate-200 pt-3">
                  <LoadingBar className="h-3 w-full rounded bg-slate-100" />
                </div>
              </div>

              <LoadingBar className="mt-5 h-12 w-full rounded-xl bg-slate-200" />

              <div className="mt-4 flex justify-center">
                <LoadingBar className="h-4 w-28 rounded bg-slate-100" />
              </div>
            </div>
          </aside>
        </div>

        <div className="h-5 sm:h-8" />
      </div>
    </main>
  );
}

// Variant price is the source of truth for each cart row.
function getCartItemPrice(item: Cart["items"][number]): number | null {
  if (!item.variant) return null;

  const regularPrice = Number(item.variant.price);

  if (!Number.isFinite(regularPrice) || regularPrice < 0) {
    return null;
  }

  const rawSalePrice = item.variant.salePrice;

  if (
    rawSalePrice !== null &&
    rawSalePrice !== undefined &&
    rawSalePrice !== ""
  ) {
    const salePrice = Number(rawSalePrice);

    if (Number.isFinite(salePrice) && salePrice >= 0) {
      return salePrice;
    }
  }

  return regularPrice;
}

export default function CartPage() {
  const t = useTranslations("CartPage");
  const locale = useLocale();

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Keep the initial skeleton visible for at least 700 ms.
  const [minimumLoadingTimeElapsed, setMinimumLoadingTimeElapsed] =
    useState(false);
  const [hasInitialFetchSettled, setHasInitialFetchSettled] =
    useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMinimumLoadingTimeElapsed(true);
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setRequiresLogin(false);
    setLoadError(false);

    try {
      const data = await getCart();
      setCart(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setRequiresLogin(true);
        return;
      }

      console.error("Failed to get cart", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
      setHasInitialFetchSettled(true);
    }
  }, []);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!isClearConfirmOpen || isClearing) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsClearConfirmOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isClearConfirmOpen, isClearing]);

  const { setCount } = useCart();

  useEffect(() => {
    if (!cart) return;

    setCount(cart.items.reduce((sum, item) => sum + item.quantity, 0));
  }, [cart, setCount]);

  // CartItem callbacks use the cart row ID, not the product ID.
  const handleRemoveItem = (cartItemId: number) => {
    setCart((currentCart) => {
      if (!currentCart) return currentCart;

      return {
        ...currentCart,
        items: currentCart.items.filter((item) => item.id !== cartItemId),
      };
    });
  };

  const handleQuantityChange = (cartItemId: number, quantity: number) => {
    setCart((currentCart) => {
      if (!currentCart) return currentCart;

      return {
        ...currentCart,
        items: currentCart.items.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        ),
      };
    });
  };

  // Called only after the user confirms clearing the entire cart.
  const handleClearCart = async () => {
    if (!cart || cart.items.length === 0 || isClearing) return;

    const toastId = toast.loading(t("toast.clearing"));
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

      toast.success(t("toast.cleared"), { id: toastId });
    } catch (error) {
      console.error("Failed to clear cart", error);

      toast.error(t("toast.clearFailed"), { id: toastId });
    } finally {
      setIsClearing(false);
      setIsClearConfirmOpen(false);
    }
  };

  const showLoading =
    isLoading ||
    !hasInitialFetchSettled ||
    !minimumLoadingTimeElapsed;

  if (showLoading) {
    return <CartLoadingSkeleton />;
  }

  if (requiresLogin) {
    return (
      <main className="min-h-[calc(100vh-80px)] w-full bg-[#f7f8fa] px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative mx-auto flex w-full max-w-md flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-center shadow-sm"
        >
          <div className="px-6 py-9">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-100 text-blue-700 shadow-sm">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="size-7"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
              </svg>
            </div>

            <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
              {t("login.title")}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {t("login.description")}
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 text-sm font-semibold text-white shadow-md shadow-blue-600/15 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {t("login.signIn")}
              <span aria-hidden="true">→</span>
            </Link>

            <div>
              <Link
                href="/products"
                className="mt-4 inline-block text-sm font-medium text-slate-500 transition hover:text-blue-700"
              >
                {t("buttons.continueShopping")}
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  if (loadError || !cart) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#f7f8fa] px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          role="alert"
          className="flex w-full max-w-md flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-center shadow-sm"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-300 to-rose-100" />

          <div className="px-6 py-9">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-xl font-semibold text-rose-600">
              !
            </div>

            <h1 className="mt-4 text-xl font-semibold text-slate-900">
              {t("error.title")}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {t("error.description")}
            </p>

            <button
              type="button"
              onClick={() => void fetchCart()}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/15 transition hover:from-blue-700 hover:to-cyan-700"
            >
              {t("buttons.tryAgain")}
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  const hasUnavailablePrice = cart.items.some(
    (item) => getCartItemPrice(item) === null
  );

  const total = cart.items.reduce((sum, item) => {
    const price = getCartItemPrice(item);
    return price === null ? sum : sum + price * item.quantity;
  }, 0);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const formattedTotal = hasUnavailablePrice
    ? t("priceUnavailable")
    : formatPrice(total);

  const totalQuantity = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-7 lg:px-6 lg:py-8">
        {/* Page Heading */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6 sm:py-6"
        >
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1">
              <span className="size-1.5 rounded-full bg-cyan-500" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-800 sm:text-xs">
                {t("heading.badge")}
              </p>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  {t("heading.title")}
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {t("heading.description")}
                </p>
              </div>

              <AnimatePresence initial={false}>
                {cart.items.length > 0 && (
                  <motion.div
                    key="cart-item-count"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 px-3.5 py-2.5"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="size-4 text-blue-700"
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
                      {t("counts.items", { count: totalQuantity })}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* Empty Cart */}
        <AnimatePresence mode="wait" initial={false}>
          {cart.items.length === 0 ? (
            <motion.section
              key="empty-cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm sm:py-16"
            >
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
                  {t("empty.title")}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {t("empty.description")}
                </p>

                <Link
                  href="/products"
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 text-sm font-semibold text-white shadow-md shadow-blue-600/15 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  {t("buttons.exploreProducts")}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </motion.section>
          ) : (
            <motion.div
              key="populated-cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"
            >
              {/* Cart Items */}
              <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                          {t("items.title")}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                          {t("counts.products", { count: cart.items.length })}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsClearConfirmOpen(true)}
                      disabled={isClearing}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isClearing ? (
                        <>
                          <span className="size-3.5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
                          {t("buttons.clearing")}
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

                          {t("buttons.clearCart")}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <AnimatePresence initial={false}>
                      {cart.items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{
                            opacity: { duration: 0.25, ease: "easeOut" },
                            y: { duration: 0.3, ease: "easeOut" },
                            x: { duration: 0.2, ease: "easeOut" },
                            layout: { duration: 0.25, ease: "easeOut" },
                            delay: Math.min(index * 0.05, 0.2),
                          }}
                          className="py-4 first:pt-2 last:pb-1"
                        >
                          <CartItem
                            item={item}
                            onRemove={handleRemoveItem}
                            onQuantityChange={handleQuantityChange}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 hover:text-blue-900"
                    >
                      <span aria-hidden="true">←</span>
                      {t("buttons.continueShopping")}
                    </Link>
                  </div>
                </div>
              </section>

              {/* Order Summary */}
              <aside className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-6">
                <div className="p-5">
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
                          d="M4 5h16v15H4zM8 9h8M8 13h5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div>
                      <h2 className="text-base font-semibold tracking-tight text-slate-900">
                        {t("summary.title")}
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {t("summary.description")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-slate-500">
                        {t("summary.subtotal")}
                        <span className="ml-1 text-xs">
                          ({t("counts.items", { count: totalQuantity })})
                        </span>
                      </span>

                      <span className="text-right font-semibold text-slate-800">
                        {formattedTotal}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-slate-500">
                        {t("summary.shipping")}
                      </span>

                      <span className="text-right text-xs text-slate-500">
                        {t("summary.shippingAtCheckout")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-900">
                      {t("summary.estimatedTotal")}
                    </p>

                    <motion.p
                      key={`${total}-${totalQuantity}`}
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="mt-1.5 break-words text-xl font-bold tracking-tight text-red-500 sm:text-2xl"
                    >
                      {formattedTotal}
                    </motion.p>

                    <div className="mt-3 flex items-center gap-2 border-t border-blue-100 pt-3">
                      <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
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
                        {t("summary.shippingAtCheckout")}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    {t("buttons.checkout")}
                    <span aria-hidden="true" className="text-base">
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
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
                    </svg>

                    {t("summary.secureCheckout")}
                  </div>
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom confirmation dialog for clearing the full cart */}
        {isClearConfirmOpen &&
          createPortal(
            <div
              className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 px-4"
              onMouseDown={(event) => {
                if (
                  event.target === event.currentTarget &&
                  !isClearing
                ) {
                  setIsClearConfirmOpen(false);
                }
              }}
            >
              <motion.div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="clear-cart-confirm-title"
                aria-describedby="clear-cart-confirm-description"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl"
              >
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6"
                  >
                    <path d="M3 6h18M8 6V4h8v2m3 0-.9 14H5.9L5 6" />
                  </svg>
                </div>

                <h2
                  id="clear-cart-confirm-title"
                  className="mt-4 text-lg font-semibold text-slate-900"
                >
                  Clear your cart?
                </h2>

                <p
                  id="clear-cart-confirm-description"
                  className="mt-2 text-sm leading-6 text-slate-500"
                >
                  Are you sure you want to remove all items from your cart? This action cannot be undone.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsClearConfirmOpen(false)}
                    disabled={isClearing}
                    className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleClearCart()}
                    disabled={isClearing}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isClearing ? (
                      <>
                        <span
                          aria-hidden="true"
                          className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        />
                        {t("buttons.clearing")}
                      </>
                    ) : (
                      "Clear Cart"
                    )}
                  </button>
                </div>
              </motion.div>
            </div>,
            document.body
          )}

        <div className="h-5 sm:h-8" />
      </div>
    </main>
  );
}
