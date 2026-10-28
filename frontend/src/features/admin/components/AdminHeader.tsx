"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

type AdminHeaderProps = {
    onMenuClick: () => void;
};

export default function AdminHeader({
    onMenuClick,
}: AdminHeaderProps) {
    const t = useTranslations("AdminHeader");

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                {/* Open sidebar (mobile/tablet only) */}
                <button
                    type="button"
                    onClick={onMenuClick}
                    aria-label={t("openMenu")}
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 lg:hidden"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        className="h-5 w-5"
                        aria-hidden="true"
                    >
                        <path d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                </button>

                {/* Back to Store (icon only on very small screens) */}
                <Link
                    href="/"
                    aria-label={t("backToStore")}
                    className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 sm:px-3.5"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                        aria-hidden="true"
                    >
                        <path d="M19 12H5" />
                        <path d="m12 19-7-7 7-7" />
                    </svg>

                    <span className="hidden min-[400px]:inline">
                        {t("backToStore")}
                    </span>
                </Link>

                <div className="hidden h-7 w-px bg-slate-200 md:block" />

                <div className="hidden min-w-0 md:block">
                    <p className="truncate text-sm font-semibold text-slate-800">
                        {t("title")}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                        {t("description")}
                    </p>
                </div>
            </div>

            {/* Workspace badge + Admin badge */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <div className="hidden items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 sm:flex">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-xs font-semibold text-emerald-700">
                        {t("workspace")}
                    </span>
                </div>

                <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600"
                    aria-label={t("administrator")}
                    title={t("administrator")}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.7}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                        aria-hidden="true"
                    >
                        <path d="M12 3 4.5 6v5c0 4.5 3 7.8 7.5 10 4.5-2.2 7.5-5.5 7.5-10V6L12 3Z" />
                        <path d="m9 12 2 2 4-4" />
                    </svg>
                </div>
            </div>
        </header>
    );
}