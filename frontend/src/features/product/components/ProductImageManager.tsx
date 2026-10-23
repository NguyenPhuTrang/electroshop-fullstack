"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { toast } from "sonner";

import type {
  ProductColor,
  ProductImage,
} from "@/src/features/product/types/product";

import { useProductImages } from "@/src/features/product/hooks/useProductImages";

import {
  createProductImage,
  updateProductImage,
  deleteProductImage,
  type CreateProductImageInput,
} from "@/src/features/product/services/product-image.service";

import {
  getProductColors,
  createProductColor,
} from "../services/product-color.service";

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

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function sortImages(images: ProductImage[]): ProductImage[] {
  return [...images].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
  );
}

/**
 * null and undefined both represent the general-image group.
 */
function normalizeColorId(
  colorId: number | null | undefined
): number | null {
  return colorId ?? null;
}

/**
 * Keep exactly one primary image in each color group.
 *
 * General images (colorId = null) form one group.
 * Images assigned to each numeric colorId form separate groups.
 *
 * preferredPrimaryId takes priority in its own group.
 * excludedPrimaryId avoids selecting an image that was just unset.
 */
function normalizePrimaryImages(
  images: ProductImage[],
  preferredPrimaryId?: number
): ProductImage[] {
  const sortedImages = sortImages(images);

  // Keep the explicitly selected image as the only primary.
  // Otherwise preserve an existing primary, if one exists.
  // Do not automatically promote another image when none is primary.
  const primaryImage =
    sortedImages.find(
      (image) => image.id === preferredPrimaryId
    ) ??
    sortedImages.find((image) => image.isPrimary);

  return sortedImages.map((image) => ({
    ...image,
    isPrimary: primaryImage?.id === image.id,
  }));
}

