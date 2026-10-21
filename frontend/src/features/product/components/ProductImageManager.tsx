"use client";

import Image from "next/image";
import {
  useEffect,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { toast } from "sonner";

import type { ProductImage } from "@/src/features/product/types/product";

import { useProductImages } from "@/src/features/product/hooks/useProductImages";

import {
  createProductImage,
  updateProductImage,
  deleteProductImage,
  type CreateProductImageInput,
} from "@/src/features/product/services/product-image.service";

type ImageFormValues = {
  url: string;
  alt: string;
  colorId: string;
  sortOrder: string;
  isPrimary: boolean;
};

type ProductImageManagerProps = {
  productId: number;
  onLoadingChange?: (loading: boolean) => void;
};

const initialFormValues: ImageFormValues = {
  url: "",
  alt: "",
  colorId: "",
  sortOrder: "0",
  isPrimary: false,
};

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

function isValidImageUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function sortImages(images: ProductImage[]): ProductImage[] {
  return [...images].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
  );
}

/**
 * Keep exactly one primary image in the local product image list.
 * The primary image is selected product-wide, regardless of colorId.
 *
 * preferredPrimaryId is used when the user explicitly selects an image.
 * excludedPrimaryId prevents an image being unset from immediately
 * becoming the replacement when another image is available.
 */
function normalizePrimaryImages(
  images: ProductImage[],
  preferredPrimaryId?: number,
  excludedPrimaryId?: number
): ProductImage[] {
  const sortedImages = sortImages(images);
  const eligibleImages = sortedImages.filter(
    (image) => image.id !== excludedPrimaryId
  );

  const primaryImage =
    eligibleImages.find((image) => image.id === preferredPrimaryId) ??
    eligibleImages.find((image) => image.isPrimary) ??
    eligibleImages[0] ??
    sortedImages[0];

  return sortedImages.map((image) => ({
    ...image,
    isPrimary: primaryImage !== undefined && image.id === primaryImage.id,
  }));
}

function applyImageUpdate(
  images: ProductImage[],
  updatedImage: ProductImage
): ProductImage[] {
  const previousImage = images.find(
    (image) => image.id === updatedImage.id
  );

  const nextImages = images.map((image) =>
    image.id === updatedImage.id ? updatedImage : image
  );

  if (updatedImage.isPrimary) {
    return normalizePrimaryImages(nextImages, updatedImage.id);
  }

  const shouldPromoteAnotherImage =
    previousImage?.isPrimary === true && nextImages.length > 1;

  return normalizePrimaryImages(
    nextImages,
    undefined,
    shouldPromoteAnotherImage ? updatedImage.id : undefined
  );
}

