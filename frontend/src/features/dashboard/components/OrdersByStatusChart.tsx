"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type OrderStatusItem = {
  status: string;
  count: number;
};

type OrdersByStatusChartProps = {
  data: OrderStatusItem[] | undefined;
  loading: boolean;
};

export default function OrdersByStatusChart({
  data,
  loading,
}: OrdersByStatusChartProps) {
  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Orders by Status
        </h2>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          Current order distribution.
        </p>
      </div>

      {/* Chart */}
      <div className="mt-6 h-72 w-full">
        {loading && !data ? (
          <div className="flex h-full items-center justify-center gap-3 text-sm text-slate-500">
            <span className="size-4 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
            Loading order data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data ?? []}
              layout="vertical"
              margin={{
                top: 5,
                right: 12,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                horizontal={false}
              />

              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="status"
                width={100}
                tickFormatter={(value: string) =>
                  value.replaceAll("_", " ")
                }
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                formatter={(value) => [
                  Number(value ?? 0),
                  "Orders",
                ]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  fontSize: 12,
                }}
              />

              <Bar
                dataKey="count"
                name="Orders"
                fill="#2563eb"
                radius={[0, 4, 4, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}