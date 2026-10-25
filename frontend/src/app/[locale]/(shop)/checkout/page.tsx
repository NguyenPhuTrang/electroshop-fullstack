"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/src/i18n/navigation";
import { toast } from "sonner";

import { getAddresses } from "@/src/features/address/services/address.service";
import type { Address } from "@/src/features/address/types/address";

import { getCart } from "@/src/features/cart/services/cart.service";
import type { Cart } from "@/src/features/cart/types/cart";

import { createOrder } from "@/src/features/order/services/order.service";
import type { PaymentMethod } from "@/src/features/order/types/order";

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClassName =
  "mb-1.5 block text-sm font-medium text-slate-700";

const sectionClassName =
  "rounded-xl border border-slate-200 bg-white p-5 sm:p-6";

function formatVND(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCartItemPrice(
  item: Cart["items"][number]
): number | null {
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

function LoadingSpinner() {
  return (
    <span
      aria-hidden="true"
      className="size-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600"
    />
  );
}

export default function CheckoutPage() {
  const t = useTranslations("CheckoutPage");
  const locale = useLocale();
  const router = useRouter();

  // Shipping Information
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingDistrict, setShippingDistrict] = useState("");
  const [note, setNote] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("COD");

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] =
    useState<number | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Cart
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);

  // Checkout State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Addresses
  const fetchAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    setAddressError(null);

    try {
      const data = await getAddresses();

      setAddresses(data);

      const defaultAddress = data.find(
        (address) => address.isDefault
      );

      const initialAddress = defaultAddress ?? data[0];

      if (initialAddress) {
        setSelectedAddressId(initialAddress.id);
        setShippingName(initialAddress.fullName);
        setShippingPhone(initialAddress.phone);
        setShippingAddress(initialAddress.address);
        setShippingCity(initialAddress.city);
        setShippingDistrict(initialAddress.district);
      } else {
        setSelectedAddressId(null);
        setShippingName("");
        setShippingPhone("");
        setShippingAddress("");
        setShippingCity("");
        setShippingDistrict("");
      }
    } catch (error) {
      console.error("Failed to get addresses:", error);

      setAddressError(t("errors.addressLoad"));
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchAddresses();
  }, [fetchAddresses]);

  // Fetch Cart
  const fetchCart = useCallback(async () => {
    setIsLoadingCart(true);
    setCartError(null);

    try {
      const data = await getCart();
      setCart(data);
    } catch (error) {
      console.error("Failed to get cart:", error);

      setCartError(t("errors.cartLoad"));
    } finally {
      setIsLoadingCart(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  // Select Shipping Address
  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id);

    setShippingName(address.fullName);
    setShippingPhone(address.phone);
    setShippingAddress(address.address);
    setShippingCity(address.city);
    setShippingDistrict(address.district);
  };

  // Calculate Order Total
  const orderTotal =
    cart?.items.reduce((sum, item) => {
      const price = getCartItemPrice(item);

      if (price === null) return sum;

      return sum + price * item.quantity;
    }, 0) ?? 0;

  // Create Order
  const handleCreateOrder = async () => {
    if (isSubmitting) return;

    if (!cart || cart.items.length === 0) {
      toast.error(t("errors.cartEmpty"));
      return;
    }

    if (cart.items.some((item) => getCartItemPrice(item) === null)) {
      toast.error(t("errors.invalidPrices"));
      return;
    }

    if (!selectedAddressId) {
      toast.error(t("errors.addressRequired"));
      return;
    }

    if (
      !shippingName.trim() ||
      !shippingPhone.trim() ||
      !shippingAddress.trim() ||
      !shippingCity.trim() ||
      !shippingDistrict.trim()
    ) {
      toast.error(t("errors.shippingRequired"));
      return;
    }

    // These payment methods have not been integrated yet.
    if (
      paymentMethod === "VNPAY" ||
      paymentMethod === "CREDIT_CARD"
    ) {
      toast.error(t("errors.paymentUnavailable"));
      return;
    }

    setIsSubmitting(true);

    const toastId = toast.loading(t("toast.placingOrder"));

    try {
      const result = await createOrder({
        shippingName: shippingName.trim(),
        shippingPhone: shippingPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        shippingCity: shippingCity.trim(),
        shippingDistrict: shippingDistrict.trim(),
        note: note.trim(),
        paymentMethod,
      });

      toast.success(t("toast.orderPlaced"), {
        id: toastId,
        description: t("toast.redirecting"),
      });

      router.push(`/orders/${result.order.id}`);
    } catch (error) {
      console.error("Failed to create order:", error);

      toast.error(t("errors.placeOrder"), {
        id: toastId,
      });

      setIsSubmitting(false);
    }
  };

  // Loading Cart
  if (isLoadingCart) {
    return (
      <main
        className="min-h-screen bg-[#f7f8fa] px-4 py-8"
        aria-busy="true"
        aria-label={t("loading.ariaLabel")}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <LoadingSpinner />

            <div>
              <p className="text-sm font-semibold text-slate-700">
                {t("loading.title")}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {t("loading.description")}
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="h-5 w-44 rounded bg-slate-200" />

                  <div className="mt-5 space-y-4">
                    <div className="h-11 rounded-lg bg-slate-100" />
                    <div className="h-11 rounded-lg bg-slate-100" />
                    <div className="h-11 rounded-lg bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>

            <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white p-6">
              <div className="h-5 w-36 rounded bg-slate-200" />

              <div className="mt-6 space-y-4">
                <div className="h-12 rounded-lg bg-slate-100" />
                <div className="h-12 rounded-lg bg-slate-100" />
                <div className="h-12 rounded-lg bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Cart Loading Error
  if (!cart) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#f7f8fa] px-4 py-10">
        <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            {t("cartError.title")}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {cartError ?? t("cartError.description")}
          </p>

          <button
            type="button"
            onClick={() => void fetchCart()}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {t("buttons.tryAgain")}
          </button>

          <div>
            <Link
              href="/cart"
              className="mt-4 inline-block text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              {t("buttons.returnToCart")}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // Empty Cart
  if (cart.items.length === 0) {
    return (
      <main className="flex min-h-screen items-start justify-center bg-[#f7f8fa] px-4 py-10">
        <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-blue-600">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              className="size-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l2.2 11.2A2 2 0 0 0 9.2 16h7.9a2 2 0 0 0 1.9-1.5L21 8H6M10 21h.01M17 21h.01"
              />
            </svg>
          </div>

          <h1 className="mt-4 text-xl font-semibold text-slate-900">
            {t("emptyCart.title")}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t("emptyCart.description")}
          </p>

          <Link
            href="/products"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {t("buttons.continueShopping")}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Page Header */}
        <header className="mb-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1">
            <span className="size-1.5 rounded-full bg-cyan-500" />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-800 sm:text-xs">
              {t("header.badge")}
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {t("header.title")}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t("header.description")}
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Checkout Details */}
          <div className="space-y-5">
            {/* Shipping Address */}
            <section className={sectionClassName}>
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-6h6v6"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t("address.title")}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {t("address.description")}
                  </p>
                </div>
              </div>

              {isLoadingAddresses ? (
                <div className="mt-5 flex items-center gap-3 rounded-lg border border-slate-200 p-4">
                  <LoadingSpinner />

                  <p className="text-sm text-slate-500">
                    {t("address.loading")}
                  </p>
                </div>
              ) : addressError ? (
                <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm text-rose-700">
                    {addressError}
                  </p>

                  <button
                    type="button"
                    onClick={() => void fetchAddresses()}
                    className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-800"
                  >
                    {t("buttons.tryAgain")}
                  </button>
                </div>
              ) : addresses.length === 0 ? (
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-800">
                    {t("address.emptyTitle")}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {t("address.emptyDescription")}
                  </p>

                  <Link
                    href="/addresses"
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {t("buttons.addAddress")}
                  </Link>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {addresses.map((address) => {
                    const isSelected =
                      selectedAddressId === address.id;

                    return (
                      <label
                        key={address.id}
                        className={`block cursor-pointer rounded-lg border p-4 transition-colors ${
                          isSelected
                            ? "border-blue-400 bg-blue-50/40"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shippingAddress"
                            checked={isSelected}
                            onChange={() => handleSelectAddress(address)}
                            className="mt-1 size-4 shrink-0 accent-blue-600"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="break-words text-sm font-semibold text-slate-900">
                                {address.fullName}
                              </p>

                              {address.isDefault && (
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                  {t("address.default")}
                                </span>
                              )}

                              {isSelected && (
                                <span className="rounded-full border border-blue-100 bg-white px-2 py-0.5 text-[11px] font-medium text-blue-700">
                                  {t("address.selected")}
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-sm text-slate-600">
                              {address.phone}
                            </p>

                            <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                              {address.address}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {address.city} - {address.district}
                            </p>

                            {address.postalCode && (
                              <p className="mt-1 text-sm text-slate-500">
                                {t("address.postalCode")}: {address.postalCode}
                              </p>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}

                  <Link
                    href="/addresses"
                    className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-blue-700 hover:text-blue-800"
                  >
                    {t("buttons.manageAddresses")}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
            </section>

            {/* Shipping Information */}
            <section className={sectionClassName}>
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {t("shipping.title")}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t("shipping.description")}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="shipping-name" className={labelClassName}>
                    {t("shipping.fields.fullName")}
                  </label>

                  <input
                    id="shipping-name"
                    type="text"
                    autoComplete="name"
                    value={shippingName}
                    onChange={(event) =>
                      setShippingName(event.target.value)
                    }
                    placeholder={t("shipping.placeholders.fullName")}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="shipping-phone" className={labelClassName}>
                    {t("shipping.fields.phone")}
                  </label>

                  <input
                    id="shipping-phone"
                    type="tel"
                    autoComplete="tel"
                    value={shippingPhone}
                    onChange={(event) =>
                      setShippingPhone(event.target.value)
                    }
                    placeholder={t("shipping.placeholders.phone")}
                    className={inputClassName}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="shipping-address"
                    className={labelClassName}
                  >
                    {t("shipping.fields.streetAddress")}
                  </label>

                  <input
                    id="shipping-address"
                    type="text"
                    autoComplete="street-address"
                    value={shippingAddress}
                    onChange={(event) =>
                      setShippingAddress(event.target.value)
                    }
                    placeholder={t("shipping.placeholders.streetAddress")}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="shipping-city" className={labelClassName}>
                    {t("shipping.fields.city")}
                  </label>

                  <input
                    id="shipping-city"
                    type="text"
                    autoComplete="address-level2"
                    value={shippingCity}
                    onChange={(event) =>
                      setShippingCity(event.target.value)
                    }
                    placeholder={t("shipping.placeholders.city")}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="shipping-district"
                    className={labelClassName}
                  >
                    {t("shipping.fields.district")}
                  </label>

                  <input
                    id="shipping-district"
                    type="text"
                    value={shippingDistrict}
                    onChange={(event) =>
                      setShippingDistrict(event.target.value)
                    }
                    placeholder={t("shipping.placeholders.district")}
                    className={inputClassName}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="order-note" className={labelClassName}>
                    {t("shipping.fields.orderNote")}
                    <span className="ml-1 font-normal text-slate-400">
                      ({t("shipping.optional")})
                    </span>
                  </label>

                  <textarea
                    id="order-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={t("shipping.placeholders.orderNote")}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className={sectionClassName}>
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {t("payment.title")}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t("payment.description")}
                </p>
              </div>

              <div className="space-y-3">
                {/* COD */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    paymentMethod === "COD"
                      ? "border-blue-400 bg-blue-50/40"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-1 size-4 accent-blue-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {t("payment.cod.title")}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {t("payment.cod.description")}
                    </p>
                  </div>
                </label>

                {/* Bank Transfer */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    paymentMethod === "BANK_TRANSFER"
                      ? "border-blue-400 bg-blue-50/40"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK_TRANSFER"
                    checked={paymentMethod === "BANK_TRANSFER"}
                    onChange={() =>
                      setPaymentMethod("BANK_TRANSFER")
                    }
                    className="mt-1 size-4 accent-blue-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {t("payment.bankTransfer.title")}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {t("payment.bankTransfer.description")}
                    </p>
                  </div>
                </label>

                {/* Credit Card - Not Integrated */}
                <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "CREDIT_CARD"}
                    disabled
                    readOnly
                    className="mt-1 size-4 accent-blue-600"
                    aria-label={t("payment.creditCard.ariaLabel")}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-600">
                        {t("payment.creditCard.title")}
                      </p>

                      <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {t("payment.comingSoon")}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {t("payment.creditCard.description")}
                    </p>
                  </div>
                </div>

                {/* VNPay - Not Integrated */}
                <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "VNPAY"}
                    disabled
                    readOnly
                    className="mt-1 size-4 accent-blue-600"
                    aria-label={t("payment.vnpay.ariaLabel")}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-600">
                        {t("payment.vnpay.title")}
                      </p>

                      <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {t("payment.comingSoon")}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {t("payment.vnpay.description")}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Place Order */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {t("placeOrder.title")}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {t("placeOrder.description")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleCreateOrder()}
                disabled={
                  isSubmitting ||
                  isLoadingAddresses ||
                  addresses.length === 0
                }
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    {t("buttons.placingOrder")}
                  </>
                ) : (
                  <>
                    {t("buttons.placeOrder")}
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                {t("placeOrder.confirmation")}
              </p>
            </section>
          </div>

          {/* Order Summary */}
          <aside className="lg:sticky lg:top-6">
            <section className={sectionClassName}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  {t("summary.title")}
                </h2>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {t("summary.itemCount", { count: cart.items.length })}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {cart.items.map((item) => {
                  const price = getCartItemPrice(item);
                  const subtotal =
                    price !== null ? price * item.quantity : null;

                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-medium leading-5 text-slate-800">
                          {item.product.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {t("summary.quantity", {
                            count: item.quantity,
                          })}
                        </p>
                      </div>

                      <p className="shrink-0 text-right text-sm font-semibold text-blue-800">
                        {subtotal !== null
                          ? formatVND(subtotal, locale)
                          : "—"}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-500">
                    {t("summary.subtotal")}
                  </span>

                  <span className="font-medium text-slate-00">
                    {formatVND(orderTotal, locale)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-500">
                    {t("summary.shipping")}
                  </span>

                  <span className="font-medium text-slate-600">
                    {t("summary.shippingCalculatedSeparately")}
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-base font-semibold text-slate-900">
                    {t("summary.total")}
                  </span>

                  <span className="text-right text-xl font-bold tracking-tight text-red-500">
                    {formatVND(orderTotal, locale)}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {t("summary.totalExcludesShipping")}
                </p>
              </div>

              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-800">
                  {t("summary.shippingTo")}
                </p>

                {selectedAddressId ? (
                  <>
                    <p className="mt-2 break-words text-sm text-slate-700">
                      {shippingName || t("summary.recipientFallback")}
                    </p>

                    <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                      {shippingAddress}
                      {shippingCity ? `, ${shippingCity}` : ""}
                      {shippingDistrict ? `, ${shippingDistrict}` : ""}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {t("summary.selectAddressToContinue")}
                  </p>
                )}
              </div>

              <Link
                href="/cart"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                <span aria-hidden="true">←</span>
                {t("buttons.returnToCart")}
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}