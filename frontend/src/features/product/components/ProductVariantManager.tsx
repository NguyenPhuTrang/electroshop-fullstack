
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import type {
  ProductColor,
  ProductVariant,
} from "@/src/features/product/types/product";

import { useProductVariants } from "@/src/features/product/hooks/useProductVariants";

import { getProductColors } from "@/src/features/product/services/product-color.service";

import {
  createProductVariant,
  updateProductVariant,
  deactivateProductVariant,
  type CreateProductVariantInput,
  type UpdateProductVariantInput,
  type EditableProductVariantStatus,
} from "@/src/features/product/services/product-variant.service";

type FormStatus = ProductVariant["status"];

type VariantFormValues = {
  sku: string;
  storage: string;
  colorId: string;
  price: string;
  salePrice: string;
  stock: string;
  status: FormStatus;
};

type ProductVariantManagerProps = {
  productId: number;
  onLoadingChange?: (loading: boolean) => void;
};

const INITIAL_FORM: VariantFormValues = {
  sku: "",
  storage: "",
  colorId: "",
  price: "",
  salePrice: "",
  stock: "0",
  status: "ACTIVE",
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function formatPrice(
  value: string | number | null,
  locale: string
): string {
  if (value === null || value === "") {
    return "—";
  }

  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "—";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(price);
}

function getStatusClass(status: ProductVariant["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700";

    case "INACTIVE":
      return "bg-slate-100 text-slate-600";

    case "OUT_OF_STOCK":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getColorName(
  variant: ProductVariant,
  colors: ProductColor[]
): string | null {
  if (variant.colorOption?.name) {
    return variant.colorOption.name;
  }

  const color = colors.find((item) => item.id === variant.colorId);

  return color?.name ?? null;
}

function getColorHex(
  variant: ProductVariant,
  colors: ProductColor[]
): string | null {
  const color = colors.find((item) => item.id === variant.colorId);

  return color?.hexCode ?? null;
}

export default function ProductVariantManager({
  productId,
  onLoadingChange,
}: ProductVariantManagerProps) {
  const t = useTranslations("ProductVariantManager");
  const locale = useLocale();
  const genericError = t("errors.generic");

  const {
    variants,
    loading,
    error,
    refetch,
  } = useProductVariants(productId);

  const [colors, setColors] = useState<ProductColor[]>([]);
  const [colorsLoading, setColorsLoading] = useState(false);
  const [colorsError, setColorsError] = useState<string | null>(null);

  const [form, setForm] = useState<VariantFormValues>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Keep the parent page skeleton synchronized with the real API loading state.
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // Load the colors belonging to this product.
  useEffect(() => {
    let cancelled = false;

    const loadColors = async () => {
      setColorsLoading(true);
      setColorsError(null);
      setColors([]);

      try {
        const result = await getProductColors(productId);

        if (!cancelled) {
          setColors(result);
        }
      } catch (error) {
        if (!cancelled) {
          setColorsError(getErrorMessage(error, genericError));
        }
      } finally {
        if (!cancelled) {
          setColorsLoading(false);
        }
      }
    };

    if (!Number.isInteger(productId) || productId <= 0) {
      setColors([]);
      setColorsLoading(false);
      return;
    }

    void loadColors();

    return () => {
      cancelled = true;
    };
  }, [productId, genericError]);

  const selectedColor =
    colors.find((color) => String(color.id) === form.colorId) ?? null;

  const handleChange = <K extends keyof VariantFormValues>(
    field: K,
    value: VariantFormValues[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setActionError(null);
  };

  const openCreateForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setActionError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) {
      return;
    }

    setIsFormOpen(false);
    setForm(INITIAL_FORM);
    setEditingId(null);
    setActionError(null);
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingId(variant.id);

    setForm({
      sku: variant.sku,
      storage: variant.storage ?? "",
      colorId: variant.colorId === null ? "" : String(variant.colorId),
      price: String(variant.price),
      salePrice:
        variant.salePrice === null ? "" : String(variant.salePrice),
      stock: String(variant.stock),
      status: variant.status,
    });

    setActionError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setActionError(null);

    if (!Number.isInteger(productId) || productId <= 0) {
      setActionError(t("errors.invalidProductId"));
      return;
    }

    const price = Number(form.price);

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setActionError(t("errors.priceMustBePositive"));
      return;
    }

    const salePrice =
      form.salePrice.trim() === "" ? null : Number(form.salePrice);

    if (
      salePrice !== null &&
      (!Number.isFinite(salePrice) ||
        salePrice < 0 ||
        salePrice > price)
    ) {
      setActionError(t("errors.invalidSalePrice"));
      return;
    }

    const stock = Number(form.stock);

    if (
      form.stock.trim() === "" ||
      !Number.isFinite(stock) ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setActionError(t("errors.invalidStock"));
      return;
    }

    const colorId =
      form.colorId.trim() === "" ? null : Number(form.colorId);

    if (
      colorId !== null &&
      (!Number.isInteger(colorId) || colorId <= 0)
    ) {
      setActionError(t("errors.invalidColor"));
      return;
    }

    if (
      colorId !== null &&
      !colors.some((color) => color.id === colorId)
    ) {
      setActionError(t("errors.colorUnavailable"));
      return;
    }

    const commonPayload = {
      storage: form.storage.trim() || null,
      colorId,
      price,
      salePrice,
      stock,
    };

    const isEditing = editingId !== null;

    const toastId = toast.loading(
      t(isEditing ? "toast.loadingUpdate" : "toast.loadingCreate")
    );

    setSubmitting(true);

    try {
      if (isEditing) {
        const payload: UpdateProductVariantInput = {
          ...commonPayload,
          ...(form.status !== "OUT_OF_STOCK"
            ? {
                status: form.status as EditableProductVariantStatus,
              }
            : {}),
        };

        await updateProductVariant(editingId, payload);
      } else {
        const payload: CreateProductVariantInput = {
          ...commonPayload,
          status:
            form.status === "OUT_OF_STOCK" ? "ACTIVE" : form.status,
        };

        await createProductVariant(productId, payload);
      }

      setForm(INITIAL_FORM);
      setEditingId(null);
      setIsFormOpen(false);

      toast.success(
        t(isEditing ? "toast.updated" : "toast.created"),
        { id: toastId }
      );

      try {
        await refetch();
      } catch {
        toast.error(t("toast.refreshFailedAfterSave"));
      }
    } catch (error) {
      console.error("Failed to save product variant:", error);
      setActionError(getErrorMessage(error, genericError));

      toast.error(
        t(isEditing ? "toast.updateFailed" : "toast.createFailed"),
        { id: toastId }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (variant: ProductVariant) => {
    if (variant.status !== "ACTIVE") {
      return;
    }

    const confirmed = window.confirm(
      t("confirmDeactivate", { sku: variant.sku })
    );

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading(t("toast.loadingDeactivate"));
    setDeactivatingId(variant.id);

    try {
      await deactivateProductVariant(variant.id);

      if (editingId === variant.id) {
        setForm(INITIAL_FORM);
        setEditingId(null);
        setIsFormOpen(false);
        setActionError(null);
      }

      toast.success(t("toast.deactivated"), {
        id: toastId,
      });

      try {
        await refetch();
      } catch {
        toast.error(t("toast.refreshFailedAfterDeactivate"));
      }
    } catch (error) {
      console.error("Failed to deactivate product variant:", error);

      toast.error(t("toast.deactivateFailed"), {
        id: toastId,
      });
    } finally {
      setDeactivatingId(null);
    }
  };

  if (!Number.isInteger(productId) || productId <= 0) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
      >
        {t("errors.invalidProductId")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            {t("page.eyebrow")}
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            {t("page.title")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t("page.description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            <span className="size-1.5 rounded-full bg-cyan-500" />
            {t("page.variantCount", { count: variants.length })}
          </span>

          <button
            type="button"
            onClick={openCreateForm}
            disabled={submitting || deactivatingId !== null || loading}
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

            {t("buttons.createVariant")}
          </button>
        </div>
      </header>

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !submitting
            ) {
              closeForm();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="variant-form-title"
            className="my-auto w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Modal heading */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h3
                  id="variant-form-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {editingId === null
                    ? t("modal.createTitle")
                    : t("modal.editTitle")}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId === null
                    ? t("modal.createDescription")
                    : t("modal.editDescription", { id: editingId })}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                aria-label={t("modal.closeLabel")}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
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
                id="variant-form"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Storage */}
                  <div>
                    <label
                      htmlFor="variant-storage"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      {t("fields.storage")}
                    </label>

                    <input
                      id="variant-storage"
                      type="text"
                      value={form.storage}
                      onChange={(event) =>
                        handleChange("storage", event.target.value)
                      }
                      disabled={submitting}
                      placeholder={t("fields.storagePlaceholder")}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label
                      htmlFor="variant-color"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      {t("fields.color")}
                    </label>

                    <select
                      id="variant-color"
                      value={form.colorId}
                      onChange={(event) =>
                        handleChange("colorId", event.target.value)
                      }
                      disabled={submitting || colorsLoading}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >
                      <option value="">{t("fields.noColor")}</option>

                      {form.colorId &&
                        !colors.some(
                          (color) => String(color.id) === form.colorId
                        ) && (
                          <option value={form.colorId}>
                            {t("fields.previousColorUnavailable")}
                          </option>
                        )}

                      {colors.map((color) => (
                        <option key={color.id} value={String(color.id)}>
                          {color.name}
                        </option>
                      ))}
                    </select>

                    {selectedColor && (
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="size-5 rounded-full border border-slate-200"
                          style={{
                            backgroundColor:
                              selectedColor.hexCode ?? "#e2e8f0",
                          }}
                        />

                        <span className="text-sm font-medium text-slate-700">
                          {selectedColor.name}
                        </span>
                      </div>
                    )}

                    {colorsLoading && (
                      <p className="mt-1 text-xs text-slate-500">
                        {t("fields.loadingColors")}
                      </p>
                    )}

                    {!colorsLoading &&
                      !colorsError &&
                      colors.length === 0 && (
                        <p className="mt-1 text-xs text-slate-500">
                          {t("fields.noColorsAvailable")}
                        </p>
                      )}

                    {colorsError && (
                      <p
                        role="alert"
                        className="mt-1 text-xs text-rose-600"
                      >
                        {t("fields.loadColorsError", {
                          error: colorsError,
                        })}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label
                      htmlFor="variant-price"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      {t("fields.price")}{" "}
                      <span className="text-rose-500">*</span>
                    </label>

                    <input
                      id="variant-price"
                      type="number"
                      min="0.01"
                      step="any"
                      required
                      value={form.price}
                      onChange={(event) =>
                        handleChange("price", event.target.value)
                      }
                      disabled={submitting}
                      placeholder={t("fields.pricePlaceholder")}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                    />
                  </div>

                  {/* Sale Price */}
                  <div>
                    <label
                      htmlFor="variant-sale-price"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      {t("fields.salePrice")}
                    </label>

                    <input
                      id="variant-sale-price"
                      type="number"
                      min="0"
                      step="any"
                      value={form.salePrice}
                      onChange={(event) =>
                        handleChange("salePrice", event.target.value)
                      }
                      disabled={submitting}
                      placeholder={t("fields.salePricePlaceholder")}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label
                      htmlFor="variant-stock"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      {t("fields.stock")}{" "}
                      <span className="text-rose-500">*</span>
                    </label>

                    <input
                      id="variant-stock"
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.stock}
                      onChange={(event) =>
                        handleChange("stock", event.target.value)
                      }
                      disabled={submitting}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      htmlFor="variant-status"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      {t("fields.status")}
                    </label>

                    <select
                      id="variant-status"
                      value={form.status}
                      onChange={(event) =>
                        handleChange(
                          "status",
                          event.target.value as FormStatus
                        )
                      }
                      disabled={submitting}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                    >
                      {form.status === "OUT_OF_STOCK" && (
                        <option value="OUT_OF_STOCK" disabled>
                          {t("statuses.outOfStock")} —{" "}
                          {t("fields.managedByInventory")}
                        </option>
                      )}

                      <option value="ACTIVE">
                        {t("statuses.active")}
                      </option>
                      <option value="INACTIVE">
                        {t("statuses.inactive")}
                      </option>
                    </select>

                    {form.status === "OUT_OF_STOCK" && (
                      <p className="mt-1 text-xs text-slate-500">
                        {t("fields.outOfStockHelp")}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal actions */}
            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("buttons.cancel")}
              </button>

              <button
                type="submit"
                form="variant-form"
                disabled={submitting || deactivatingId !== null}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? t("buttons.saving")
                  : editingId !== null
                    ? t("buttons.updateVariant")
                    : t("buttons.createVariant")}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Existing Variants */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              {t("table.existingTitle")}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {t("page.variantCount", { count: variants.length })}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={loading || submitting || deactivatingId !== null}
            className="self-start rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            {loading ? t("buttons.refreshing") : t("buttons.refresh")}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="m-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        {loading && variants.length === 0 ? (
          <p
            className="px-5 py-12 text-center text-sm text-slate-500"
            aria-busy="true"
          >
            {t("states.loadingVariants")}
          </p>
        ) : variants.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <h4 className="font-medium text-slate-800">
              {t("states.noVariantsTitle")}
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              {t("states.noVariantsDescription")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("table.sku")}
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("table.storage")}
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("table.color")}
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("table.price")}
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("table.stock")}
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("table.status")}
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {variants.map((variant) => {
                  const colorName = getColorName(variant, colors);
                  const colorHex = getColorHex(variant, colors);

                  const statusLabel =
                    variant.status === "ACTIVE"
                      ? t("statuses.active")
                      : variant.status === "INACTIVE"
                        ? t("statuses.inactive")
                        : t("statuses.outOfStock");

                  return (
                    <tr
                      key={variant.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {variant.sku}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {t("table.id", { id: variant.id })}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {variant.storage || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {colorName ? (
                          <div className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="size-5 shrink-0 rounded-full border border-slate-200"
                              style={{
                                backgroundColor: colorHex ?? "#e2e8f0",
                              }}
                            />

                            <span>{colorName}</span>
                          </div>
                        ) : variant.colorId !== null ? (
                          <span className="text-slate-400">
                            {t("table.colorUnavailable")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {variant.salePrice !== null &&
                        Number(variant.salePrice) <
                          Number(variant.price) ? (
                          <>
                            <div className="text-sm font-semibold text-rose-600">
                              {formatPrice(variant.salePrice, locale)}
                            </div>

                            <div className="mt-1 text-xs text-slate-400 line-through">
                              {formatPrice(variant.price, locale)}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm font-medium text-slate-900">
                            {formatPrice(variant.price, locale)}
                          </div>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                        {variant.stock}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                            variant.status
                          )}`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(variant)}
                            disabled={
                              submitting || deactivatingId !== null
                            }
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {t("buttons.edit")}
                          </button>

                          {variant.status === "ACTIVE" && (
                            <button
                              type="button"
                              onClick={() => void handleDeactivate(variant)}
                              disabled={
                                submitting || deactivatingId !== null
                              }
                              className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deactivatingId === variant.id
                                ? t("buttons.deactivating")
                                : t("buttons.deactivate")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
