"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ProductForm, {
  type ProductFormValues,
} from "@/src/features/product/components/ProductForm";

import { createProduct } from "@/src/features/product/services/product.service";

function generateSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

  return "Failed to create product. Please try again.";
}

export default function CreateProductPage() {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleCreateProduct = async (
    values: ProductFormValues
  ): Promise<void> => {
    setSubmitting(true);
    setSubmitError("");

    const toastId = toast.loading("Creating product...");

    try {
      const product = await createProduct({
        name: values.name.trim(),
        slug: generateSlug(values.name),
        description: values.description.trim() || undefined,
        categoryId: Number(values.categoryId),
        brandId: Number(values.brandId),
      });

      toast.success("Product created successfully.", {
        id: toastId,
        description:
          "Continue by configuring product variants and images.",
      });

      router.push(`/admin/products/${product.id}/edit`);
    } catch (error) {
      console.error("Failed to create product:", error);

      const message = getErrorMessage(error);

      setSubmitError(message);

      toast.error("Failed to create product.", {
        id: toastId,
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8"
    >
      <div className="mx-auto max-w-5xl space-y-6">
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
              Add Product
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create a product, then configure its variants and images.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
          </Link>
        </header>

        {/* Product Information */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
        >
          <ProductForm
            submitLabel="Create Product"
            submittingLabel="Creating Product..."
            submitting={submitting}
            submitError={submitError}
            onSubmit={handleCreateProduct}
            onCancel={() => router.push("/admin/products")}
          />
        </motion.section>
      </div>
    </motion.main>
  );
}