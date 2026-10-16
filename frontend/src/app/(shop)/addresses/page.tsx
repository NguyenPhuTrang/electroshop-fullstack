
"use client";

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

import { useCallback, useEffect, useState } from "react";

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

function FeedbackMessage({
  feedback,
}: {
  feedback: Feedback;
}) {
  if (!feedback) return null;

  const isSuccess = feedback.type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`rounded-lg border px-4 py-3 text-sm ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      <div className="flex items-start gap-2">
        <span aria-hidden="true" className="font-semibold">
          {isSuccess ? "✓" : "!"}
        </span>
        <p>{feedback.message}</p>
      </div>
    </div>
  );
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingAddress, setEditingAddress] =
    useState<Address | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [feedback, setFeedback] = useState<Feedback>(null);
  const [deletingAddressId, setDeletingAddressId] =
    useState<number | null>(null);

  // Fetch Addresses
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (error) {
      console.error("Failed to get addresses:", error);
      setLoadError("Unable to load your addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAddresses();
  }, [fetchAddresses]);

  // Create Address
  const handleCreateAddress = async (
    data: CreateAddressData
  ) => {
    try {
      const newAddress = await createAddress(data);

      setAddresses((prev) => [...prev, newAddress]);
      setIsCreating(false);

      setFeedback({
        type: "success",
        message: "Your address has been added successfully.",
      });
    } catch (error) {
      console.error("Failed to create address:", error);

      setFeedback({
        type: "error",
        message: "Unable to add your address. Please try again.",
      });
    }
  };

  // Update Address
  const handleUpdateAddress = async (
    data: CreateAddressData
  ) => {
    if (!editingAddress) return;

    try {
      const updatedAddress = await updateAddress(
        editingAddress.id,
        data
      );

      setAddresses((prev) =>
        prev.map((address) =>
          address.id === updatedAddress.id
            ? updatedAddress
            : address
        )
      );

      setEditingAddress(null);

      setFeedback({
        type: "success",
        message: "Your address has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update address:", error);

      setFeedback({
        type: "error",
        message: "Unable to update your address. Please try again.",
      });
    }
  };

  // Delete Address
  const handleDeleteAddress = async (addressId: number) => {
    if (deletingAddressId !== null) return;

    setDeletingAddressId(addressId);
    setFeedback(null);

    try {
      await deleteAddress(addressId);

      setAddresses((prev) =>
        prev.filter((address) => address.id !== addressId)
      );

      setFeedback({
        type: "success",
        message: "Your address has been deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete address:", error);

      setFeedback({
        type: "error",
        message: "Unable to delete your address. Please try again.",
      });
    } finally {
      setDeletingAddressId(null);
    }
  };

  // Loading State
  if (loading) {
    return (
      <main
        className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8"
        aria-busy="true"
        aria-label="Loading addresses"
      >
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="size-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600"
            />

            <div>
              <p className="text-sm font-semibold text-slate-700">
                Loading your addresses...
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Please wait while we fetch your information.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-64 max-w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="h-5 w-40 rounded bg-slate-200" />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="h-12 rounded-lg bg-slate-100" />
                <div className="h-12 rounded-lg bg-slate-100" />
                <div className="h-12 rounded-lg bg-slate-100" />
                <div className="h-12 rounded-lg bg-slate-100" />
              </div>

              <div className="mt-5 flex gap-2">
                <div className="h-10 w-20 rounded-lg bg-slate-100" />
                <div className="h-10 w-20 rounded-lg bg-rose-50" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Page Header */}
      <section className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1">
            <span className="size-1.5 rounded-full bg-cyan-500" />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-800 sm:text-xs">
              Address Book
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            My Addresses
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage your saved addresses for a smoother checkout experience.
          </p>
        </div>

        {!isCreating && !editingAddress && (
          <button
            type="button"
            onClick={() => {
              setIsCreating(true);
              setFeedback(null);
            }}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            Add Address
          </button>
        )}
      </section>

      {/* Feedback */}
      <div className="mb-5">
        <FeedbackMessage feedback={feedback} />
      </div>

      {/* Loading Error */}
      {loadError ? (
        <section className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-rose-50 text-lg font-semibold text-rose-600">
            !
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Unable to Load Addresses
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {loadError}
          </p>

          <button
            type="button"
            onClick={() => void fetchAddresses()}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </section>
      ) : (
        <>
          {/* Address List */}
          {addresses.length === 0 ? (
            <section className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-blue-600">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  className="size-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-6h6v6"
                  />
                </svg>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-800">
                No Saved Addresses
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You haven't added any addresses yet. Add an address to make
                your next checkout easier.
              </p>

              {!isCreating && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(true);
                    setFeedback(null);
                  }}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <span aria-hidden="true">+</span>
                  Add Your First Address
                </button>
              )}
            </section>
          ) : (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-800">
                  Saved Addresses
                </h2>

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {addresses.length}{" "}
                  {addresses.length === 1 ? "address" : "addresses"}
                </span>
              </div>

              <div className="space-y-4">
                {addresses.map((address) => (
                  <article
                    key={address.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-cyan-200 sm:p-6"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600">
                          <svg
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
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

                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Recipient
                          </p>

                          <h3 className="mt-1 break-words text-base font-semibold text-slate-900">
                            {address.fullName}
                          </h3>
                        </div>
                      </div>

                      {address.isDefault && (
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Default Address
                        </span>
                      )}
                    </div>

                    {/* Address Details */}
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Phone Number
                        </p>

                        <p className="mt-1.5 break-words text-sm font-medium text-slate-700">
                          {address.phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          City
                        </p>

                        <p className="mt-1.5 break-words text-sm font-medium text-slate-700">
                          {address.city}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          District
                        </p>

                        <p className="mt-1.5 break-words text-sm font-medium text-slate-700">
                          {address.district}
                        </p>
                      </div>

                      {address.postalCode && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Postal Code
                          </p>

                          <p className="mt-1.5 break-words text-sm font-medium text-slate-700">
                            {address.postalCode}
                          </p>
                        </div>
                      )}

                      <div className="sm:col-span-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Street Address
                        </p>

                        <p className="mt-1.5 break-words text-sm leading-6 text-slate-700">
                          {address.address}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddress(address);
                          setIsCreating(false);
                          setFeedback(null);
                        }}
                        disabled={deletingAddressId !== null}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <svg
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.7}
                          className="size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14 6 4 4M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"
                          />
                        </svg>
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDeleteAddress(address.id)}
                        disabled={deletingAddressId !== null}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingAddressId === address.id ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="size-4 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600"
                            />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.7}
                              className="size-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"
                              />
                            </svg>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Create Address Form */}
      {isCreating && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add New Address
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the details for your new delivery address.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setFeedback(null);
              }}
              aria-label="Close address form"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            >
              ×
            </button>
          </div>

          <AddressForm
            onSubmit={handleCreateAddress}
            buttonText="Save Address"
          />

          <button
            type="button"
            onClick={() => {
              setIsCreating(false);
              setFeedback(null);
            }}
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </section>
      )}

      {/* Edit Address Form */}
      {editingAddress && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Edit Address
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update your saved delivery address.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingAddress(null);
                setFeedback(null);
              }}
              aria-label="Close address form"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            >
              ×
            </button>
          </div>

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
            buttonText="Update Address"
          />

          <button
            type="button"
            onClick={() => {
              setEditingAddress(null);
              setFeedback(null);
            }}
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </section>
      )}
    </main>
  );
}
