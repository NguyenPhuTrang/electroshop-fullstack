"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardRange } from "@/src/features/dashboard/services/dashboard.service";

type SalesOverviewItem = {
  date: string;
  revenue: number | string;
};

type RevenueOverviewChartProps = {
  data: SalesOverviewItem[] | undefined;
  loading: boolean;
  range: DashboardRange;
};

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value)} ₫`;
}

export default function RevenueOverviewChart({
  data,
  loading,
  range,
}: RevenueOverviewChartProps) {
  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Revenue Overview
          </h2>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Revenue from delivered orders by day.
          </p>
        </div>

        <span className="w-fit rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
          Last {range} days
        </span>
      </div>

      {/* Revenue Chart */}
      <div className="mt-6 h-72 w-full">
        {loading && !data ? (
          <div className="flex h-full items-center justify-center gap-3 text-sm text-slate-500">
            <span className="size-4 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
            Loading revenue data...
          </div>
        ) : !data?.length ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No revenue data available for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => {
                  const [, month, day] = value.split("-");
                  return month && day ? `${month}/${day}` : value;
                }}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />

              <YAxis
                tickFormatter={(value: number) =>
                  value >= 1000
                    ? `${(value / 1000).toFixed(0)}k`
                    : String(value)
                }
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />

              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value ?? 0)),
                  "Revenue",
                ]}
                labelFormatter={(label) => `Date: ${String(label)}`}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  fontSize: 12,
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#2563eb"
                strokeWidth={2}
                fill="#dbeafe"
                fillOpacity={0.8}
                activeDot={{
                  r: 4,
                  fill: "#2563eb",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}