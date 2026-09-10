import ProductGallery from "@/src/features/product/components/ProductGallery";
import ProductInfor from "@/src/features/product/components/ProductInfor";
import { getProductBySlug } from "@/src/features/product/services/product.service";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  return (
    <main className="mx-auto max-w-7xl p-4">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery
          images={product.images}
          productName={product.name}
        />

       <ProductInfor
          productId={product.id}
          name={product.name}
          price={product.price}
          salePrice={product.salePrice}
          stock={product.stock}
          brandName={product.brand.name}
          categoryName={product.category.name}
          description={product.description}
        />
      </div>
    </main>
  );
}