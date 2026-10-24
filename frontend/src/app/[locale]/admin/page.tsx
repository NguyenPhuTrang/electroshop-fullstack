"use client";

import { useEffect, useState } from "react";

import { useAdminDashboard } from "@/src/features/dashboard/hooks/useAdminDashboard";
import type { DashboardRange } from "@/src/features/dashboard/services/dashboard.service";

import DashboardLoadingSkeleton from "@/src/features/dashboard/components/DashboardLoadingSkeleton";
import DashboardMetricCard from "@/src/features/dashboard/components/DashboardMetricCard";
import DashboardAttentionCards from "@/src/features/dashboard/components/DashboardAttentionCards";
import RecentOrdersTable from "@/src/features/dashboard/components/RecentOrdersTable";
import RecentReviews from "@/src/features/dashboard/components/RecentReviews";
import RevenueOverviewChart from "@/src/features/dashboard/components/RevenueOverviewChart";
import OrdersByStatusChart from "@/src/features/dashboard/components/OrdersByStatusChart";

const DASHBOARD_RANGES: {
  label: string;
  value: DashboardRange;
}[] = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value)} ₫`;

type MetricIconName =
  | "users"
  | "products"
  | "orders"
  | "revenue"
  | "pending"
  | "stock"
  | "reviews"
  | "rating"
  | "unanswered";

function MetricIcon({ name }: { name: MetricIconName }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "size-5",
    "aria-hidden": true as const,
  };

  switch (name) {
    case "users":
      return (
        <svg {...commonProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case "products":
      return (
        <svg {...commonProps}>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 8 9 5 9-5M3 8v8l9 5 9-5V8M12 13v8" />
        </svg>
      );

    case "orders":
      return (
        <svg {...commonProps}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 3V2h6v1M9 9h6M9 13h6M9 17h3" />
        </svg>
      );

    case "revenue":
      return (
        <svg {...commonProps}>
          <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );

    case "pending":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "stock":
      return (
        <svg {...commonProps}>
          <path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z" />
          <path d="m3.5 8.2 8.5 4.8 8.5-4.8M12 13v8" />
        </svg>
      );

    case "reviews":
      return (
        <svg {...commonProps}>
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
        </svg>
      );

    case "rating":
      return (
        <svg {...commonProps}>
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
        </svg>
      );

    case "unanswered":
      return (
        <svg {...commonProps}>
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
          <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4M12 16.5v.01" />
        </svg>
      );
  }
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default function AdminPage() {
  const [range, setRange] = useState<DashboardRange>(7);

  const [minimumLoadingTimeElapsed, setMinimumLoadingTimeElapsed] =
    useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMinimumLoadingTimeElapsed(true);
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const { data, loading, error, refetch } = useAdminDashboard(range);

  const summary = data?.summary;

  const stats: {
    label: string;
    value: string;
    description: string;
    icon: MetricIconName;
    iconStyle: string;
  }[] = [
    {
      label: "Total Users",
      value: summary ? formatNumber(summary.totalUsers) : "—",
      description: "Registered customers",
      icon: "users",
      iconStyle: "bg-blue-50 text-blue-700",
    },
    {
      label: "Total Products",
      value: summary ? formatNumber(summary.totalProducts) : "—",
      description: "Products in catalog",
      icon: "products",
      iconStyle: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Total Orders",
      value: summary ? formatNumber(summary.totalOrders) : "—",
      description: "All orders",
      icon: "orders",
      iconStyle: "bg-blue-50 text-blue-700",
    },
    {
      label: "Total Revenue",
      value: summary ? formatCurrency(summary.totalRevenue) : "—",
      description: "From delivered orders",
      icon: "revenue",
      iconStyle: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending Orders",
      value: summary ? formatNumber(summary.pendingOrders) : "—",
      description: "Awaiting confirmation",
      icon: "pending",
      iconStyle: "bg-amber-50 text-amber-700",
    },
    {
      label: "Low Stock Products",
      value: summary ? formatNumber(summary.lowStockProducts) : "—",
      description: "10 units or fewer",
      icon: "stock",
      iconStyle: "bg-orange-50 text-orange-700",
    },
    {
      label: "Total Reviews",
      value: summary ? formatNumber(summary.totalReviews) : "—",
      description: "Customer feedback",
      icon: "reviews",
      iconStyle: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Average Rating",
      value: summary ? `${summary.averageRating.toFixed(1)} / 5` : "—",
      description: "Across all reviews",
      icon: "rating",
      iconStyle: "bg-amber-50 text-amber-700",
    },
    {
      label: "Unanswered Reviews",
      value: summary ? formatNumber(summary.unansweredReviews) : "—",
      description: "Reviews without a reply",
      icon: "unanswered",
      iconStyle: "bg-rose-50 text-rose-700",
    },
  ];

  // Ensure every supported order status appears on the chart.
  const orderStatusChartData = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ].map((status) => ({
    status,
    count:
      data?.ordersByStatus.find((item) => item.status === status)?.count ?? 0,
  }));

  // Initial loading state.
  if (!error && (!minimumLoadingTimeElapsed || loading || !data)) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <main className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Electroshop Administration
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Monitor your store performance, orders, products, and customer activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={loading}
            className="group inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              className={`h-4 w-4 transition-transform duration-300 ${
                loading ? "animate-spin" : "group-hover:rotate-180"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h5M20 20v-5h-5"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.5 9A7 7 0 0 1 18 6l2 3M4 15l2 3a7 7 0 0 0 12.5-3"
              />
            </svg>

            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </header>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <span aria-hidden="true" className="font-semibold">
              !
            </span>

            <p>{error}</p>
          </div>
        )}

        {/* Store Overview */}
        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              title="Store Overview"
              description="Key metrics and performance indicators for your store."
            />

            <div
              className="inline-flex w-fit items-center gap-1 rounded-lg border border-slate-200 bg-white p-1"
              role="group"
              aria-label="Sales chart date range"
            >
              {DASHBOARD_RANGES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRange(item.value)}
                  aria-pressed={range === item.value}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    range === item.value
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <DashboardMetricCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                description={stat.description}
                icon={<MetricIcon name={stat.icon} />}
                iconStyle={stat.iconStyle}
              />
            ))}
          </div>
        </section>

        {/* Charts */}
        <section className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="min-w-0 xl:col-span-2">
            <RevenueOverviewChart
              data={data?.salesOverview}
              loading={loading}
              range={range}
            />
          </div>

          <OrdersByStatusChart
            data={orderStatusChartData}
            loading={loading}
          />
        </section>

        {/* Things Need Attention */}
        <DashboardAttentionCards summary={summary} />

        {/* Recent Orders */}
        <RecentOrdersTable orders={data?.recentOrders ?? []} />

        {/* Recent Reviews */}
        <RecentReviews reviews={data?.recentReviews ?? []} />

        <div className="h-6 sm:h-8" />
      </div>
    </main>
  );
}