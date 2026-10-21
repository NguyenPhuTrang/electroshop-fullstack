"use client";

import { useState } from "react";

import ProductGallery from "./ProductGallery";
import ProductInfor from "./ProductInfor";

import type { ProductWithVariantSummary } from "../types/product";
import type { Review } from "@/src/features/review/types/review";

type ProductDetailsInteractiveProps = {
  product: ProductWithVariantSummary;
  reviews: Review[];
};

export default function ProductDetailsInteractive({
  product,
  reviews,
}: ProductDetailsInteractiveProps) {
  const [selectedColorId, setSelectedColorId] = useState<number | null>(
    null
  );

  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-5 sm:gap-6 md:grid-cols-2 lg:gap-7">
      <div className="mx-auto w-full min-w-0 max-w-[520px] md:mx-0">
        <ProductGallery
          productId={product.id}
          images={product.images}
          productName={product.name}
          selectedColorId={selectedColorId}
        />
      </div>

      <div className="min-w-0">
        <ProductInfor
          productId={product.id}
          name={product.name}
          brandName={product.brand.name}
          categoryName={product.category.name}
          description={product.description}
          reviews={reviews}
          onSelectedColorChange={setSelectedColorId}
        />
      </div>
    </div>
  );
}