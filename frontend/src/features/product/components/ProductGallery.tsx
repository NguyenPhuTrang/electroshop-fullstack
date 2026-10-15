
"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImage = {
  id: number;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const primaryImage =
    images.find((image) => image.isPrimary) ?? images[0];

  const [selectedImageId, setSelectedImageId] = useState<
    number | null
  >(null);

  const selectedImage =
    images.find((image) => image.id === selectedImageId) ??
    primaryImage;

  if (!primaryImage || !selectedImage) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-white shadow-sm">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="size-8"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>

        <p className="text-sm font-medium">
          No images available
        </p>
      </div>
    );
  }

  const sortedImages = [...images].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <div className="w-full space-y-4">
      {/* Main Image */}
      <div className="relative isolate aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-sm">
        {/* Subtle background decoration */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(226,232,240,0.5),transparent_65%)]"
        />

        <Image
          key={selectedImage.id}
          src={selectedImage.url}
          alt={selectedImage.alt ?? productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
          className="object-contain p-5 transition-transform duration-500 hover:scale-[1.03] sm:p-8 lg:p-10"
        />

        {/* Image Counter */}
        <div className="absolute bottom-3 right-3 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm sm:bottom-4 sm:right-4">
          {Math.max(
            sortedImages.findIndex(
              (image) => image.id === selectedImage.id
            ) + 1,
            1
          )}{" "}
          / {sortedImages.length}
        </div>

        {/* Primary Image Label */}
        {selectedImage.isPrimary && (
          <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 shadow-sm backdrop-blur-sm sm:left-4 sm:top-4">
            Main image
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {sortedImages.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              Product images
            </h3>

            <p className="text-xs text-slate-500">
              Select an image to view
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {sortedImages.map((image, index) => {
              const isSelected = selectedImage.id === image.id;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImageId(image.id)}
                  aria-label={`View image ${index + 1} of ${sortedImages.length}`}
                  aria-pressed={isSelected}
                  className={`group relative size-[68px] shrink-0 overflow-hidden rounded-xl border-2 bg-white transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 sm:size-20 ${
                    isSelected
                      ? "border-slate-900 shadow-sm"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt ?? `${productName} - image ${index + 1}`}
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
                      className="absolute bottom-1 right-1 size-2 rounded-full bg-slate-900 ring-2 ring-white"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
