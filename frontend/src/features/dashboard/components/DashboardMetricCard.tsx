import type { ReactNode } from "react";

type DashboardMetricCardProps = {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  iconStyle: string;
};

export default function DashboardMetricCard({
  label,
  value,
  description,
  icon,
  iconStyle,
}: DashboardMetricCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-cyan-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>
          
          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
}