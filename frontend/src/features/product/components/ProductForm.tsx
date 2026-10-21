"use client";

import { useState, type FormEvent } from "react";

import { useCategories } from "../../category/hooks/useCategories";
import useBrands from "../../brand/hooks/useBrands";

export type ProductFormValues = {
  name: string;
  brandId: string;
  categoryId: string;
  description: string;
};

type ProductFormErrors = {
  name: string;
  brandId: string;
  categoryId: string;
};

type ProductFormProps = {
  initialValues?: Partial<ProductFormValues>;
  submitLabel?: string;
  submittingLabel?: string;
  submitting?: boolean;
  submitError?: string;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
};

const defaultValues: ProductFormValues = {
  name: "",
  brandId: "",
  categoryId: "",
  description: "",
};

const sectionClassName =
  "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6";

const labelClassName =
  "mb-1.5 block text-sm font-medium text-slate-700";

const inputClassName = (hasError = false) =>
  `h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
      : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
  }`;

const errorClassName = "mt-1.5 text-xs leading-5 text-red-600";

export default function ProductForm({
  initialValues,
  submitLabel = "Create Product",
  submittingLabel = "Creating...",
  submitting = false,
  submitError = "",
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { categories } = useCategories();
  const { brands } = useBrands();

  const [name, setName] = useState(
    initialValues?.name ?? defaultValues.name
  );

  const [brandId, setBrandId] = useState(
    initialValues?.brandId ?? defaultValues.brandId
  );

  const [categoryId, setCategoryId] = useState(
    initialValues?.categoryId ?? defaultValues.categoryId
  );

  const [description, setDescription] = useState(
    initialValues?.description ?? defaultValues.description
  );

  const [errors, setErrors] = useState<ProductFormErrors>({
    name: "",
    brandId: "",
    categoryId: "",
  });

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const newErrors: ProductFormErrors = {
      name: "",
      brandId: "",
      categoryId: "",
    };

    if (!name.trim()) {
      newErrors.name = "Product name is required.";
    }

    if (!brandId) {
      newErrors.brandId = "Please select a brand.";
    }

    if (!categoryId) {
      newErrors.categoryId = "Please select a category.";
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(
      (error) => error !== ""
    );

    if (hasErrors) {
      return;
    }

    const values: ProductFormValues = {
      name: name.trim(),
      brandId,
      categoryId,
      description: description.trim(),
    };

    await onSubmit(values);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <section className={sectionClassName}>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-blue-700">
            01
          </div>

          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Product Information
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Enter the basic details of your product.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="product-name"
              className={labelClassName}
            >
              Product Name
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              id="product-name"
              type="text"
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value);

                setErrors((previous) => ({
                  ...previous,
                  name: "",
                }));
              }}
              placeholder="Enter product name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={
                errors.name ? "product-name-error" : undefined
              }
              className={inputClassName(Boolean(errors.name))}
            />

            {errors.name && (
              <p
                id="product-name-error"
                role="alert"
                className={errorClassName}
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Brand */}
            <div>
              <label
                htmlFor="product-brand"
                className={labelClassName}
              >
                Brand
                <span className="ml-1 text-red-500">*</span>
              </label>

              <select
                id="product-brand"
                required
                value={brandId}
                onChange={(event) => {
                  setBrandId(event.target.value);

                  setErrors((previous) => ({
                    ...previous,
                    brandId: "",
                  }));
                }}
                aria-invalid={Boolean(errors.brandId)}
                aria-describedby={
                  errors.brandId
                    ? "product-brand-error"
                    : undefined
                }
                className={inputClassName(
                  Boolean(errors.brandId)
                )}
              >
                <option value="" disabled>
                  Select brand
                </option>

                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>

              {errors.brandId && (
                <p
                  id="product-brand-error"
                  role="alert"
                  className={errorClassName}
                >
                  {errors.brandId}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="product-category"
                className={labelClassName}
              >
                Category
                <span className="ml-1 text-red-500">*</span>
              </label>

              <select
                id="product-category"
                required
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);

                  setErrors((previous) => ({
                    ...previous,
                    categoryId: "",
                  }));
                }}
                aria-invalid={Boolean(errors.categoryId)}
                aria-describedby={
                  errors.categoryId
                    ? "product-category-error"
                    : undefined
                }
                className={inputClassName(
                  Boolean(errors.categoryId)
                )}
              >
                <option value="" disabled>
                  Select category
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {errors.categoryId && (
                <p
                  id="product-category-error"
                  role="alert"
                  className={errorClassName}
                >
                  {errors.categoryId}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="product-description"
              className={labelClassName}
            >
              Description
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <textarea
              id="product-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the product's features and benefits"
              rows={4}
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:px-5">
        {submitError && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700"
          >
            {submitError}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            <span className="text-red-500">*</span>{" "}
            Required fields
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              )}

              {submitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}