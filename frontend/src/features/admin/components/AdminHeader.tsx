"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/src/i18n/navigation";

export default function AdminHeader() {
    const t = useTranslations("AdminHeader");
    const locale = useLocale();

    const router = useRouter();
    const pathname = usePathname();

    const handleLocaleChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const nextLocale = event.target.value;

        router.replace(pathname, {
            locale: nextLocale,
        });
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
            {/* Back to Store */}
            <div className="flex min-w-0 items-center gap-4">
                <Link
                    href="/"
                    className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
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

                    <span>{t("backToStore")}</span>
                </Link>

                <div className="hidden h-7 w-px bg-slate-200 sm:block" />

                <div className="hidden min-w-0 sm:block">
                    <p className="truncate text-sm font-semibold text-slate-800">
                        {t("title")}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                        {t("description")}
                    </p>
                </div>
            </div>

            {/* Language Switcher + Admin Badge */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <label
                    htmlFor="admin-language"
                    className="sr-only"
                >
                    {t("selectLanguage")}
                </label>

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