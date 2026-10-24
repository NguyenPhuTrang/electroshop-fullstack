
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { toast } from "sonner";

import ProductForm, {
  type ProductFormValues,
} from "@/src/features/product/components/ProductForm";

import { useAdminProduct } from "@/src/features/product/hooks/useAdminProduct";

import {
  createProduct,
  updateProduct,
  type UpdateProductInput,
} from "@/src/features/product/services/product.service";

type AdminProductModalProps = {
  productId: number | null;
  onClose: () => void;
  onCreated: (productId: number) => void;
  onUpdated: () => void;
};

function generateSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: unknown;
          };
        };
      }
    ).response;

    const message = response?.data?.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

function LoadingPlaceholder({
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

function EditProductLoading() {
  const t = useTranslations("AdminProductModal");

  return (
    <div
      aria-busy="true"
      aria-label={t("loadingProduct")}
      className="space-y-6"
    >
      <LoadingPlaceholder className="h-3 w-40 rounded-full bg-slate-200" />

      <LoadingPlaceholder
        className="h-8 w-52 max-w-full rounded-lg bg-slate-200"
        delay={0.1}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {[1, 2, 3].map((item) => (
          <div key={item}>
            <LoadingPlaceholder className="h-4 w-28 rounded bg-slate-200" />
            <LoadingPlaceholder
              className="mt-3 h-11 w-full rounded-lg bg-slate-100"
              delay={item * 0.1}
            />
          </div>
        ))}
      </div>

      <div>
        <LoadingPlaceholder className="h-4 w-24 rounded bg-slate-200" />
        <LoadingPlaceholder className="mt-3 h-28 w-full rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

function CreateProductForm({
  onCancel,
  onCreated,
  onBusyChange,
}: {
  onCancel: () => void;
  onCreated: (productId: number) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const t = useTranslations("AdminProductModal");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleCreateProduct = async (
    values: ProductFormValues
  ): Promise<void> => {
    setSubmitting(true);
    onBusyChange(true);
    setSubmitError("");

    const toastId = toast.loading(t("toast.creating"));

    try {
      const product = await createProduct({
        name: values.name.trim(),
        slug: generateSlug(values.name),
        description: values.description.trim() || undefined,
        categoryId: Number(values.categoryId),
        brandId: Number(values.brandId),
      });

      toast.success(t("toast.created"), {
        id: toastId,
        description: t("toast.createdDescription"),
      });

      onCreated(product.id);
    } catch (error) {
      console.error("Failed to create product:", error);

      const message = getErrorMessage(
        error,
        t("errors.createFallback")
      );

      setSubmitError(message);

      toast.error(t("toast.createFailed"), {
        id: toastId,
        description: message,
      });
    } finally {
      setSubmitting(false);
      onBusyChange(false);
    }
  };

  return (
    <ProductForm
      mode="create"
      submitting={submitting}
      submitError={submitError}
      onSubmit={handleCreateProduct}
      onCancel={onCancel}
    />
  );
}

function EditProductForm({
  productId,
  onCancel,
  onUpdated,
  onBusyChange,
}: {
  productId: number;
  onCancel: () => void;
  onUpdated: () => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const t = useTranslations("AdminProductModal");

  const {
    product,
    loading,
    error,
  } = useAdminProduct(productId);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleUpdateProduct = async (
    values: ProductFormValues
  ): Promise<void> => {
    if (!Number.isInteger(productId) || productId <= 0) {
      setSubmitError(t("errors.invalidProductId"));
      return;
    }

    setSubmitting(true);
    onBusyChange(true);
    setSubmitError("");

    const toastId = toast.loading(t("toast.updating"));

    try {
      const data: UpdateProductInput = {
        name: values.name.trim(),
        slug: generateSlug(values.name),
        description: values.description.trim(),
        categoryId: Number(values.categoryId),
        brandId: Number(values.brandId),
      };

      await updateProduct(productId, data);

      toast.success(t("toast.updated"), {
        id: toastId,
      });

      onUpdated();
    } catch (error) {
      console.error("Failed to update product:", error);

      const message = getErrorMessage(
        error,
        t("errors.updateFallback")
      );

      setSubmitError(message);

      toast.error(t("toast.updateFailed"), {
        id: toastId,
        description: message,
      });
    } finally {
      setSubmitting(false);
      onBusyChange(false);
    }
  };

  if (loading) {
    return <EditProductLoading />;
  }

  if (error || !product) {
    return (
      <div className="py-8">
        <h3 className="text-base font-semibold text-slate-900">
          {t("loadFailedTitle")}
        </h3>

        <p role="alert" className="mt-2 text-sm leading-6 text-rose-600">
          {error || t("productNotFound")}
        </p>

        <button
          type="button"
          onClick={onCancel}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {t("closeButton")}
        </button>
      </div>
    );
  }

  const initialValues: Partial<ProductFormValues> = {
    name: product.name,
    brandId: String(product.brandId),
    categoryId: String(product.categoryId),
    description: product.description ?? "",
  };

  return (
    <ProductForm
      mode="update"
      initialValues={initialValues}
      submitting={submitting}
      submitError={submitError}
      onSubmit={handleUpdateProduct}
      onCancel={onCancel}
    />
  );
}

export default function AdminProductModal({
  productId,
  onClose,
  onCreated,
  onUpdated,
}: AdminProductModalProps) {
  const t = useTranslations("AdminProductModal");
  const [busy, setBusy] = useState(false);

  const closeModal = () => {
    if (!busy) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, onClose]);

  let content: ReactNode;

  if (productId === null) {
    content = (
      <CreateProductForm
        key="create-product"
        onCancel={closeModal}
        onCreated={onCreated}
        onBusyChange={setBusy}
      />
    );
  } else if (Number.isInteger(productId) && productId > 0) {
    content = (
      <EditProductForm
        key={`edit-product-${productId}`}
        productId={productId}
        onCancel={closeModal}
        onUpdated={onUpdated}
        onBusyChange={setBusy}
      />
    );
  } else {
    content = (
      <p role="alert" className="text-sm text-rose-600">
        {t("errors.invalidProductId")}
      </p>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-product-modal-title"
        className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2
            id="admin-product-modal-title"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            {productId === null
              ? t("createTitle")
              : t("editTitle")}
          </h2>

          <button
            type="button"
            onClick={closeModal}
            disabled={busy}
            aria-label={t("closeLabel")}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {content}
        </div>
      </section>
    </div>
  );
}
