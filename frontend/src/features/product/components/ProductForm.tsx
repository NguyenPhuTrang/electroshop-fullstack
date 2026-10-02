"use client";

import Image from "next/image";
import { useState } from "react";

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

  const [images, setImages] = useState(
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
  };

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
    } else if (Number(price) <= 0) {
      newErrors.price = "Price must be greater than 0.";
    }

    // Sale Price
    if (
      salePrice !== "" &&
      Number(salePrice) < 0
    ) {
      newErrors.salePrice =
        "Sale price cannot be negative.";
    }

    // Stock
    if (stock === "") {
      newErrors.stock = "Stock is required.";
    } else if (Number(stock) < 0) {
      newErrors.stock = "Stock cannot be negative.";
    } else if (!Number.isInteger(Number(stock))) {
      newErrors.stock =
        "Stock must be a whole number.";
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(
      (error) => error !== ""
    );

    if (hasErrors) {
      return;
    }

    // Keep the original index so the primary image
    // can still be identified after removing empty URLs.
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
    <div className="space-y-6">
      {/* Product Information */}
      <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Product Information
        </h2>

        <div className="mt-6 space-y-5">
          {/* Product Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Product Name
            </label>

            <input
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
              className={`h-10 w-full rounded-lg border px-3 text-sm outline-none ${
                errors.name
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black"
              }`}
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Brand & Category */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Brand */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Brand
              </label>

              <select
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    brandId: "",
                  }));
                }}
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none ${
                  errors.brandId
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
              >
                <option value="" disabled hidden>
                  Select brand
                </option>

                {brands.map((brand) => (
                  <option
                    key={brand.id}
                    value={brand.id}
                  >
                    {brand.name}
                  </option>
                ))}
              </select>

              {errors.brandId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.brandId}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    categoryId: "",
                  }));
                }}
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none ${
                  errors.categoryId
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
              >
                <option value="" disabled hidden>
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.categoryId}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Enter product description"
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Pricing & Inventory
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Price */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Price
            </label>

            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  price: "",
                }));
              }}
              placeholder="Enter price"
              className={`h-10 w-full rounded-lg border px-3 text-sm outline-none ${
                errors.price
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black"
              }`}
            />

            {errors.price && (
              <p className="mt-1 text-sm text-red-600">
                {errors.price}
              </p>
            )}
          </div>

          {/* Sale Price */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Sale Price
            </label>

            <input
              type="number"
              min="0"
              value={salePrice}
              onChange={(e) => {
                setSalePrice(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  salePrice: "",
                }));
              }}
              placeholder="Enter sale price"
              className={`h-10 w-full rounded-lg border px-3 text-sm outline-none ${
                errors.salePrice
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black"
              }`}
            />

            {errors.salePrice && (
              <p className="mt-1 text-sm text-red-600">
                {errors.salePrice}
              </p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Stock
            </label>

            <input
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
              placeholder="Enter stock quantity"
              className={`h-10 w-full rounded-lg border px-3 text-sm outline-none ${
                errors.stock
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black"
              }`}
            />

            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">
                {errors.stock}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Product Images
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Add image URLs for your product.
        </p>

        {/* Image URL Inputs */}
        <div className="mt-6 space-y-3">
          {images.map((url, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
            >
              <input
                type="url"
                value={url}
                onChange={(e) =>
                  handleImageChange(
                    index,
                    e.target.value
                  )
                }
                placeholder={`Image URL ${index + 1}`}
                className="h-10 flex-1 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-black"
              />

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveImage(index)
                  }
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddImage}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            + Add Image
          </button>
        </div>

        {/* Image Preview */}
        {images.some(
          (image) => image.trim() !== ""
        ) && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((url, index) => {
              if (!url.trim()) {
                return null;
              }

              return (
                <div
                  key={`${url}-${index}`}
                  className="rounded-lg border border-gray-300 p-3"
                >
                  <div className="aspect-square overflow-hidden rounded-md bg-gray-100">
                    <Image
                      src={url}
                      alt={`Product image ${
                        index + 1
                      }`}
                      width={300}
                      height={300}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <label className="mt-3 flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="primary-image"
                      checked={
                        primaryImageIndex === index
                      }
                      onChange={() =>
                        setPrimaryImageIndex(index)
                      }
                    />

                    Primary
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {submitError && (
          <p className="text-sm text-red-600">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? submittingLabel
              : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
