"use client";

import { useMemo } from "react";
import { useProductSpecifications } from "../hooks/useProductSpecifications";

type TechnicalSpecificationsProps = {
  productId: number;
};

export default function TechnicalSpecifications({
  productId,
}: TechnicalSpecificationsProps) {
  const {
    specifications,
    loading,
    error,
    refetch,
  } = useProductSpecifications(productId);

  // Group specifications by groupName
  const groups = useMemo(() => {
    const grouped = new Map<
      string,
      typeof specifications
    >();

    for (const specification of specifications) {
      const groupName =
        specification.groupName?.trim() || "General";

      const currentGroup = grouped.get(groupName) ?? [];

      currentGroup.push(specification);
      grouped.set(groupName, currentGroup);
    }

    return Array.from(grouped.entries());
  }, [specifications]);

  return (
    <section
      aria-label="Technical specifications"
      className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-6"
    >
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-cyan-500" />

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Product Details
          </p>
        </div>

        <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
          Technical Specifications
        </h2>
      </div>

      <div className="p-3 sm:p-5">
        {/* Loading */}
        {loading && (
          <div
            className="animate-pulse space-y-3"
            aria-label="Loading technical specifications"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 border-b border-slate-100 py-3 last:border-0"
              >
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-4 w-full rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-8 text-center">
            <p className="text-sm text-rose-600">{error}</p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && specifications.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            No technical specifications available for this product yet.
          </p>
        )}

        {/* Specifications */}
        {!loading && !error && specifications.length > 0 && (
          <div className="space-y-6">
            {groups.map(([groupName, items]) => (
              <div key={groupName}>
                <h3 className="mb-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                  {groupName}
                </h3>

                <table className="w-full table-fixed border-collapse text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {items.map((specification) => (
                      <tr key={specification.id}>
                        <th
                          scope="row"
                          className="w-[40%] break-words px-3 py-3 text-left align-top font-medium text-slate-500"
                        >
                          {specification.label}
                        </th>

                        <td className="break-words px-3 py-3 align-top leading-6 text-slate-800">
                          {specification.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}