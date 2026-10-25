import { useTranslations } from "next-intl";

export default function Footer() {
    const t = useTranslations("Footer");

    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-3 sm:px-4 lg:px-6">
                {/* Brand */}
                <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                        >
                            <path d="M13 2 4 14h7l-1 8 10-12h-7l1-8Z" />
                        </svg>
                    </span>

                    <span className="text-sm font-semibold tracking-tight text-slate-700">
                        Electroshop
                    </span>
                </div>

                {/* Copyright */}
                <p className="text-center text-xs text-slate-500 sm:text-sm">
                    {t("copyright")}
                </p>
            </div>
        </footer>
    );
}