import Image from "next/image";

type ProductImage = {
    id: number,
    url: string,
    alt: string | null,
    isPrimary: boolean,
    sortOrder: number
};

type ProductGalleryProps = {
    images: ProductImage[];
    productName: string
};

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const primaryImage =
    images.find((image) => image.isPrimary) ?? images[0];

    if(!primaryImage)
    {
        return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        No image
      </div>
    );
    }

      return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-white">
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt ?? productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4"
        />
      </div>
    </div>
  );
}
