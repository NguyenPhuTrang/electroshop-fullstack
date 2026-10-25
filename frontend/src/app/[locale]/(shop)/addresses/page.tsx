"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import AddressForm from "@/src/features/address/components/address.Form";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "@/src/features/address/services/address.service";

import type {
  Address,
  CreateAddressData,
} from "@/src/features/address/types/address";

export default function AddressesPage() {
  const t = useTranslations("AddressesPage");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(
    null
  );

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (error) {
      console.error("Failed to get addresses:", error);
      setLoadError(t("loadError.description"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchAddresses();
  }, [fetchAddresses]);

  // Lock background scrolling and allow closing the create-address modal with Escape.
  useEffect(() => {
    if (!isCreating) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCreating(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCreating]);

  // Create address
  const handleCreateAddress = async (data: CreateAddressData) => {
    const toastId = toast.loading(t("toasts.adding"));

    try {
      const newAddress = await createAddress(data);

      setAddresses((prev) => [...prev, newAddress]);
      setIsCreating(false);

      toast.success(t("toasts.added"), {
        id: toastId,
      });
    } catch (error) {
      console.error("Failed to create address:", error);

      toast.error(t("toasts.addFailed"), {
        id: toastId,
      });
    }
  };

  // Update address
  const handleUpdateAddress = async (data: CreateAddressData) => {
    if (!editingAddress) return;

    const toastId = toast.loading(t("toasts.updating"));

    try {
      const updatedAddress = await updateAddress(editingAddress.id, data);

      setAddresses((prev) =>
        prev.map((address) =>
          address.id === updatedAddress.id ? updatedAddress : address
        )
      );

      setEditingAddress(null);

      toast.success(t("toasts.updated"), {
        id: toastId,
      });
    } catch (error) {
      console.error("Failed to update address:", error);

      toast.error(t("toasts.updateFailed"), {
        id: toastId,
      });
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId: number) => {
    if (deletingAddressId !== null) return;

    const toastId = toast.loading(t("toasts.deleting"));
    setDeletingAddressId(addressId);

    try {
      await deleteAddress(addressId);

      setAddresses((prev) =>
        prev.filter((address) => address.id !== addressId)
      );

      toast.success(t("toasts.deleted"), {
        id: toastId,
      });
    } catch (error) {
      console.error("Failed to delete address:", error);

      toast.error(t("toasts.deleteFailed"), {
        id: toastId,
      });
    } finally {
      setDeletingAddressId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1440px] space-y-6 px-3 py-5 sm:px-4 sm:py-7 lg:px-6 lg:py-8">
        <div className="animate-pulse">
          <div className="mb-2 h-7 w-48 rounded-lg bg-slate-200" />
          <div className="h-4 w-72 max-w-full rounded bg-slate-100" />
        </div>

        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="h-6 w-20 rounded-full bg-slate-100" />
              </div>

              <div className="mb-3 h-4 w-32 rounded bg-slate-100" />
              <div className="mb-2 h-4 w-3/4 rounded bg-slate-100" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />

              <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
                <div className="h-9 w-20 rounded-lg bg-slate-100" />
                <div className="h-9 w-20 rounded-lg bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 px-3 py-5 sm:px-4 sm:py-7 lg:px-6 lg:py-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t("page.title")}
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {t("page.description")}
          </p>
        </div>

        {!isCreating && !editingAddress && (
          <button
            type="button"
            onClick={() => {
              setEditingAddress(null);
              setIsCreating(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            {t("buttons.addAddress")}
          </button>
        )}
      </div>

      {/* Load Error */}
      {loadError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-5"
        >
          <div className="flex items-start gap-3">
            <svg
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-rose-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>

            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-rose-800">
                {t("loadError.title")}
              </h2>

              <p className="mt-1 text-sm leading-6 text-rose-700">
                {loadError}
              </p>

              <button
                type="button"
                onClick={() => void fetchAddresses()}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                <svg
                  aria-hidden="true"
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 7v5h-5" />
                  <path d="M4 17v-5h5" />
                  <path d="M5.64 9A7 7 0 0 1 17.5 6.5L20 12" />
                  <path d="M4 12l2.5 5.5A7 7 0 0 0 18.36 15" />
                </svg>
                {t("buttons.tryAgain")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Address Modal */}
      {isCreating && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsCreating(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-address-title"
            className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-blue-100 bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-blue-50/60 px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="add-address-title"
                  className="text-base font-semibold text-slate-900"
                >
                  {t("createModal.title")}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t("createModal.description")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreating(false)}
                aria-label={t("accessibility.closeAddDialog")}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg
                  aria-hidden="true"
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m18 6-12 12" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <AddressForm
                onSubmit={handleCreateAddress}
                buttonText={t("buttons.saveAddress")}
              />

              <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {t("buttons.cancel")}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Edit Address Form */}
      {editingAddress && (
        <section className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-cyan-50/50 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {t("editForm.title")}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {t("editForm.description")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEditingAddress(null)}
              aria-label={t("accessibility.closeEditForm")}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <svg
                aria-hidden="true"
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m18 6-12 12" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="p-5 sm:p-6">
            <AddressForm
              initialData={{
                fullName: editingAddress.fullName,
                phone: editingAddress.phone,
                address: editingAddress.address,
                city: editingAddress.city,
                district: editingAddress.district,
                postalCode: editingAddress.postalCode ?? undefined,
                isDefault: editingAddress.isDefault,
              }}
              onSubmit={handleUpdateAddress}
              buttonText={t("buttons.updateAddress")}
            />

            <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setEditingAddress(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {t("buttons.cancel")}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Address List */}
      {!loadError && addresses.length > 0 && (
        <div className="space-y-4">
          {addresses.map((address) => (
            <article
              key={address.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 sm:p-6"
            >
              {/* Address Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <svg
                      aria-hidden="true"
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words text-base font-semibold text-slate-900">
                        {address.fullName}
                      </h2>

                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          <svg
                            aria-hidden="true"
                            className="size-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m5 12 4 4L19 6" />
                          </svg>
                          {t("badges.defaultAddress")}
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-sm text-slate-500">
                      {address.phone}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingAddress(address);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <svg
                      aria-hidden="true"
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z" />
                    </svg>
                    {t("buttons.edit")}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDeleteAddress(address.id)}
                    disabled={deletingAddressId !== null}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingAddressId === address.id ? (
                      <>
                        <svg
                          aria-hidden="true"
                          className="size-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4Z"
                          />
                        </svg>
                        {t("buttons.deleting")}
                      </>
                    ) : (
                      <>
                        <svg
                          aria-hidden="true"
                          className="size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="m19 6-1 14H6L5 6" />
                          <path d="M10 11v5" />
                          <path d="M14 11v5" />
                        </svg>
                        {t("buttons.delete")}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Address Details */}
              <div className="ml-0 mt-5 border-t border-slate-100 pt-4 sm:ml-14">
                <div className="flex items-start gap-2">
                  <svg
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>

                  <div className="min-w-0 text-sm leading-6 text-slate-600">
                    <p className="break-words font-medium text-slate-700">
                      {address.address}
                    </p>

                    <p className="break-words">
                      {[address.district, address.city]
                        .filter(Boolean)
                        .join(", ")}
                      {address.postalCode
                        ? ` ${address.postalCode}`
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loadError &&
        addresses.length === 0 &&
        !isCreating &&
        !editingAddress && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center sm:px-8">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg
                aria-hidden="true"
                className="size-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              {t("emptyState.title")}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {t("emptyState.description")}
            </p>

            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                aria-hidden="true"
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              {t("emptyState.addFirstAddress")}
            </button>
          </div>
        )}
    </div>
  );
}