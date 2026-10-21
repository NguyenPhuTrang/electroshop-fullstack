"use client";

import { useEffect, useState, type FormEvent } from "react";

import { useProductSpecifications } from "@/src/features/product/hooks/useProductSpecifications";

import {
  createProductSpecification,
  updateProductSpecification,
  deleteProductSpecification,
  type ProductSpecification,
  type CreateProductSpecificationInput,
  type UpdateProductSpecificationInput,
} from "@/src/features/product/services/product-specification.service";

type SpecificationFormValues = {
  groupName: string;
  label: string;
  value: string;
  sortOrder: string;
};

type ProductSpecificationManagerProps = {
  productId: number;
  onLoadingChange?: (loading: boolean) => void;
};

const INITIAL_FORM: SpecificationFormValues = {
  groupName: "",
  label: "",
  value: "",
  sortOrder: "0",
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export default function ProductSpecificationManager({
  productId,
  onLoadingChange,
}: ProductSpecificationManagerProps) {
  const {
    specifications,
    loading,
    error,
    refetch,
  } = useProductSpecifications(productId);

  const [form, setForm] =
    useState<SpecificationFormValues>(INITIAL_FORM);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Notify the parent page of the actual API loading state.
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const handleChange = <K extends keyof SpecificationFormValues>(
    field: K,
    value: SpecificationFormValues[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setActionError(null);
    setSuccessMessage(null);
  };

  const openCreateForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setActionError(null);
    setSuccessMessage(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (submitting || deletingId !== null) {
      return;
    }

    setIsFormOpen(false);
    setForm(INITIAL_FORM);
    setEditingId(null);
    setActionError(null);
  };

  const handleEdit = (specification: ProductSpecification) => {
    setEditingId(specification.id);

    setForm({
      groupName: specification.groupName ?? "",
      label: specification.label,
      value: specification.value,
      sortOrder: String(specification.sortOrder),
    });

    setActionError(null);
    setSuccessMessage(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setActionError(null);
    setSuccessMessage(null);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      setActionError("Invalid product ID.");
      return;
    }

    const label = form.label.trim();
    const value = form.value.trim();
    const rawSortOrder = form.sortOrder.trim();
    const sortOrder = Number(rawSortOrder);

    if (!label) {
      setActionError("Specification label is required.");
      return;
    }

    if (!value) {
      setActionError("Specification value is required.");
      return;
    }

    if (
      rawSortOrder === "" ||
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setActionError(
        "Sort order must be a non-negative whole number."
      );
      return;
    }

    const commonPayload = {
      groupName: form.groupName.trim() || null,
      label,
      value,
      sortOrder,
    };

    const isEditing = editingId !== null;

    setSubmitting(true);

    try {
      if (isEditing) {
        const payload: UpdateProductSpecificationInput =
          commonPayload;

        await updateProductSpecification(editingId, payload);
      } else {
        const payload: CreateProductSpecificationInput = {
          productId,
          ...commonPayload,
        };

        await createProductSpecification(payload);
      }

      setForm(INITIAL_FORM);
      setEditingId(null);
      setIsFormOpen(false);

      setSuccessMessage(
        isEditing
          ? "Specification updated successfully."
          : "Specification created successfully."
      );

      try {
        await refetch();
      } catch {
        setActionError(
          "Specification was saved, but the list could not be refreshed. Please click Refresh to try again."
        );
      }
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (
    specification: ProductSpecification
  ) => {
    if (submitting || deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Delete specification "${specification.label}"?`
    );

    if (!confirmed) {
      return;
    }

    setActionError(null);
    setSuccessMessage(null);
    setDeletingId(specification.id);

    try {
      await deleteProductSpecification(specification.id);

      if (editingId === specification.id) {
        setForm(INITIAL_FORM);
        setEditingId(null);
        setIsFormOpen(false);
      }

      setSuccessMessage("Specification deleted successfully.");

      await refetch();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  const sortedSpecifications = [...specifications].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      (a.groupName ?? "").localeCompare(b.groupName ?? "") ||
      a.label.localeCompare(b.label)
  );

  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
      >
        Invalid product ID.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Product Management
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            Product Specifications
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage grouped product details, labels, values, and display order.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            <span className="size-1.5 rounded-full bg-cyan-500" />

            {specifications.length}{" "}
            {specifications.length === 1
              ? "specification"
              : "specifications"}
          </span>

          <button
            type="button"
            onClick={openCreateForm}
            disabled={submitting || deletingId !== null || loading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>

            Add Specification
          </button>
        </div>
      </header>

      {/* Global Action Messages */}
      {!isFormOpen && actionError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {actionError}
        </div>
      )}

      {!isFormOpen && successMessage && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {successMessage}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !submitting &&
              deletingId === null
            ) {
              closeForm();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="specification-form-title"
            className="my-auto w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Modal Heading */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h3
                  id="specification-form-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {editingId === null
                    ? "Add Specification"
                    : "Edit Specification"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId === null
                    ? "Enter the details for the new specification."
                    : `Update specification #${editingId}.`}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={submitting || deletingId !== null}
                aria-label="Close specification form"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-5 py-5 sm:px-6">
              {actionError && (
                <div
                  role="alert"
                  className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  {actionError}
                </div>
              )}

              <form
                id="specification-form"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Group Name */}
                  <div>
                    <label
                      htmlFor="specification-group"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Group Name
                      <span className="ml-1 font-normal text-slate-400">
                        (Optional)
                      </span>
                    </label>

                    <input
                      id="specification-group"
                      type="text"
                      value={form.groupName}
                      onChange={(event) =>
                        handleChange("groupName", event.target.value)
                      }
                      disabled={submitting || deletingId !== null}
                      placeholder="e.g. Display"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                    />
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label
                      htmlFor="specification-sort-order"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Sort Order
                    </label>

                    <input
                      id="specification-sort-order"
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.sortOrder}
                      onChange={(event) =>
                        handleChange("sortOrder", event.target.value)
                      }
                      disabled={submitting || deletingId !== null}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                    />

                    <p className="mt-1 text-xs text-slate-500">
                      Lower numbers appear first.
                    </p>
                  </div>
                </div>

                {/* Label */}
                <div>
                  <label
                    htmlFor="specification-label"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Label <span className="text-rose-500">*</span>
                  </label>

                  <input
                    id="specification-label"
                    type="text"
                    required
                    value={form.label}
                    onChange={(event) =>
                      handleChange("label", event.target.value)
                    }
                    disabled={submitting || deletingId !== null}
                    placeholder="e.g. Screen Size"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>

                {/* Value */}
                <div>
                  <label
                    htmlFor="specification-value"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Value <span className="text-rose-500">*</span>
                  </label>

                  <textarea
                    id="specification-value"
                    required
                    rows={3}
                    value={form.value}
                    onChange={(event) =>
                      handleChange("value", event.target.value)
                    }
                    disabled={submitting || deletingId !== null}
                    placeholder="e.g. 6.7-inch OLED"
                    className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </form>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={closeForm}
                disabled={submitting || deletingId !== null}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="specification-form"
                disabled={submitting || deletingId !== null}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Specification"
                    : "Add Specification"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Existing Specifications */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              Existing Specifications
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {specifications.length}{" "}
              {specifications.length === 1
                ? "specification"
                : "specifications"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={loading || submitting || deletingId !== null}
            className="self-start rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error ? (
          <div className="p-5">
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </div>

            <button
              type="button"
              onClick={() => void refetch()}
              disabled={loading}
              className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Try Again
            </button>
          </div>
        ) : loading && specifications.length === 0 ? (
          <p
            className="px-5 py-12 text-center text-sm text-slate-500"
            aria-busy="true"
          >
            Loading specifications...
          </p>
        ) : sortedSpecifications.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <h4 className="font-medium text-slate-800">
              No specifications yet
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              Click Add Specification to add the first specification.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Group
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Label
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Value
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Order
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sortedSpecifications.map((specification) => (
                  <tr
                    key={specification.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      {specification.groupName ? (
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {specification.groupName}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Ungrouped
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {specification.label}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        ID: {specification.id}
                      </div>
                    </td>

                    <td className="max-w-md whitespace-pre-wrap break-words px-5 py-4 text-sm leading-6 text-slate-600">
                      {specification.value}
                    </td>

                    <td className="px-5 py-4 text-center text-sm tabular-nums text-slate-600">
                      {specification.sortOrder}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(specification)}
                          disabled={
                            submitting || deletingId !== null
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(specification)}
                          disabled={
                            submitting || deletingId !== null
                          }
                          className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === specification.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}