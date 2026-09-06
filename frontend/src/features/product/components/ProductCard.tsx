type ProductCardProps = {
  name: string;
  price: string;
};

export default function ProductCard({
  name,
  price,
}: ProductCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">
        {name}
      </h2>

      <p className="mt-2">
        {price.toLocaleString()} VND
      </p>
    </div>
  );
}