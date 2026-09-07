import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  name: string;
  price: string;
  image?: string;
  slug: string;
  priority?: boolean;
};

export default function ProductCard({
  name,
  price,
  image,
  slug,
  priority = false,
}: ProductCardProps) {
  const formattedPrice = Number(price).toLocaleString("vi-VN");

  return (
    <Link href={`/products/${slug}`}>
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="relative h-64 w-full bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={priority}
              className="object-contain p-4"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              No image
            </div>
          )}
        </div>

        <div className="p-4">
          <h2 className="text-lg font-semibold">
            {name}
          </h2>

          <p className="mt-2">
            {formattedPrice} VND
          </p>
        </div>
      </div>
    </Link>
  );
}