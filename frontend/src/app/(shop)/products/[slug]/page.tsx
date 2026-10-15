
import Link from "next/link";

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
  const reviews = await getReviewsByProductId(product.id);

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <li>
              <Link
                href="/"
                className="transition hover:text-slate-900"
              >
                Home
              </Link>
            </li>

            <li aria-hidden="true">/</li>

            <li>
              <Link
                href="/products"
                className="transition hover:text-slate-900"
              >
                Products
              </Link>
            </li>

            <li aria-hidden="true">/</li>

            <li
              aria-current="page"
              className="max-w-[200px] truncate font-medium text-slate-800 sm:max-w-sm"
            >
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Details */}
        <section
          aria-label="Product details"
          className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:p-5"
        >
          <div className="grid min-w-0 grid-cols-1 items-start gap-5 sm:gap-6 md:grid-cols-2 lg:gap-7">
            {/* Product Gallery */}
            <div className="mx-auto w-full min-w-0 max-w-[520px] md:mx-0">
              <ProductGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Product Information */}
            <div className="min-w-0">
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
          </div>
        </section>

        {/* Customer Reviews */}
        <section
          id="reviews"
          aria-label="Customer reviews"
          className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-6"
        >
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-cyan-500" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Customer feedback
              </p>
            </div>

            <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
              Customer Reviews
            </h2>
          </div>

          <div className="p-3 sm:p-5">
            <ReviewList reviews={reviews} />
          </div>
        </section>

        <div className="h-4" />
      </div>
    </main>
  );
}
