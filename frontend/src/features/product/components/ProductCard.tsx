
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

type ProductCardProps = {
  name: string;
  price?: string | null;
  salePrice?: string | null;
  image?: string | null;
  slug: string;
  priority?: boolean;
};

function parsePrice(value?: string | null): number | null {
  if (value == null || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function formatPrice(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductCard({
  name,
  price,
  salePrice,
  image,
  slug,
  priority = false,
}: ProductCardProps) {
  const t = useTranslations("ProductCard");
  const locale = useLocale();

  const regularPrice = parsePrice(price);
  const discountedPrice = parsePrice(salePrice);

  const hasSale =
    regularPrice !== null &&
    discountedPrice !== null &&
    discountedPrice < regularPrice;

  const formattedPrice =
    regularPrice !== null
      ? formatPrice(regularPrice, locale)
      : null;

  const formattedSalePrice =
    hasSale && discountedPrice !== null
      ? formatPrice(discountedPrice, locale)
      : null;

  return (
    <Link
      href={`/products/${slug}`}
      className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-[border-color,box-shadow] duration-300 group-hover:border-blue-200 group-hover:shadow-lg group-hover:shadow-slate-900/5">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-slate-50 to-white">
          {image ? (
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.04 }}
              transition={{
                duration: 0.35,
                ease: "easeOut",
              }}
            >
              <Image
                src={image}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={priority}
                className="object-contain p-4 sm:p-5"
              />
            </motion.div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-xl"
              >
                ✳
              </span>

              <span className="text-xs font-medium">
                {t("imageUnavailable")}
              </span>
            </div>
          )}

          {hasSale && (
            <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              {t("sale")}
            </span>
          )}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-slate-100"
          />
        </div>

        <div className="flex flex-1 flex-col p-2.5 sm:p-3">
          <h2 className="min-h-[2.25rem] line-clamp-2 text-sm font-semibold leading-5 tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-blue-700 sm:text-base">
            {name}
          </h2>

          <div className="mt-1.5 flex flex-1 flex-col">
            {hasSale && formattedSalePrice && formattedPrice ? (
              <>
                <p className="text-sm font-bold tracking-tight text-blue-600 sm:text-base">
                  {formattedSalePrice}
                </p>

                <p className="mt-0.5 text-xs text-slate-400 line-through">
                  {formattedPrice}
                </p>
              </>
            ) : formattedPrice ? (
              <p className="text-sm font-bold tracking-tight text-blue-600 sm:text-base">
                {formattedPrice}
              </p>
            ) : (
              <p className="text-sm font-medium text-slate-400">
                {t("priceUnavailable")}
              </p>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-xs font-medium text-slate-500">
              {t("viewProduct")}
            </span>

            <motion.span
              aria-hidden="true"
              className="flex size-6 items-center justify-center rounded-full bg-slate-50 text-sm text-slate-600 transition-colors duration-200 group-hover:bg-blue-600 group-hover:text-white"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.span>
          </div>
        </div>
      </article>
    </Link>
  );
}