function applyImageUpdate(
  images: ProductImage[],
  updatedImage: ProductImage
): ProductImage[] {
  const nextImages = images.map((image) =>
    image.id === updatedImage.id ? updatedImage : image
  );

  return normalizePrimaryImages(
    nextImages,
    updatedImage.isPrimary ? updatedImage.id : undefined
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
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [colorsLoading, setColorsLoading] = useState(true);
  const [colorsError, setColorsError] = useState("");

  const [form, setForm] = useState<ImageFormValues>(initialFormValues);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

  // Create new color state.
  const [colorFormOpen, setColorFormOpen] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHexCode, setNewColorHexCode] = useState("#000000");
  const [creatingColor, setCreatingColor] = useState(false);
  const [colorFormError, setColorFormError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] =
    useState<number | null>(null);

  const [formError, setFormError] = useState("");

  const colorDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImages(normalizePrimaryImages(fetchedImages));
  }, [fetchedImages]);

  useEffect(() => {
    let cancelled = false;

    const fetchColors = async () => {
      setColorsLoading(true);
      setColorsError("");

      try {
        const data = await getProductColors(productId);

        if (!cancelled) {
          setColors(data);
        }
      } catch (err) {
        if (!cancelled) {
          setColors([]);
          setColorsError(
            getErrorMessage(err, "Unable to load product colors.")
          );
        }

        console.error("Failed to load product colors:", err);
      } finally {
        if (!cancelled) {
          setColorsLoading(false);
        }
      }
    };

    void fetchColors();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const busy =
    submitting ||
    deletingId !== null ||
    settingPrimaryId !== null ||
    creatingColor;

  const selectedColor = colors.find(
    (color) => String(color.id) === form.colorId
  );

  const selectedColorLabel =
    form.colorId === ""
      ? "General product image (no color)"
      : selectedColor?.name ?? "Selected color unavailable";

  useEffect(() => {
    if (!isColorDropdownOpen) {
      return;
    }

    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(event.target as Node)
      ) {
        setIsColorDropdownOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsidePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointerDown
      );
    };
  }, [isColorDropdownOpen]);

  useEffect(() => {
    if (!imageModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || busy) {
        return;
      }

      if (isColorDropdownOpen) {
        setIsColorDropdownOpen(false);
        return;
      }

      if (colorFormOpen) {
        setColorFormOpen(false);
        setColorFormError("");
        return;
      }

      setImageModalOpen(false);
      setForm(initialFormValues);
      setEditingId(null);
      setFormError("");
      setColorFormOpen(false);
      setNewColorName("");
      setNewColorHexCode("#000000");
      setColorFormError("");
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageModalOpen, isColorDropdownOpen, colorFormOpen, busy]);

  const resetColorForm = () => {
    setColorFormOpen(false);
    setNewColorName("");
    setNewColorHexCode("#000000");
    setColorFormError("");
  };

  const resetForm = () => {
    setForm(initialFormValues);
    setEditingId(null);
    setFormError("");
    setIsColorDropdownOpen(false);
    resetColorForm();
    setImageModalOpen(false);
  };

  const handleAddImage = () => {
    if (busy || loading) {
      return;
    }

    setForm(initialFormValues);
    setEditingId(null);
    setFormError("");
    setIsColorDropdownOpen(false);
    resetColorForm();
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
      colorId:
        image.colorId == null ? "" : String(image.colorId),
      sortOrder: String(image.sortOrder),
      isPrimary: image.isPrimary,
    });

    setFormError("");
    setIsColorDropdownOpen(false);
    resetColorForm();
    setImageModalOpen(true);
  };

  const handleSelectColor = (colorId: string) => {
    setForm((previous) => ({
      ...previous,
      colorId,
    }));

    setIsColorDropdownOpen(false);
  };

  const handleCreateColor = async () => {
    if (busy || loading || colorsLoading) {
      return;
    }

    const name = newColorName.trim();
    const hexCode = newColorHexCode.trim();

    if (!name) {
      setColorFormError("Color name is required.");
      return;
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(hexCode)) {
      setColorFormError("Please select a valid color.");
      return;
    }

    const duplicateColor = colors.some(
      (color) =>
        color.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (duplicateColor) {
      setColorFormError(
        "This color name already exists for this product."
      );
      return;
    }

    const toastId = toast.loading("Creating product color...");

    setColorFormError("");
    setCreatingColor(true);

    try {
      const createdColor = await createProductColor(productId, {
        name,
        hexCode,
      });

      setColors((previous) =>
        [...previous, createdColor].sort(
          (a, b) =>
            a.sortOrder - b.sortOrder ||
            a.name.localeCompare(b.name)
        )
      );

      setColorsError("");

      // Automatically select the newly created color.
      setForm((previous) => ({
        ...previous,
        colorId: String(createdColor.id),
      }));

      resetColorForm();
      setIsColorDropdownOpen(false);

      toast.success("Product color created successfully.", {
        id: toastId,
      });
    } catch (err) {
      console.error("Failed to create product color:", err);

      setColorFormError(
        getErrorMessage(err, "Unable to create product color.")
      );

      toast.error("Unable to create product color.", {
        id: toastId,
      });
    } finally {
      setCreatingColor(false);
    }
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
        setFormError("Please select a valid product color.");
        return;
      }

      const colorExists = colors.some(
        (color) => color.id === colorId
      );

      if (colorsLoading || !colorExists) {
        setFormError(
          "The selected color is unavailable. Please select an existing color."
        );
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

        setImages((previous) =>
          normalizePrimaryImages(
            [...previous, createdImage],
            createdImage.isPrimary ? createdImage.id : undefined
          )
        );

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

      setFormError(
        getErrorMessage(err, "Unable to save product image.")
      );

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

        return normalizePrimaryImages(remainingImages);
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

  const getColorLabel = (colorId: number | null) => {
    if (colorId == null) {
      return "General";
    }

    const color = colors.find((item) => item.id === colorId);

    return color?.name ?? `Color #${colorId}`;
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
            Manage product images, alternative text, display order, and
            the primary image for each color.
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
          <div role="alert" className="px-5 py-12 text-center">
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
              disabled={busy || loading}
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add First Image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            {images.map((image) => {
              const imageColor = colors.find(
                (color) => color.id === image.colorId
              );

              return (
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

                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                        {imageColor?.hexCode && (
                          <span
                            aria-hidden="true"
                            className="size-3 rounded-full border border-slate-300"
                            style={{
                              backgroundColor: imageColor.hexCode,
                            }}
                          />
                        )}

                        Color: {getColorLabel(image.colorId)}
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
                        {deletingId === image.id ? "Deleting..." : "Delete"}
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
              );
            })}
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
                {/* Product Color */}
                <div
                  ref={colorDropdownRef}
                  className="relative"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label
                      id="product-image-color-label"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Apply to Color
                    </label>

                    <button
                      type="button"
                      disabled={busy || loading || colorsLoading}
                      onClick={() => {
                        if (colorFormOpen) {
                          resetColorForm();
                        } else {
                          setColorFormError("");
                          setColorFormOpen(true);
                          setIsColorDropdownOpen(false);
                        }
                      }}
                      className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {colorFormOpen ? "Cancel" : "+ Add New Color"}
                    </button>
                  </div>

                  {/* Selected Color */}
                  <button
                    id="product-image-color"
                    type="button"
                    aria-labelledby="product-image-color-label"
                    aria-haspopup="listbox"
                    aria-expanded={isColorDropdownOpen}
                    aria-controls="product-image-color-options"
                    disabled={
                      busy ||
                      loading ||
                      colorsLoading ||
                      colorFormOpen
                    }
                    onClick={() =>
                      setIsColorDropdownOpen((previous) => !previous)
                    }
                    className={`${inputClassName} flex items-center justify-between gap-3 text-left`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="size-4 shrink-0 rounded-sm border border-slate-300"
                        style={{
                          backgroundColor:
                            selectedColor?.hexCode ??
                            (form.colorId === "" ? "#ffffff" : "#e5e7eb"),
                        }}
                      />

                      <span className="truncate">
                        {colorsLoading
                          ? "Loading product colors..."
                          : selectedColorLabel}
                      </span>
                    </span>

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className={`size-4 shrink-0 text-slate-500 transition-transform ${
                        isColorDropdownOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {/* Existing Colors */}
                  {isColorDropdownOpen && !colorsLoading && (
                    <div
                      id="product-image-color-options"
                      role="listbox"
                      aria-labelledby="product-image-color-label"
                      className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={form.colorId === ""}
                        onClick={() => handleSelectColor("")}
                        className={`flex min-h-10 w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                          form.colorId === ""
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-700"
                        }`}
                      >
                        <span className="size-4 shrink-0 rounded-sm border border-slate-300 bg-white" />

                        <span className="min-w-0 flex-1 truncate">
                          General product image (no color)
                        </span>

                        {form.colorId === "" && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="size-4 shrink-0"
                          >
                            <path d="m5 12 4 4L19 6" />
                          </svg>
                        )}
                      </button>

                      {colors.map((color) => {
                        const isSelected =
                          form.colorId === String(color.id);

                        return (
                          <button
                            key={color.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() =>
                              handleSelectColor(String(color.id))
                            }
                            className={`flex min-h-10 w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                              isSelected
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-700"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className="size-4 shrink-0 rounded-sm border border-slate-300"
                              style={{
                                backgroundColor:
                                  color.hexCode ?? "#e5e7eb",
                              }}
                            />

                            <span className="min-w-0 flex-1 truncate">
                              {color.name}
                            </span>

                            {isSelected && (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                className="size-4 shrink-0"
                              >
                                <path d="m5 12 4 4L19 6" />
                              </svg>
                            )}
                          </button>
                        );
                      })}

                      {colors.length === 0 && (
                        <p className="px-3 py-3 text-sm text-slate-500">
                          No existing colors are available.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Create New Color */}
                  {colorFormOpen && (
                    <div className="mt-3 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          Create New Color
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          Create a color for this product and use it for
                          the image.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="new-product-color-name"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Color Name{" "}
                          <span className="text-rose-500">*</span>
                        </label>

                        <input
                          id="new-product-color-name"
                          type="text"
                          value={newColorName}
                          onChange={(event) => {
                            setNewColorName(event.target.value);
                            setColorFormError("");
                          }}
                          placeholder="e.g. Midnight Blue"
                          maxLength={100}
                          disabled={busy || loading}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="new-product-color-hex"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Color
                        </label>

                        <div className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3">
                          <input
                            id="new-product-color-hex"
                            type="color"
                            value={newColorHexCode}
                            onChange={(event) =>
                              setNewColorHexCode(event.target.value)
                            }
                            disabled={busy || loading}
                            aria-label="Choose new product color"
                            className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed"
                          />

                          <span className="text-sm font-medium uppercase text-slate-600">
                            {newColorHexCode}
                          </span>
                        </div>
                      </div>

                      {colorFormError && (
                        <p
                          role="alert"
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700"
                        >
                          {colorFormError}
                        </p>
                      )}

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={resetColorForm}
                          className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={busy || loading}
                          onClick={() => void handleCreateColor()}
                          className="min-h-9 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {creatingColor ? "Creating..." : "Create Color"}
                        </button>
                      </div>
                    </div>
                  )}

                  {colorsLoading ? (
                    <p className="mt-1.5 text-xs text-slate-400">
                      Loading product colors...
                    </p>
                  ) : colorsError ? (
                    <p
                      role="alert"
                      className="mt-1.5 text-xs leading-5 text-rose-600"
                    >
                      Unable to load existing colors. You can still try
                      creating a new color.
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs leading-5 text-slate-400">
                      Choose an existing color, create a new one, or
                      select a general image.
                    </p>
                  )}
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
                    Each color group has its own primary image. General
                    product images form a separate group.
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
                  disabled={
                    busy ||
                    loading ||
                    colorsLoading ||
                    colorFormOpen ||
                    Boolean(colorsError && form.colorId !== "")
                  }
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