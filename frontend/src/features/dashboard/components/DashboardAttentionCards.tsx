"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/src/i18n/navigation";

type DashboardAttentionSummary = {
  pendingOrders: number;
  lowStockProducts: number;
  unansweredReviews: number;
};

type DashboardAttentionCardsProps = {
  summary: DashboardAttentionSummary | undefined;
};

export default function DashboardAttentionCards({
  summary,
}: DashboardAttentionCardsProps) {
  const t = useTranslations("DashboardAttentionCards");
  const locale = useLocale();

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(locale).format(value);

  const cards = [
    {
      key: "pendingOrders",
      title: t("cards.pendingOrders.title"),
      description: t("cards.pendingOrders.description"),
      href: "/admin/orders?status=PENDING",
      label: t("cards.pendingOrders.action"),
      value: summary ? formatNumber(summary.pendingOrders) : "—",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      ),
      iconStyle: "bg-amber-50 text-amber-700",
      linkStyle: "text-amber-700",
      hoverStyle: "hover:border-amber-300 hover:bg-amber-50/30",
    },
    {
      key: "lowStockProducts",
      title: t("cards.lowStockProducts.title"),
      description: t("cards.lowStockProducts.description"),
      href: "/admin/products?lowStock=true",
      label: t("cards.lowStockProducts.action"),
      value: summary ? formatNumber(summary.lowStockProducts) : "—",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          <path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z" />
          <path d="m3.5 8.2 8.5 4.8 8.5-4.8M12 13v8" />
        </svg>
      ),
      iconStyle: "bg-orange-50 text-orange-700",
      linkStyle: "text-orange-700",
      hoverStyle: "hover:border-orange-300 hover:bg-orange-50/30",
    },
    {
      key: "unansweredReviews",
      title: t("cards.unansweredReviews.title"),
      description: t("cards.unansweredReviews.description"),
      href: "/admin/reviews?unanswered=true",
      label: t("cards.unansweredReviews.action"),
      value: summary ? formatNumber(summary.unansweredReviews) : "—",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
          <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4M12 16.5v.01" />
        </svg>
      ),
      iconStyle: "bg-rose-50 text-rose-700",
      linkStyle: "text-rose-700",
      hoverStyle: "hover:border-rose-300 hover:bg-rose-50/30",
    },
  ];

  return (
    <section className="mt-8">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          {t("section.title")}
        </h2>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {t("section.description")}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className={`group flex min-w-0 items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-colors ${card.hoverStyle}`}
          >
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${card.iconStyle}`}
            >
              {card.icon}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {card.title}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {card.description}
              </p>

              <p className={`mt-2 text-xs font-medium ${card.linkStyle}`}>
                {card.label} →
              </p>
            </div>

            <p className="shrink-0 text-2xl font-bold text-slate-900">
              {card.value}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}