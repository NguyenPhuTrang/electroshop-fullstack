"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

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
  mode: "create" | "update";
  initialValues?: Partial<ProductFormValues>;
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

type DropdownOption = {
  value: string;
  label: string;
};

type FormDropdownProps = {
  id: string;
  value: string;
  options: DropdownOption[];
  placeholder: string;
  hasError?: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
};

// Custom dropdown (same look as the filter dropdowns on the admin list pages).
// The list opens right under the button and has a controlled width and height.
function FormDropdown({
  id,
  value,
  options,
  placeholder,
  hasError = false,
  describedBy,
  onChange,
}: FormDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Do not let Escape also close a surrounding modal.
        event.stopPropagation();
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-10 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3 text-left text-sm outline-none transition focus:ring-4 ${
          hasError
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
            : open
              ? "border-blue-500 ring-4 ring-blue-500/10"
              : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/10"
        }`}
      >
        <span
          className={`min-w-0 truncate ${
            selected ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {selected?.label ?? placeholder}
        </span>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`size-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/60"
        >
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">—</p>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex min-h-10 w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {option.label}
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
                      className="ml-2 size-4 shrink-0 text-blue-600"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductForm({
  mode,
  initialValues,
  submitting = false,
  submitError = "",
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const t = useTranslations("ProductForm");

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

  const submitLabel =
    mode === "create"
      ? t("createProduct")
      : t("updateProduct");

  const submittingLabel =
    mode === "create"
      ? t("creatingProduct")
      : t("updatingProduct");

  const brandOptions: DropdownOption[] = brands.map((brand) => ({
    value: String(brand.id),
    label: brand.name,
  }));

  const categoryOptions: DropdownOption[] = categories.map(
    (category) => ({
      value: String(category.id),
      label: category.name,
    })
  );

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
      newErrors.name = t("nameRequired");
    }

    if (!brandId) {
      newErrors.brandId = t("brandRequired");
    }

    if (!categoryId) {
      newErrors.categoryId = t("categoryRequired");
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(
      (error) => error !== ""
    );

    if (hasErrors) return;

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
              {t("title")}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="product-name"
              className={labelClassName}
            >
              {t("productName")}
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
              placeholder={t("productNamePlaceholder")}
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
            <div>
              <label
                htmlFor="product-brand"
                className={labelClassName}
              >
                {t("brand")}
                <span className="ml-1 text-red-500">*</span>
              </label>

              <FormDropdown
                id="product-brand"
                value={brandId}
                options={brandOptions}
                placeholder={t("selectBrand")}
                hasError={Boolean(errors.brandId)}
                describedBy={
                  errors.brandId ? "product-brand-error" : undefined
                }
                onChange={(nextValue) => {
                  setBrandId(nextValue);
                  setErrors((previous) => ({
                    ...previous,
                    brandId: "",
                  }));
                }}
              />

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
                {t("category")}
                <span className="ml-1 text-red-500">*</span>
              </label>

              <FormDropdown
                id="product-category"
                value={categoryId}
                options={categoryOptions}
                placeholder={t("selectCategory")}
                hasError={Boolean(errors.categoryId)}
                describedBy={
                  errors.categoryId
                    ? "product-category-error"
                    : undefined
                }
                onChange={(nextValue) => {
                  setCategoryId(nextValue);
                  setErrors((previous) => ({
                    ...previous,
                    categoryId: "",
                  }));
                }}
              />

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
              {t("description")}
              <span className="ml-1 font-normal text-slate-400">
                {t("optional")}
              </span>
            </label>

            <textarea
              id="product-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder={t("descriptionPlaceholder")}
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
            {t("requiredFields")}
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("cancel")}
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