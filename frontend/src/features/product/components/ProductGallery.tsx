"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { ProductImage } from "../types/product";
import { useProductImages } from "../hooks/useProductImages";

type ProductGalleryProps = {
  productId: number;
  images: ProductImage[];
  productName: string;
  selectedColorId: number | null;
};

function uniqueImages(
  imageCollections: ProductImage[][]
): ProductImage[] {
  const imageMap = new Map<number, ProductImage>();

  for (const collection of imageCollections) {
    for (const image of collection) {
      if (!imageMap.has(image.id)) {
        imageMap.set(image.id, image);
      }
    }
  }

  return Array.from(imageMap.values());
}

export default function ProductGallery({
  productId,
  images,
  productName,
  selectedColorId,
}: ProductGalleryProps) {
  const {
    images: fetchedImages,
    loading,
    error,
  } = useProductImages(productId);

  const [selectedImageId, setSelectedImageId] = useState<number | null>(
    null
  );

  useEffect(() => {
    setSelectedImageId(null);
  }, [productId, selectedColorId]);

  const galleryImages = uniqueImages([
    fetchedImages,
    images,
  ]);

  const sortedImages = [...galleryImages].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
  );

  const selectedColorImages =
    selectedColorId === null
      ? []
      : sortedImages.filter(
          (image) => image.colorId === selectedColorId
        );

  const generalPrimaryImage = sortedImages.find(
    (image) => image.colorId === null && image.isPrimary
  );

  const primaryImage =
    selectedColorId !== null
      ? (
          selectedColorImages.find((image) => image.isPrimary) ??
          selectedColorImages[0] ??
          generalPrimaryImage ??
          sortedImages.find((image) => image.isPrimary) ??
          sortedImages[0]
        )
      : (
          generalPrimaryImage ??
          sortedImages.find((image) => image.isPrimary) ??
          sortedImages[0]
        );


  const manuallySelectedImage = sortedImages.find(
    (image) => image.id === selectedImageId
  );

  const selectedImage = manuallySelectedImage ?? primaryImage;

  const selectedImageIndex = selectedImage
    ? sortedImages.findIndex(
        (image) => image.id === selectedImage.id
      )
    : -1;

  return (
    <div className="w-full space-y-4">
      <div className="relative isolate aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(226,232,240,0.5),transparent_65%)]"
        />

        {selectedImage ? (
          <>
            <Image
              key={selectedImage.id}
              src={selectedImage.url}
              alt={selectedImage.alt ?? productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
              className="object-contain p-5 transition-transform duration-500 hover:scale-[1.03] sm:p-8 lg:p-10"
            />

            <div className="absolute bottom-3 right-3 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm sm:bottom-4 sm:right-4">
              {selectedImageIndex + 1} / {sortedImages.length}
            </div>

            {selectedImage.isPrimary && (
              <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 shadow-sm backdrop-blur-sm sm:left-4 sm:top-4">
                Main image
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-8"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="3"
                />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>

            <p className="text-sm font-medium">
              No images available
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Product images
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Images for all available colors
            </p>
          </div>

          {sortedImages.length > 0 && (
            <p className="text-xs text-slate-500">
              {sortedImages.length}{" "}
              {sortedImages.length === 1 ? "image" : "images"}
            </p>
          )}
        </div>

        {sortedImages.length > 0 ? (
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            aria-label="All product image thumbnails"
          >
            {sortedImages.map((image, index) => {
              const isSelected = selectedImage?.id === image.id;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImageId(image.id)}
                  aria-label={`View image ${index + 1} of ${sortedImages.length}${
                    image.colorOption?.name
                      ? `, ${image.colorOption.name}`
                      : ""
                  }`}
                  aria-pressed={isSelected}
                  className={`group relative size-[68px] shrink-0 overflow-hidden rounded-xl border-2 bg-white transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:size-20 ${
                    isSelected
                      ? "border-blue-600 shadow-sm"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={
                      image.alt ??
                      `${productName} - image ${index + 1}`
                    }
                    fill
                    sizes="80px"
                    className={`object-contain p-1.5 transition duration-200 ${
                      isSelected
                        ? "scale-100"
                        : "scale-95 group-hover:scale-100"
                    }`}
                  />

                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1 right-1 size-2 rounded-full bg-blue-600 ring-2 ring-white"
                    />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
            <p className="text-sm text-slate-500">
              No product images available.
            </p>
          </div>
        )}
      </div>

      {loading && (
        <p
          role="status"
          className="flex items-center gap-2 text-xs text-slate-500"
        >
          <span
            aria-hidden="true"
            className="size-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
          />
          Loading product images...
        </p>
      )}

      {error && (
        <p
          role="status"
          className="text-xs leading-5 text-amber-700"
        >
          Unable to refresh product images. Existing product images are still displayed.
        </p>
      )}
    </div>
  );
}