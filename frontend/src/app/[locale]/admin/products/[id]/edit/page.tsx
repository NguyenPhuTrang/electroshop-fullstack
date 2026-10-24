"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import ProductForm, {
  type ProductFormValues,
} from "@/src/features/product/components/ProductForm";

import { useAdminProduct } from "@/src/features/product/hooks/useAdminProduct";

import {
  updateProduct,
  type UpdateProductInput,
} from "@/src/features/product/services/product.service";

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
  return (
    <main
      className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8"
      aria-busy="true"
      aria-label="Loading product"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto max-w-5xl"
      >
        {/* Header Skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <LoadingPlaceholder className="h-3 w-40 rounded-full bg-slate-200" />

          <LoadingPlaceholder
            className="mt-4 h-8 w-52 max-w-full rounded-lg bg-slate-200"
            delay={0.1}
          />

          <LoadingPlaceholder
            className="mt-3 h-4 w-64 max-w-full rounded bg-slate-100"
            delay={0.2}
          />
        </div>

        {/* Form Skeleton */}
        <div className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[1, 2, 3].map((item) => (
              <div key={item}>
                <LoadingPlaceholder className="h-4 w-28 rounded bg-slate-200" />

                <LoadingPlaceholder
                  className="mt-3 h-11 w-full rounded-lg border border-slate-200 bg-slate-100"
                  delay={item * 0.1}
                />
              </div>
            ))}
          </div>

          <div>
            <LoadingPlaceholder className="h-4 w-24 rounded bg-slate-200" />
            <LoadingPlaceholder className="mt-3 h-28 w-full rounded-lg bg-slate-100" />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <LoadingPlaceholder className="h-10 w-24 rounded-lg bg-slate-100" />
            <LoadingPlaceholder className="h-10 w-36 rounded-lg bg-blue-100" />
          </div>
        </div>
      </motion.div>
    </main>
  );
}

function getErrorMessage(error: unknown): string {
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

  return "Unable to update product. Please try again.";
}

function generateSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const id = Number(params.id);

  const {
    product,
    loading,
    error,
  } = useAdminProduct(id);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (
    values: ProductFormValues
  ): Promise<void> => {
    if (!Number.isInteger(id) || id <= 0) {
      setSubmitError("Invalid product ID.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const toastId = toast.loading("Updating product...");

    try {
      const data: UpdateProductInput = {
        name: values.name.trim(),
        slug: generateSlug(values.name),
        description: values.description.trim(),
        categoryId: Number(values.categoryId),
        brandId: Number(values.brandId),
      };

      await updateProduct(id, data);

      toast.success("Product information updated successfully.", {
        id: toastId,
      });
    } catch (error) {
      console.error("Failed to update product:", error);

      const message = getErrorMessage(error);

      setSubmitError(message);

      toast.error("Unable to update product.", {
        id: toastId,
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <EditProductLoading />;
  }

  if (error || !product) {
    return (
      <main className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mx-auto max-w-5xl"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex size-12 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
                aria-hidden="true"
              >
                <path d="M12 8v4m0 4h.01" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>

            <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
              Unable to Load Product
            </h1>

            <p
              role="alert"
              className="mt-2 text-sm leading-6 text-rose-600"
            >
              {error || "Product not found."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                <path d="m15 18-6-6 6-6" />
              </svg>

              Back to Products
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  const initialValues: Partial<ProductFormValues> = {
    name: product.name,
    brandId: String(product.brandId),
    categoryId: String(product.categoryId),
    description: product.description ?? "",
  };

  return (
    <main className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto max-w-5xl"
      >
        {/* Page Header */}
        <header className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="size-2 rounded-full bg-cyan-500" />

              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Electroshop Administration
              </p>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Edit Product
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Update general product information.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            disabled={submitting}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <path d="m15 18-6-6 6-6" />
            </svg>

            Back to Products
          </button>
        </header>

        {/* Product Information */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
          className="mt-6"
        >
          <ProductForm
            initialValues={initialValues}
            submitLabel="Update Product"
            submittingLabel="Updating..."
            submitting={submitting}
            submitError={submitError}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/products")}
          />
        </motion.section>

        <div className="h-6 sm:h-8" />
      </motion.div>
    </main>
  );
}