export default function ProductImageManager({
  productId,
  onLoadingChange,
}: ProductImageManagerProps) {
  const {
    images: fetchedImages,
    loading,
    error,
  } = useProductImages(productId);

  const [images, setImages] = useState<ProductImage[]>([]);
  const [form, setForm] = useState<ImageFormValues>(initialFormValues);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<number | null>(
    null
  );

  const [formError, setFormError] = useState("");

  // Synchronize the local list with the data loaded by the hook.
  useEffect(() => {
    setImages(sortImages(fetchedImages));
  }, [fetchedImages]);

  // Notify the parent page when the API loading state changes.
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const busy =
    submitting ||
    deletingId !== null ||
    settingPrimaryId !== null;

  // Allow closing the modal with Escape.
  useEffect(() => {
    if (!imageModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        setImageModalOpen(false);
        setForm(initialFormValues);
        setEditingId(null);
        setFormError("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageModalOpen, busy]);

  const resetForm = () => {
    setForm(initialFormValues);
    setEditingId(null);
    setFormError("");
    setImageModalOpen(false);
  };

  const handleAddImage = () => {
    if (busy || loading) {
      return;
    }

    setForm(initialFormValues);
    setEditingId(null);
    setFormError("");
    setImageModalOpen(true);
  };

  const handleEdit = (image: ProductImage) => {
    if (busy) {
      return;
    }

    setEditingId(image.id);

    setForm({
      url: image.url,
      alt: image.alt ?? "",
      colorId: image.colorId == null ? "" : String(image.colorId),
      sortOrder: String(image.sortOrder),
      isPrimary: image.isPrimary,
    });

    setFormError("");
    setImageModalOpen(true);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (busy) {
      return;
    }

    setFormError("");

    const url = form.url.trim();

    if (!url) {
      setFormError("Image URL is required.");
      return;
    }

    if (!isValidImageUrl(url)) {
      setFormError("Please enter a valid HTTP or HTTPS image URL.");
      return;
    }

    let colorId: number | null = null;

    if (form.colorId.trim() !== "") {
      colorId = Number(form.colorId);

      if (!Number.isInteger(colorId) || colorId <= 0) {
        setFormError("Color ID must be a positive integer.");
        return;
      }
    }

    const sortOrder = Number(form.sortOrder);

    if (
      form.sortOrder.trim() === "" ||
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setFormError("Sort order must be a non-negative integer.");
      return;
    }

    const payload: CreateProductImageInput = {
      url,
      alt: form.alt.trim() || undefined,
      colorId,
      isPrimary: form.isPrimary,
      sortOrder,
    };

    const toastId = toast.loading(
      editingId === null
        ? "Adding product image..."
        : "Updating product image..."
    );

    setSubmitting(true);

    try {
      if (editingId === null) {
        const createdImage = await createProductImage(
          productId,
          payload
        );

        setImages((previous) => {
          const next = [...previous, createdImage];

          return normalizePrimaryImages(
            next,
            createdImage.isPrimary ? createdImage.id : undefined
          );
        });

        toast.success("Product image added successfully.", {
          id: toastId,
        });
      } else {
        const updatedImage = await updateProductImage(
          editingId,
          payload
        );

        setImages((previous) =>
          applyImageUpdate(previous, updatedImage)
        );

        toast.success("Product image updated successfully.", {
          id: toastId,
        });
      }

      resetForm();
    } catch (err) {
      console.error("Failed to save product image:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Unable to save product image.";

      setFormError(message);

      toast.error("Unable to save product image. Please try again.", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrimary = async (image: ProductImage) => {
    if (busy || image.isPrimary) {
      return;
    }

    const toastId = toast.loading("Updating primary image...");

    setSettingPrimaryId(image.id);

    try {
      const updatedImage = await updateProductImage(image.id, {
        isPrimary: true,
      });

      setImages((previous) =>
        applyImageUpdate(previous, updatedImage)
      );

      toast.success("Primary image updated successfully.", {
        id: toastId,
      });
    } catch (err) {
      console.error("Failed to update primary image:", err);

      toast.error("Unable to update primary image. Please try again.", {
        id: toastId,
      });
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleDelete = async (image: ProductImage) => {
    if (busy) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading("Deleting product image...");

    setDeletingId(image.id);

    try {
      await deleteProductImage(image.id);

      setImages((previous) => {
        const remainingImages = previous.filter(
          (item) => item.id !== image.id
        );

        // If the deleted image was primary, mirror the backend's
        // replacement choice across the entire product.
        return normalizePrimaryImages(
          remainingImages,
          undefined,
          image.isPrimary ? image.id : undefined
        );
      });

      if (editingId === image.id) {
        resetForm();
      }

      toast.success("Product image deleted successfully.", {
        id: toastId,
      });
    } catch (err) {
      console.error("Failed to delete product image:", err);

      toast.error("Unable to delete product image. Please try again.", {
        id: toastId,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleModalMouseDown = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget && !busy) {
      resetForm();
    }
  };

  return (
    <section
      aria-label="Product image management"
      className="space-y-6"
    >
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Product Management
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            Product Images
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage product images, alternative text, display order, and the
            product&apos;s primary image.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            <span className="size-1.5 rounded-full bg-cyan-500" />
            {images.length} {images.length === 1 ? "image" : "images"}
          </span>

          <button
            type="button"
            onClick={handleAddImage}
            disabled={busy || loading}
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

            Add Image
          </button>
        </div>
      </header>

      {/* Image Library */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">
            Image Library
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Review and manage all images associated with this product.
          </p>
        </div>

        {loading ? (
          <div
            className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4"
            aria-busy="true"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-xl border border-slate-200"
              >
                <div className="aspect-[4/3] bg-slate-100" />

                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                  <div className="h-9 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="px-5 py-12 text-center"
          >
            <p className="text-sm font-semibold text-slate-900">
              Unable to load product images
            </p>

            <p className="mt-2 text-sm text-rose-600">{error}</p>
          </div>
        ) : images.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="size-7"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-900">
              No product images
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add your first image to get started.
            </p>

            <button
              type="button"
              onClick={handleAddImage}
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Add First Image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            {images.map((image) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-sm"
              >
                {/* Image Preview */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                  <Image
                    src={image.url}
                    alt={image.alt || "Product image"}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-3"
                  />

                  {image.isPrimary && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-3.5"
                        aria-hidden="true"
                      >
                        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
                      </svg>

                      Primary
                    </span>
                  )}
                </div>

                {/* Image Information */}
                <div className="space-y-3 p-4">
                  <div>
                    <p
                      className="truncate text-sm font-medium text-slate-900"
                      title={image.alt || image.url}
                    >
                      {image.alt || "Untitled image"}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {image.url}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                      Order: {image.sortOrder}
                    </span>

                    <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                      Color: {image.colorId ?? "None"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(image)}
                      disabled={busy}
                      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(image)}
                      disabled={busy}
                      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === image.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                    {!image.isPrimary && (
                      <button
                        type="button"
                        onClick={() => void handleSetPrimary(image)}
                        disabled={busy}
                        className="col-span-2 inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {settingPrimaryId === image.id
                          ? "Updating..."
                          : "Set as Primary"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Add / Edit Image Modal */}
      {imageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 sm:p-6"
          onMouseDown={handleModalMouseDown}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-image-modal-title"
            className="my-auto w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            style={{ maxHeight: "calc(100dvh - 2rem)" }}
          >
            {/* Modal Header */}
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <h3
                  id="product-image-modal-title"
                  className="text-lg font-semibold tracking-tight text-slate-900"
                >
                  {editingId === null ? "Add Image" : "Edit Image"}
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {editingId === null
                    ? "Add a new image to this product."
                    : "Update the image information and display settings."}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                disabled={busy}
                aria-label="Close image editor"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </header>

            {/* Modal Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5 p-5 sm:p-6"
            >
              {/* Image URL */}
              <div>
                <label
                  htmlFor="product-image-url"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Image URL <span className="text-rose-500">*</span>
                </label>

                <input
                  id="product-image-url"
                  type="url"
                  value={form.url}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      url: event.target.value,
                    }))
                  }
                  placeholder="https://example.com/image.jpg"
                  disabled={busy || loading}
                  aria-invalid={Boolean(formError)}
                  className={inputClassName}
                />
              </div>

              {/* Alternative Text */}
              <div>
                <label
                  htmlFor="product-image-alt"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Alternative Text
                </label>

                <input
                  id="product-image-alt"
                  type="text"
                  value={form.alt}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      alt: event.target.value,
                    }))
                  }
                  placeholder="Describe the product image"
                  disabled={busy || loading}
                  className={inputClassName}
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Helps screen readers describe the image.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Color ID */}
                <div>
                  <label
                    htmlFor="product-image-color"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Color ID
                  </label>

                  <input
                    id="product-image-color"
                    type="number"
                    min="1"
                    step="1"
                    value={form.colorId}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        colorId: event.target.value,
                      }))
                    }
                    placeholder="Leave empty for no color"
                    disabled={busy || loading}
                    className={inputClassName}
                  />
                </div>

                {/* Sort Order */}
                <div>
                  <label
                    htmlFor="product-image-sort"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Display Order
                  </label>

                  <input
                    id="product-image-sort"
                    type="number"
                    min="0"
                    step="1"
                    value={form.sortOrder}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        sortOrder: event.target.value,
                      }))
                    }
                    disabled={busy || loading}
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Primary Image */}
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={form.isPrimary}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      isPrimary: event.target.checked,
                    }))
                  }
                  disabled={busy || loading}
                  className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <span>
                  <span className="block text-sm font-medium text-slate-800">
                    Set as primary image
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Only one image can be primary for this product, across all colors.
                  </span>
                </span>
              </label>

              {/* Form Error */}
              {formError && (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
                >
                  {formError}
                </p>
              )}

              {/* Modal Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={busy}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={busy || loading}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && (
                    <span
                      aria-hidden="true"
                      className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                  )}

                  {submitting
                    ? "Saving..."
                    : editingId === null
                      ? "Add Image"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}