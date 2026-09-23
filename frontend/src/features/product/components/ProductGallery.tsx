"use client";

import { useState } from "react";
import Image from "next/image";

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

  const [selectedImage, setSelectedImage] = useState(primaryImage);

  if (!primaryImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        No image
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* main image */}
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-white">
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt ?? productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4"
        />
      </div>
      {/* arra thumbnail image */}
      <div className="flex gap-3 overflow-x-auto">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 ${
                selectedImage.id === image.id
                  ? "border-black"
                  : "border-gray-200"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt ?? productName}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
    </div>

    </div>

  );
}