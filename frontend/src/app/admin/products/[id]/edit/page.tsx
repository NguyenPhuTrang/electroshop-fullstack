"use client";

import { useParams, useRouter } from "next/navigation";

import ProductForm, {
  type ProductFormValues,
} from "@/src/features/product/components/ProductForm";

import { useAdminProduct } from "@/src/features/product/hooks/useAdminProduct";

import {
  updateProduct,
  type UpdateProductInput,
} from "@/src/features/product/services/product.service";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const id = Number(params.id);

  const {
    product,
    loading,
    error,
  } = useAdminProduct(id);

  const handleSubmit = async (
    values: ProductFormValues
  ) => {
    const data: UpdateProductInput = {
      name: values.name,

      slug: values.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),

      description: values.description,

      price: Number(values.price),

      salePrice:
        values.salePrice.trim() === ""
          ? null
          : Number(values.salePrice),

      stock: Number(values.stock),

      categoryId: Number(values.categoryId),

      brandId: Number(values.brandId),

      images: values.images.map(
        (url, index) => ({
          url,
          isPrimary:
            index === values.primaryImageIndex,
        })
      ),
    };

    await updateProduct(id, data);

    router.push("/admin/products");
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <p className="text-red-500">
          {error || "Product not found."}
        </p>
      </div>
    );
  }

  const primaryImageIndex = Math.max(
    product.images.findIndex(
      (image) => image.isPrimary
    ),
    0
  );

  const initialValues: Partial<ProductFormValues> = {
    name: product.name,

    brandId: String(product.brandId),

    categoryId: String(product.categoryId),

    description: product.description ?? "",

    price: product.price,

    salePrice: product.salePrice ?? "",

    stock: String(product.stock),

    images: product.images.map(
      (image) => image.url
    ),

    primaryImageIndex,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Edit Product
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update product information
        </p>
      </div>

      <ProductForm
        initialValues={initialValues}
        submitLabel="Update Product"
        submittingLabel="Updating..."
        onSubmit={handleSubmit}
        onCancel={() =>
          router.push("/admin/products")
        }
      />
    </div>
  );
}
