"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
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
  updateProductColor,
  deleteProductColor,
} from "../services/product-color.service";
import ConfirmDialog from "@/src/components/common/Confirmdialog";

type ImageFormValues = {
  url: string;
  alt: string;
  colorId: string;
  sortOrder: string;
  isPrimary: boolean;
};

type ColorEditorState = {
  mode: "create" | "edit";
  color: ProductColor | null;
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

function sortColors(colors: ProductColor[]): ProductColor[] {
  return [...colors].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
  );
}

function normalizeColorId(
  colorId: number | null | undefined
): number | null {
  return colorId ?? null;
}

function normalizePrimaryImages(
  images: ProductImage[],
  preferredPrimaryId?: number
): ProductImage[] {
  const sortedImages = sortImages(images);

  const primaryImage =
    sortedImages.find((image) => image.id === preferredPrimaryId) ??
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
  const t = useTranslations("ProductImageManager");

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

  // Inline "add new color" form inside the image modal.
  const [colorFormOpen, setColorFormOpen] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHexCode, setNewColorHexCode] = useState("#000000");
  const [creatingColor, setCreatingColor] = useState(false);
  const [colorFormError, setColorFormError] = useState("");

  // Color management section: add / edit / delete colors.
  const [colorEditor, setColorEditor] = useState<ColorEditorState | null>(
    null
  );
  const [colorEditorName, setColorEditorName] = useState("");
  const [colorEditorHex, setColorEditorHex] = useState("#000000");
  const [colorEditorError, setColorEditorError] = useState("");
  const [savingColor, setSavingColor] = useState(false);
  const [colorToDelete, setColorToDelete] = useState<ProductColor | null>(
    null
  );
  const [deletingColorId, setDeletingColorId] = useState<number | null>(
    null
  );

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [imageToDelete, setImageToDelete] = useState<ProductImage | null>(
    null
  );
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
            getErrorMessage(err, t("fallbackErrors.loadColors"))
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
  }, [productId, t]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const busy =
    submitting ||
    deletingId !== null ||
    settingPrimaryId !== null ||
    creatingColor ||
    savingColor ||
    deletingColorId !== null;

  const selectedColor = colors.find(
    (color) => String(color.id) === form.colorId
  );

  const selectedColorLabel =
    form.colorId === ""
      ? t("generalImageNoColor")
      : selectedColor?.name ?? t("selectedColorUnavailable");

  useEffect(() => {
    if (!isColorDropdownOpen) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(event.target as Node)
      ) {
        setIsColorDropdownOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointerDown
      );
    };
  }, [isColorDropdownOpen]);

  useEffect(() => {
    if (!imageModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || busy) return;

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

  const closeColorEditor = () => {
    setColorEditor(null);
    setColorEditorName("");
    setColorEditorHex("#000000");
    setColorEditorError("");
  };

  // Close the color editor with Escape (not while saving).
  useEffect(() => {
    if (!colorEditor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !savingColor) {
        closeColorEditor();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [colorEditor, savingColor]);

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
    if (busy || loading) return;

    setForm(initialFormValues);
    setEditingId(null);
    setFormError("");
    setIsColorDropdownOpen(false);
    resetColorForm();
    setImageModalOpen(true);
  };

  const handleEdit = (image: ProductImage) => {
    if (busy) return;

    setEditingId(image.id);

    setForm({
      url: image.url,
      alt: image.alt ?? "",
      colorId: image.colorId == null ? "" : String(image.colorId),
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

  // Inline "add new color" from inside the image modal.
  const handleCreateColor = async () => {
    if (busy || loading || colorsLoading) return;

    const name = newColorName.trim();
    const hexCode = newColorHexCode.trim();

    if (!name) {
      setColorFormError(t("validation.colorNameRequired"));
      return;
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(hexCode)) {
      setColorFormError(t("validation.invalidColor"));
      return;
    }

    const duplicateColor = colors.some(
      (color) => color.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (duplicateColor) {
      setColorFormError(t("validation.duplicateColorName"));
      return;
    }

    const toastId = toast.loading(t("toast.creatingColor"));

    setColorFormError("");
    setCreatingColor(true);

    try {
      const createdColor = await createProductColor(productId, {
        name,
        hexCode,
      });

      setColors((previous) => sortColors([...previous, createdColor]));

      setColorsError("");

      setForm((previous) => ({
        ...previous,
        colorId: String(createdColor.id),
      }));

      resetColorForm();
      setIsColorDropdownOpen(false);

      toast.success(t("toast.colorCreated"), {
        id: toastId,
      });
    } catch (err) {
      console.error("Failed to create product color:", err);

      setColorFormError(
        getErrorMessage(err, t("fallbackErrors.createColor"))
      );

      toast.error(t("toast.createColorError"), {
        id: toastId,
      });
    } finally {
      setCreatingColor(false);
    }
  };

  // Color management: open the add / edit dialog.
  const openColorEditor = (
    mode: "create" | "edit",
    color: ProductColor | null = null
  ) => {
    if (busy || loading || colorsLoading) return;

    setColorEditor({ mode, color });
    setColorEditorName(color?.name ?? "");
    setColorEditorHex(color?.hexCode ?? "#000000");
    setColorEditorError("");
  };

  // Color management: create or update a color.
  const handleSaveColor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!colorEditor || busy || loading || colorsLoading) return;

    const name = colorEditorName.trim();
    const hexCode = colorEditorHex.trim();

    if (!name) {
      setColorEditorError(t("validation.colorNameRequired"));
      return;
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(hexCode)) {
      setColorEditorError(t("validation.invalidColor"));
      return;
    }

    const editingColor =
      colorEditor.mode === "edit" ? colorEditor.color : null;

    const duplicateColor = colors.some(
      (color) =>
        color.id !== editingColor?.id &&
        color.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (duplicateColor) {
      setColorEditorError(t("validation.duplicateColorName"));
      return;
    }

    const toastId = toast.loading(
      editingColor ? t("toast.updatingColor") : t("toast.creatingColor")
    );

    setColorEditorError("");
    setSavingColor(true);

    try {
      if (editingColor) {
        const updatedColor = await updateProductColor(
          productId,
          editingColor.id,
          { name, hexCode }
        );

        setColors((previous) =>
          sortColors(
            previous.map((color) =>
              color.id === updatedColor.id ? updatedColor : color
            )
          )
        );

        toast.success(t("toast.colorUpdated"), { id: toastId });
      } else {
        const createdColor = await createProductColor(productId, {
          name,
          hexCode,
        });

        setColors((previous) =>
          sortColors([...previous, createdColor])
        );

        toast.success(t("toast.colorCreated"), { id: toastId });
      }

      setColorsError("");
      closeColorEditor();
    } catch (err) {
      console.error("Failed to save product color:", err);

      setColorEditorError(
        getErrorMessage(
          err,
          editingColor
            ? t("fallbackErrors.updateColor")
            : t("fallbackErrors.createColor")
        )
      );

      toast.error(
        editingColor
          ? t("toast.updateColorError")
          : t("toast.createColorError"),
        { id: toastId }
      );
    } finally {
      setSavingColor(false);
    }
  };

  // Color management: delete the color chosen in the confirmation dialog.
  const handleConfirmDeleteColor = async () => {
    if (!colorToDelete || busy) return;

    const color = colorToDelete;
    const toastId = toast.loading(t("toast.deletingColor"));

    setDeletingColorId(color.id);

    try {
      await deleteProductColor(productId, color.id);

      setColors((previous) =>
        previous.filter((item) => item.id !== color.id)
      );

      // Images that used this color become general images.
      setImages((previous) =>
        previous.map((image) =>
          image.colorId === color.id
            ? { ...image, colorId: null }
            : image
        )
      );

      setForm((previous) =>
        previous.colorId === String(color.id)
          ? { ...previous, colorId: "" }
          : previous
      );

      setColorToDelete(null);

      toast.success(t("toast.colorDeleted"), { id: toastId });
    } catch (err) {
      console.error("Failed to delete product color:", err);

      setColorToDelete(null);

      toast.error(t("toast.deleteColorError"), { id: toastId });
    } finally {
      setDeletingColorId(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (busy) return;

    setFormError("");

    const url = form.url.trim();

    if (!url) {
      setFormError(t("validation.imageUrlRequired"));
      return;
    }

    if (!isValidImageUrl(url)) {
      setFormError(t("validation.invalidImageUrl"));
      return;
    }

    let colorId: number | null = null;

    if (form.colorId.trim() !== "") {
      colorId = Number(form.colorId);

      if (!Number.isInteger(colorId) || colorId <= 0) {
        setFormError(t("validation.validColorRequired"));
        return;
      }

      const colorExists = colors.some((color) => color.id === colorId);

      if (colorsLoading || !colorExists) {
        setFormError(t("validation.colorUnavailable"));
        return;
      }
    }

    const sortOrder = Number(form.sortOrder);

    if (
      form.sortOrder.trim() === "" ||
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setFormError(t("validation.invalidSortOrder"));
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
        ? t("toast.addingImage")
        : t("toast.updatingImage")
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

        toast.success(t("toast.imageAdded"), { id: toastId });
      } else {
        const updatedImage = await updateProductImage(
          editingId,
          payload
        );

        setImages((previous) =>
          applyImageUpdate(previous, updatedImage)
        );

        toast.success(t("toast.imageUpdated"), { id: toastId });
      }

      resetForm();
    } catch (err) {
      console.error("Failed to save product image:", err);

      setFormError(
        getErrorMessage(err, t("fallbackErrors.saveImage"))
      );

      toast.error(t("toast.saveImageError"), { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrimary = async (image: ProductImage) => {
    if (busy || image.isPrimary) return;

    const toastId = toast.loading(t("toast.updatingPrimary"));
    setSettingPrimaryId(image.id);

    try {
      const updatedImage = await updateProductImage(image.id, {
        isPrimary: true,
      });

      setImages((previous) =>
        applyImageUpdate(previous, updatedImage)
      );

      toast.success(t("toast.primaryUpdated"), { id: toastId });
    } catch (err) {
      console.error("Failed to update primary image:", err);

      toast.error(t("toast.primaryUpdateError"), {
        id: toastId,
      });
    } finally {
      setSettingPrimaryId(null);
    }
  };

  // Open the delete confirmation dialog for an image.
  const handleDelete = (image: ProductImage) => {
    if (busy) return;

    setImageToDelete(image);
  };

  // Delete the image chosen in the confirmation dialog.
  const handleConfirmDeleteImage = async () => {
    if (!imageToDelete || deletingId !== null) return;

    const image = imageToDelete;
    const toastId = toast.loading(t("toast.deletingImage"));
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

      setImageToDelete(null);

      toast.success(t("toast.imageDeleted"), { id: toastId });
    } catch (err) {
      console.error("Failed to delete product image:", err);

      setImageToDelete(null);

      toast.error(t("toast.deleteImageError"), {
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
    if (colorId == null) return t("general");

    const color = colors.find((item) => item.id === colorId);

    return color?.name ?? t("colorNumber", { id: colorId });
  };

  return (
    <section
      aria-label={t("aria.productImageManagement")}
      className="space-y-6"
    >
      <header className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            {t("productManagement")}
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            {t("title")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            <span className="size-1.5 rounded-full bg-cyan-500" />
            {t("imageCount", { count: images.length })}
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
            {t("addImage")}
          </button>
        </div>
      </header>

      {/* Image library */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">
            {t("imageLibrary")}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {t("imageLibrarySubtitle")}
          </p>
        </div>

        {loading ? (
          <div
            className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4"
            aria-busy="true"
            aria-label={t("loadingImages")}
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
              {t("loadImagesErrorTitle")}
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
              {t("noProductImages")}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {t("addFirstImageSubtitle")}
            </p>

            <button
              type="button"
              onClick={handleAddImage}
              disabled={busy || loading}
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("addFirstImage")}
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
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                    <Image
                      src={image.url}
                      alt={image.alt || t("productImageAlt")}
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
                        {t("primary")}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <p
                        className="truncate text-sm font-medium text-slate-900"
                        title={image.alt || image.url}
                      >
                        {image.alt || t("untitledImage")}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {image.url}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                        {t("orderLabel", { order: image.sortOrder })}
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
                        {t("colorLabel", {
                          color: getColorLabel(normalizeColorId(image.colorId)),
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(image)}
                        disabled={busy}
                        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t("edit")}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(image)}
                        disabled={busy}
                        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === image.id
                          ? t("deleting")
                          : t("delete")}
                      </button>

                      {!image.isPrimary && (
                        <button
                          type="button"
                          onClick={() => void handleSetPrimary(image)}
                          disabled={busy}
                          className="col-span-2 inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {settingPrimaryId === image.id
                            ? t("updating")
                            : t("setAsPrimary")}
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
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <h3
                  id="product-image-modal-title"
                  className="text-lg font-semibold tracking-tight text-slate-900"
                >
                  {editingId === null
                    ? t("addImage")
                    : t("editImage")}
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {editingId === null
                    ? t("addImageDescription")
                    : t("editImageDescription")}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                disabled={busy}
                aria-label={t("aria.closeImageEditor")}
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

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5 p-5 sm:p-6"
            >
              <div>
                <label
                  htmlFor="product-image-url"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {t("imageUrl")} <span className="text-rose-500">*</span>
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

              <div>
                <label
                  htmlFor="product-image-alt"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {t("alternativeText")}
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
                  placeholder={t("alternativeTextPlaceholder")}
                  disabled={busy || loading}
                  className={inputClassName}
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  {t("alternativeTextHelp")}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div
                  ref={colorDropdownRef}
                  className="relative"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label
                      id="product-image-color-label"
                      className="block text-sm font-medium text-slate-700"
                    >
                      {t("applyToColor")}
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
                      {colorFormOpen ? t("cancel") : t("addNewColor")}
                    </button>
                  </div>

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
                          ? t("loadingProductColors")
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

                  {isColorDropdownOpen && !colorsLoading && (
                    <div
                      id="product-image-color-options"
                      role="group"
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
                          {t("generalImageNoColor")}
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
                        const isSelected = form.colorId === String(color.id);

                        return (
                          <div
                            key={color.id}
                            className={`flex items-center gap-1 border-b border-slate-100 px-1 last:border-b-0 ${
                              isSelected ? "bg-blue-50" : ""
                            }`}
                          >
                            <button
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleSelectColor(String(color.id))}
                              className={`flex min-h-10 min-w-0 flex-1 items-center gap-2.5 px-2 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                                isSelected ? "text-blue-700" : "text-slate-700"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className="size-4 shrink-0 rounded-sm border border-slate-300"
                                style={{ backgroundColor: color.hexCode ?? "#e5e7eb" }}
                              />
                              <span className="min-w-0 flex-1 truncate">{color.name}</span>
                              {isSelected && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4 shrink-0">
                                  <path d="m5 12 4 4L19 6" />
                                </svg>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setIsColorDropdownOpen(false);
                                openColorEditor("edit", color);
                              }}
                              disabled={busy}
                              aria-label={t("aria.editColor", { name: color.name })}
                              title={t("edit")}
                              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-blue-100 hover:text-blue-700 disabled:opacity-50"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4">
                                <path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setIsColorDropdownOpen(false);
                                setColorToDelete(color);
                              }}
                              disabled={busy}
                              aria-label={t("aria.deleteColor", { name: color.name })}
                              title={t("delete")}
                              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-rose-500 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4">
                                <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}

                      {colors.length === 0 && (
                        <p className="px-3 py-3 text-sm text-slate-500">
                          {t("noExistingColors")}
                        </p>
                      )}
                    </div>
                  )}

                  {colorFormOpen && (
                    <div className="mt-3 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {t("createNewColor")}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          {t("createColorDescription")}
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="new-product-color-name"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          {t("colorName")}{" "}
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
                          placeholder={t("colorNamePlaceholder")}
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
                          {t("color")}
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
                            aria-label={t("aria.chooseNewProductColor")}
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
                          {t("cancel")}
                        </button>

                        <button
                          type="button"
                          disabled={busy || loading}
                          onClick={() => void handleCreateColor()}
                          className="min-h-9 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {creatingColor
                            ? t("creatingColor")
                            : t("createColor")}
                        </button>
                      </div>
                    </div>
                  )}

                  {colorsLoading ? (
                    <p className="mt-1.5 text-xs text-slate-400">
                      {t("loadingProductColors")}
                    </p>
                  ) : colorsError ? (
                    <p
                      role="alert"
                      className="mt-1.5 text-xs leading-5 text-rose-600"
                    >
                      {t("colorsLoadWarning")}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs leading-5 text-slate-400">
                      {t("chooseColorHelp")}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="product-image-sort"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    {t("displayOrder")}
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
                    {t("setAsPrimaryImage")}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {t("primaryImageHelp")}
                  </span>
                </span>
              </label>

              {formError && (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
                >
                  {formError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={busy}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("cancel")}
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
                    ? t("saving")
                    : editingId === null
                      ? t("addImage")
                      : t("saveChanges")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Add / edit color dialog (color management) */}
      {colorEditor && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingColor) {
              closeColorEditor();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-color-modal-title"
            className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h3
                  id="product-color-modal-title"
                  className="text-lg font-semibold tracking-tight text-slate-900"
                >
                  {colorEditor.mode === "edit"
                    ? t("editColor")
                    : t("createNewColor")}
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {colorEditor.mode === "edit"
                    ? t("colorEditDescription")
                    : t("createColorDescription")}
                </p>
              </div>

              <button
                type="button"
                onClick={closeColorEditor}
                disabled={savingColor}
                aria-label={t("aria.closeColorEditor")}
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

            <form
              onSubmit={handleSaveColor}
              noValidate
              className="space-y-5 p-5 sm:p-6"
            >
              <div>
                <label
                  htmlFor="color-editor-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {t("colorName")} <span className="text-rose-500">*</span>
                </label>

                <input
                  id="color-editor-name"
                  type="text"
                  autoFocus
                  value={colorEditorName}
                  onChange={(event) => {
                    setColorEditorName(event.target.value);
                    setColorEditorError("");
                  }}
                  placeholder={t("colorNamePlaceholder")}
                  maxLength={100}
                  disabled={savingColor}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="color-editor-hex"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {t("color")}
                </label>

                <div className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3">
                  <input
                    id="color-editor-hex"
                    type="color"
                    value={colorEditorHex}
                    onChange={(event) =>
                      setColorEditorHex(event.target.value)
                    }
                    disabled={savingColor}
                    aria-label={t("aria.chooseNewProductColor")}
                    className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed"
                  />

                  <span className="font-mono text-sm uppercase text-slate-600">
                    {colorEditorHex}
                  </span>
                </div>
              </div>

              {colorEditorError && (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
                >
                  {colorEditorError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeColorEditor}
                  disabled={savingColor}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("cancel")}
                </button>

                <button
                  type="submit"
                  disabled={savingColor}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingColor && (
                    <span
                      aria-hidden="true"
                      className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                  )}

                  {savingColor
                    ? t("saving")
                    : colorEditor.mode === "edit"
                      ? t("saveChanges")
                      : t("createColor")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Delete color confirmation */}
      <ConfirmDialog
        open={colorToDelete !== null}
        title={t("deleteColorTitle")}
        itemName={colorToDelete?.name}
        description={t("deleteColorConfirm")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        loadingLabel={t("deleting")}
        loading={deletingColorId !== null}
        onConfirm={() => void handleConfirmDeleteColor()}
        onCancel={() => setColorToDelete(null)}
      />

      {/* Delete image confirmation */}
      <ConfirmDialog
        open={imageToDelete !== null}
        title={t("deleteImageTitle")}
        description={t("confirmDeleteImage")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        loadingLabel={t("deleting")}
        loading={deletingId !== null}
        onConfirm={() => void handleConfirmDeleteImage()}
        onCancel={() => setImageToDelete(null)}
      />
    </section>
  );
}