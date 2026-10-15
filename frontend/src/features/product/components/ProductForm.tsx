
"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

import { useCategories } from "../../category/hooks/useCategories";
import useBrands from "../../brand/hooks/useBrands";

export type ProductFormValues = {
  name: string;
  brandId: string;
  categoryId: string;
  description: string;
  price: string;
  salePrice: string;
  stock: string;
  images: string[];
  primaryImageIndex: number;
};

type ProductFormErrors = {
  name: string;
  brandId: string;
  categoryId: string;
  price: string;
  salePrice: string;
  stock: string;
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
  price: "",
  salePrice: "",
  stock: "",
  images: [""],
  primaryImageIndex: 0,
};

const sectionClassName =
  "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6";

const labelClassName =
  "mb-1.5 block text-sm font-medium text-slate-700";

const inputClassName = (hasError = false) =>
  `h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
      : "border-slate-200 focus:border-slate-800 focus:ring-slate-900/5"
  }`;

const errorClassName = "mt-1.5 text-xs leading-5 text-red-600";

function isValidImageUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

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

  const [price, setPrice] = useState(
    initialValues?.price ?? defaultValues.price
  );

  const [salePrice, setSalePrice] = useState(
    initialValues?.salePrice ?? defaultValues.salePrice
  );

  const [stock, setStock] = useState(
    initialValues?.stock ?? defaultValues.stock
  );

  const [images, setImages] = useState<string[]>(
    initialValues?.images && initialValues.images.length > 0
      ? initialValues.images
      : defaultValues.images
  );

  const [primaryImageIndex, setPrimaryImageIndex] = useState(
    initialValues?.primaryImageIndex ??
      defaultValues.primaryImageIndex
  );

  const [errors, setErrors] = useState<ProductFormErrors>({
    name: "",
    brandId: "",
    categoryId: "",
    price: "",
    salePrice: "",
    stock: "",
  });

  const [imageError, setImageError] = useState("");

  const handleAddImage = () => {
    setImages((prev) => [...prev, ""]);
  };

  const handleImageChange = (
    index: number,
    value: string
  ) => {
    setImages((prev) =>
      prev.map((image, imageIndex) =>
        imageIndex === index ? value : image
      )
    );

    setImageError("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index)
    );

    setPrimaryImageIndex((currentIndex) => {
      if (images.length <= 1 || currentIndex === index) {
        return 0;
      }

      if (index < currentIndex) {
        return currentIndex - 1;
      }

      return currentIndex;
    });

    setImageError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const newErrors: ProductFormErrors = {
      name: "",
      brandId: "",
      categoryId: "",
      price: "",
      salePrice: "",
      stock: "",
    };

    // Product Name
    if (!name.trim()) {
      newErrors.name = "Product name is required.";
    }

    // Brand
    if (!brandId) {
      newErrors.brandId = "Please select a brand.";
    }

    // Category
    if (!categoryId) {
      newErrors.categoryId = "Please select a category.";
    }

    // Price
    if (price.trim() === "") {
      newErrors.price = "Price is required.";
    } else if (
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      newErrors.price = "Price must be greater than 0.";
    }

    // Sale Price
    if (salePrice.trim() !== "") {
      if (
        !Number.isFinite(Number(salePrice)) ||
        Number(salePrice) < 0
      ) {
        newErrors.salePrice =
          "Please enter a valid, non-negative sale price.";
      }
    }

    // Stock
    if (stock.trim() === "") {
      newErrors.stock = "Stock is required.";
    } else if (
      !Number.isFinite(Number(stock)) ||
      Number(stock) < 0
    ) {
      newErrors.stock = "Stock cannot be negative.";
    } else if (!Number.isInteger(Number(stock))) {
      newErrors.stock = "Stock must be a whole number.";
    }

    // Image URLs
    const hasInvalidImageUrl = images.some((url) => {
      const trimmedUrl = url.trim();

      return (
        trimmedUrl !== "" && !isValidImageUrl(trimmedUrl)
      );
    });

    setErrors(newErrors);

    if (hasInvalidImageUrl) {
      setImageError(
        "Please enter a valid image URL starting with http:// or https://."
      );
    } else {
      setImageError("");
    }

    const hasErrors = Object.values(newErrors).some(
      (error) => error !== ""
    );

    if (hasErrors || hasInvalidImageUrl) {
      return;
    }

    // Preserve the original indexes when cleaning image URLs
    // so the selected primary image can be identified correctly.
    const cleanedImageEntries = images
      .map((url, index) => ({
        url: url.trim(),
        originalIndex: index,
      }))
      .filter((image) => image.url !== "");

    const cleanedImages = cleanedImageEntries.map(
      (image) => image.url
    );

    let cleanedPrimaryImageIndex = 0;

    if (cleanedImageEntries.length > 0) {
      const primaryImage = cleanedImageEntries.findIndex(
        (image) =>
          image.originalIndex === primaryImageIndex
      );

      cleanedPrimaryImageIndex =
        primaryImage >= 0 ? primaryImage : 0;
    }

    const values: ProductFormValues = {
      name: name.trim(),
      brandId,
      categoryId,
      description: description.trim(),
      price,
      salePrice,
      stock,
      images: cleanedImages,
      primaryImageIndex: cleanedPrimaryImageIndex,
    };

    await onSubmit(values);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Product Information */}
      <section className={sectionClassName}>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
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
          {/* Product Name */}
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

                setErrors((prev) => ({
                  ...prev,
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

          {/* Brand & Category */}
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

                  setErrors((prev) => ({
                    ...prev,
                    brandId: "",
                  }));
                }}
                aria-invalid={Boolean(errors.brandId)}
                aria-describedby={
                  errors.brandId ? "product-brand-error" : undefined
                }
                className={inputClassName(Boolean(errors.brandId))}
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

            {/* Category */}
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

                  setErrors((prev) => ({
                    ...prev,
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

          {/* Description */}
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
              rows={3}
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-800 focus:ring-4 focus:ring-slate-900/5"
            />
          </div>
        </div>
      </section>

      {/* Pricing & Inventory */}
      <section className={sectionClassName}>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
            02
          </div>

          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Pricing & Inventory
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Set your product price and available stock.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {/* Price */}
          <div>
            <label
              htmlFor="product-price"
              className={labelClassName}
            >
              Regular Price
              <span className="ml-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                id="product-price"
                type="number"
                min="0"
                step="any"
                required
                value={price}
                onChange={(event) => {
                  setPrice(event.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    price: "",
                  }));
                }}
                placeholder="0"
                aria-invalid={Boolean(errors.price)}
                aria-describedby={
                  errors.price ? "product-price-error" : undefined
                }
                className={`${inputClassName(
                  Boolean(errors.price)
                )} pr-14`}
              />

              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                VND
              </span>
            </div>

            {errors.price && (
              <p
                id="product-price-error"
                role="alert"
                className={errorClassName}
              >
                {errors.price}
              </p>
            )}
          </div>

          {/* Sale Price */}
          <div>
            <label
              htmlFor="product-sale-price"
              className={labelClassName}
            >
              Sale Price
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <div className="relative">
              <input
                id="product-sale-price"
                type="number"
                min="0"
                step="any"
                value={salePrice}
                onChange={(event) => {
                  setSalePrice(event.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    salePrice: "",
                  }));
                }}
                placeholder="0"
                aria-invalid={Boolean(errors.salePrice)}
                aria-describedby={
                  errors.salePrice
                    ? "product-sale-price-error"
                    : undefined
                }
                className={`${inputClassName(
                  Boolean(errors.salePrice)
                )} pr-14`}
              />

              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                VND
              </span>
            </div>

            {errors.salePrice && (
              <p
                id="product-sale-price-error"
                role="alert"
                className={errorClassName}
              >
                {errors.salePrice}
              </p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label
              htmlFor="product-stock"
              className={labelClassName}
            >
              Stock Quantity
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              id="product-stock"
              type="number"
              min="0"
              step="1"
              required
              value={stock}
              onChange={(event) => {
                setStock(event.target.value);

                setErrors((prev) => ({
                  ...prev,
                  stock: "",
                }));
              }}
              placeholder="Enter quantity"
              aria-invalid={Boolean(errors.stock)}
              aria-describedby={
                errors.stock ? "product-stock-error" : undefined
              }
              className={inputClassName(Boolean(errors.stock))}
            />

            {errors.stock && (
              <p
                id="product-stock-error"
                role="alert"
                className={errorClassName}
              >
                {errors.stock}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Product Images */}
      <section className={sectionClassName}>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
            03
          </div>

          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Product Images
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Add image URLs and choose the primary product image.
            </p>
          </div>
        </div>

        {/* Image URL Inputs */}
        <div className="mt-5 space-y-3">
          {images.map((url, index) => (
            <div
              key={index}
              className="flex min-w-0 items-center gap-2 sm:gap-3"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
                {index + 1}
              </div>

              <input
                type="url"
                value={url}
                onChange={(event) =>
                  handleImageChange(index, event.target.value)
                }
                placeholder="https://example.com/product-image.jpg"
                aria-label={`Image URL ${index + 1}`}
                className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-800 focus:ring-4 focus:ring-slate-900/5"
              />

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  aria-label={`Remove image ${index + 1}`}
                  className="flex h-9 shrink-0 items-center justify-center rounded-lg px-2 text-xs font-medium text-red-600 transition hover:bg-red-50 sm:px-3 sm:text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddImage}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            Add Image URL
          </button>

          {imageError && (
            <p role="alert" className={errorClassName}>
              {imageError}
            </p>
          )}
        </div>

        {/* Image Preview */}
        {images.some((image) => image.trim() !== "") && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Image Preview
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Select a primary image to represent this product.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((url, index) => {
                if (!url.trim()) {
                  return null;
                }

                const validUrl = isValidImageUrl(url.trim());

                return (
                  <div
                    key={`${url}-${index}`}
                    className={`min-w-0 overflow-hidden rounded-xl border bg-white transition ${
                      validUrl && primaryImageIndex === index
                        ? "border-slate-900 ring-1 ring-slate-900"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                      {validUrl ? (
                        <Image
                          src={url.trim()}
                          alt={`Product image ${index + 1}`}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 px-2 text-center">
                          <span className="text-xl text-amber-500">
                            !
                          </span>

                          <p className="text-xs text-slate-500">
                            Invalid image URL
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 p-2.5">
                      <p
                        className="truncate text-xs text-slate-500"
                        title={url}
                      >
                        Image {index + 1}
                      </p>

                      {validUrl ? (
                        <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
                          <input
                            type="radio"
                            name="primary-image"
                            value={index}
                            checked={primaryImageIndex === index}
                            onChange={() =>
                              setPrimaryImageIndex(index)
                            }
                            className="size-3.5 accent-slate-900"
                          />

                          Primary image
                        </label>
                      ) : (
                        <p className="mt-2 text-xs text-amber-600">
                          Check the URL above
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Form Actions */}
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
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
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
