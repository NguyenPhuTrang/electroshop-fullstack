import ProductGallery from "@/src/features/product/components/ProductGallery";
import ProductInfor from "@/src/features/product/components/ProductInfor";
import { getProductBySlug } from "@/src/features/product/services/product.service";
import ReviewList from "@/src/features/review/components/ReviewList";
import { getReviewsByProductId } from "@/src/features/review/services/review.service";

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

  const reviews = await getReviewsByProductId(product.id)

 return (
    <main className="mx-auto max-w-7xl p-4">
      {/* Product */}
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
          reviews={reviews}
        />
      </div>

      {/* Reviews */}
      <section className="mt-12 border-t pt-10">
        <ReviewList reviews={reviews}
         />
      </section>
    </main>
  );
}