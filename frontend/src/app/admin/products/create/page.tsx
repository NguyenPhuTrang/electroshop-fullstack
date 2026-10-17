"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import useBrands from "@/src/features/brand/hooks/useBrands";
import { useCategories } from "@/src/features/category/hooks/useCategories";
import { createProduct } from "@/src/features/product/services/product.service";
import { toast } from "sonner";

type ProductFormErrors = {
  name: string;
  brandId: string;
  categoryId: string;
  price: string;
  salePrice: string;
  stock: string;
};

function generateSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function SectionHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: "information" | "inventory" | "images";
}) {
  const iconPaths = {
    information: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
    inventory: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 8 9 5 9-5M3 8v8l9 5 9-5V8M12 13v8" />
      </>
    ),
    images: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          {iconPaths[icon]}
        </svg>
      </div>

      <div>
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-rose-600">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 size-3.5 shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4m0 4h.01" />
      </svg>

      {message}
    </p>
  );
}

export default function CreateProductPage() {
  // Product Information
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");

  // Brand / Category
  const { categories } = useCategories();
  const { brands } = useBrands();

  // Pricing & Inventory
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");

  // Product Images
  const [images, setImages] = useState<string[]>([""]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  // Submit
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState<ProductFormErrors>({
    name: "",
    brandId: "",
    categoryId: "",
    price: "",
    salePrice: "",
    stock: "",
  });

  const router = useRouter();

  // Add new image URL input
  const handleAddImage = () => {
    setImages((prev) => [...prev, ""]);
  };

  // Change image URL
  const handleImageChange = (index: number, value: string) => {
    setImages((prev) =>
      prev.map((image, imageIndex) =>
        imageIndex === index ? value : image
      )
    );
  };

  // Remove image URL input
  const handleRemoveImage = (index: number) => {
    setImages((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index)
    );

    setPrimaryImageIndex((currentIndex) => {
      if (images.length <= 1) {
        return 0;
      }

      if (currentIndex === index) {
        return 0;
      }

      if (index < currentIndex) {
        return currentIndex - 1;
      }

      return currentIndex;
    });
  };

 const handleSubmit = async () => {
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
  if (price === "") {
    newErrors.price = "Price is required.";
  } else if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
    newErrors.price = "Price must be greater than 0.";
  }

  // Sale Price
  if (
    salePrice !== "" &&
    (!Number.isFinite(Number(salePrice)) || Number(salePrice) < 0)
  ) {
    newErrors.salePrice = "Sale price must be a valid non-negative number.";
  }

  // Stock
  if (stock === "") {
    newErrors.stock = "Stock is required.";
  } else if (!Number.isFinite(Number(stock)) || Number(stock) < 0) {
    newErrors.stock = "Stock must be a valid non-negative number.";
  } else if (!Number.isInteger(Number(stock))) {
    newErrors.stock = "Stock must be a whole number.";
  }

  setErrors(newErrors);

  const hasErrors = Object.values(newErrors).some(
    (error) => error !== ""
  );

  if (hasErrors) {
    return;
  }

  const toastId = toast.loading("Creating product...");

  setSubmitting(true);

  try {
    // Build product images
    const productImages = images
      .map((url, index) => ({
        url: url.trim(),
        originalIndex: index,
      }))
      .filter((image) => image.url !== "")
      .map((image) => ({
        url: image.url,
        isPrimary: image.originalIndex === primaryImageIndex,
      }));

    const productData = {
      name: name.trim(),
      slug: generateSlug(name),
      description: description.trim() || undefined,
      price: Number(price),
      salePrice: salePrice === "" ? null : Number(salePrice),
      stock: Number(stock),
      categoryId: Number(categoryId),
      brandId: Number(brandId),
      images: productImages,
    };

    await createProduct(productData);

    toast.success("Product created successfully.", {
      id: toastId,
    });

    router.push("/admin/products");
  } catch (error) {
    console.error("Failed to create product:", error);

    toast.error("Failed to create product. Please try again.", {
      id: toastId,
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
              Create a new product for your store.
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
          <SectionHeader
            title="Product Information"
            description="Enter the basic details of your product."
            icon="information"
          />

          <div className="mt-6 space-y-5">
            {/* Product Name */}
            <div>
              <label
                htmlFor="product-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Product Name <span className="text-rose-500">*</span>
              </label>

              <input
                id="product-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    name: "",
                  }));
                }}
                placeholder="Enter product name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "product-name-error" : undefined}
                className={`${inputClassName} ${
                  errors.name
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                    : ""
                }`}
              />

              {errors.name && (
                <div id="product-name-error">
                  <FieldError message={errors.name} />
                </div>
              )}
            </div>

            {/* Brand & Category */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Brand */}
              <div>
                <label
                  htmlFor="product-brand"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Brand <span className="text-rose-500">*</span>
                </label>

                <select
                  id="product-brand"
                  value={brandId}
                  onChange={(e) => {
                    setBrandId(e.target.value);

                    setErrors((prev) => ({
                      ...prev,
                      brandId: "",
                    }));
                  }}
                  aria-invalid={Boolean(errors.brandId)}
                  className={`${inputClassName} ${
                    errors.brandId
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : ""
                  }`}
                >
                  <option value="" disabled hidden>
                    Select brand
                  </option>

                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>

                <FieldError message={errors.brandId} />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="product-category"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Category <span className="text-rose-500">*</span>
                </label>

                <select
                  id="product-category"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);

                    setErrors((prev) => ({
                      ...prev,
                      categoryId: "",
                    }));
                  }}
                  aria-invalid={Boolean(errors.categoryId)}
                  className={`${inputClassName} ${
                    errors.categoryId
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : ""
                  }`}
                >
                  <option value="" disabled hidden>
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <FieldError message={errors.categoryId} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="product-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <textarea
                id="product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the product and its key features..."
                rows={5}
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Provide useful details to help customers understand the product.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Pricing & Inventory */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
        >
          <SectionHeader
            title="Pricing & Inventory"
            description="Set the selling price and available stock."
            icon="inventory"
          />

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Price */}
            <div>
              <label
                htmlFor="product-price"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Price <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);

                    setErrors((prev) => ({
                      ...prev,
                      price: "",
                    }));
                  }}
                  placeholder="0"
                  aria-invalid={Boolean(errors.price)}
                  className={`${inputClassName} pr-14 ${
                    errors.price
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : ""
                  }`}
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  VND
                </span>
              </div>

              <FieldError message={errors.price} />
            </div>

            {/* Sale Price */}
            <div>
              <label
                htmlFor="product-sale-price"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Sale Price
              </label>

              <div className="relative">
                <input
                  id="product-sale-price"
                  type="number"
                  min="0"
                  step="any"
                  value={salePrice}
                  onChange={(e) => {
                    setSalePrice(e.target.value);

                    setErrors((prev) => ({
                      ...prev,
                      salePrice: "",
                    }));
                  }}
                  placeholder="Optional"
                  aria-invalid={Boolean(errors.salePrice)}
                  className={`${inputClassName} pr-14 ${
                    errors.salePrice
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : ""
                  }`}
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  VND
                </span>
              </div>

              <FieldError message={errors.salePrice} />
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="product-stock"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Stock Quantity <span className="text-rose-500">*</span>
              </label>

              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    stock: "",
                  }));
                }}
                placeholder="0"
                aria-invalid={Boolean(errors.stock)}
                className={`${inputClassName} ${
                  errors.stock
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                    : ""
                }`}
              />

              <FieldError message={errors.stock} />
            </div>
          </div>
        </motion.section>

        {/* Product Images */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
        >
          <SectionHeader
            title="Product Images"
            description="Add image URLs and choose the primary product image."
            icon="images"
          />

          {/* Image URL Inputs */}
          <div className="mt-6 space-y-3">
            {images.map((url, index) => (
              <div
                key={index}
                className="flex items-center gap-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                  <span className="text-xs font-semibold">
                    {index + 1}
                  </span>
                </div>

                <input
                  type="url"
                  value={url}
                  onChange={(e) =>
                    handleImageChange(index, e.target.value)
                  }
                  placeholder={`Image URL ${index + 1}`}
                  aria-label={`Image URL ${index + 1}`}
                  className={inputClassName}
                />

                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    aria-label={`Remove image ${index + 1}`}
                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
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
                      <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m4-6v6" />
                    </svg>

                    <span className="hidden sm:inline">Remove</span>
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddImage}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>

              Add Image
            </button>
          </div>

          {/* Image Preview */}
          {images.some((image) => image.trim() !== "") && (
            <div className="mt-7 border-t border-slate-100 pt-6">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-slate-800">
                  Image Preview
                </h3>

                <p className="text-xs text-slate-500">
                  Select one image as the primary image.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((url, index) => {
                  if (!url.trim()) {
                    return null;
                  }

                  const isPrimary = primaryImageIndex === index;

                  return (
                    <motion.article
                      key={`${url}-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.25,
                        ease: "easeOut",
                      }}
                      className={`overflow-hidden rounded-xl border bg-white transition-colors ${
                        isPrimary
                          ? "border-blue-400 ring-2 ring-blue-100"
                          : "border-slate-200 hover:border-cyan-300"
                      }`}
                    >
                      <div className="relative aspect-square overflow-hidden bg-slate-50">
                        <Image
                          src={url}
                          alt={`Product image ${index + 1}`}
                          width={300}
                          height={300}
                          unoptimized
                          className="size-full object-contain p-2"
                        />

                        {isPrimary && (
                          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                            <svg
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-3"
                              aria-hidden="true"
                            >
                              <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
                            </svg>

                            Primary
                          </span>
                        )}
                      </div>

                      <div className="border-t border-slate-100 p-3">
                        <label
                          className={`flex cursor-pointer items-center gap-2 text-sm font-medium ${
                            isPrimary
                              ? "text-blue-700"
                              : "text-slate-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name="primary-image"
                            checked={isPrimary}
                            onChange={() =>
                              setPrimaryImageIndex(index)
                            }
                            className="size-4 accent-blue-600"
                          />

                          Primary Image
                        </label>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          )}
        </motion.section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:justify-end sm:p-5">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            disabled={submitting}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Creating Product...
              </>
            ) : (
              <>
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
                  <path d="m5 12 4 4L19 6" />
                </svg>

                Create Product
              </>
            )}
          </button>
        </div>

        <div className="h-2" />
      </div>
    </motion.main>
  );
}