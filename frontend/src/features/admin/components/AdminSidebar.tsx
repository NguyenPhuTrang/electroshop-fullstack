"use client";

import { Link, usePathname } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";

type SidebarIconName =
    | "dashboard"
    | "products"
    | "brands"
    | "categories"
    | "orders"
    | "users"
    | "reviews";

type AdminSidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

const NAV_ITEMS: {
    labelKey: string;
    href: string;
    icon: SidebarIconName;
}[] = [
    {
        labelKey: "dashboard",
        href: "/admin",
        icon: "dashboard",
    },
    {
        labelKey: "brands",
        href: "/admin/brands",
        icon: "brands",
    },
    {
        labelKey: "categories",
        href: "/admin/categories",
        icon: "categories",
    },
    {
        labelKey: "products",
        href: "/admin/products",
        icon: "products",
    },
    {
        labelKey: "orders",
        href: "/admin/orders",
        icon: "orders",
    },
    {
        labelKey: "users",
        href: "/admin/users",
        icon: "users",
    },
    {
        labelKey: "reviews",
        href: "/admin/reviews",
        icon: "reviews",
    },
];

function SidebarIcon({
    name,
}: {
    name: SidebarIconName;
}) {
    const iconPaths = {
        dashboard: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </>
        ),

        brands: (
            <>
                <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l3.59-3.59a2 2 0 0 0 0-2.59Z" />
                <circle cx="7.5" cy="7.5" r="1.25" />
            </>
        ),

        categories: (
            <>
                <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                <path d="m3 12 9 5 9-5" />
                <path d="m3 16 9 5 9-5" />
            </>
        ),

        products: (
            <>
                <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
            </>
        ),

        orders: (
            <>
                <path d="M6 3h12l3 5v13H3V8l3-5Z" />
                <path d="M3 8h18M9 12h6M9 16h6" />
            </>
        ),

        users: (
            <>
                <circle cx="9" cy="8" r="4" />
                <path d="M2 21v-2a7 7 0 0 1 14 0v2" />
                <path d="M16 4.5a4 4 0 0 1 0 7.5m2 3a6 6 0 0 1 4 5.5v.5" />
            </>
        ),

        reviews: (
            <>
                <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                <path d="m9 12 2 2 4-4" />
            </>
        ),
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
        >
            {iconPaths[name]}
        </svg>
    );
}

export default function AdminSidebar({
    isOpen,
    onClose,
}: AdminSidebarProps) {
    const t = useTranslations("AdminSidebar");
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin";
        }

        return (
            pathname === href ||
            pathname.startsWith(`${href}/`)
        );
    };

    return (
        <>
            {/* Backdrop behind the drawer (mobile/tablet only) */}
            {isOpen && (
                <div
                    aria-hidden="true"
                    onClick={onClose}
                    className="fixed inset-0 z-[55] bg-slate-900/40 lg:hidden"
                />
            )}

            {/* Drawer below 1024px, sticky sidebar from 1024px up */}
            <aside
                className={`fixed inset-y-0 left-0 z-[60] flex w-64 max-w-[85vw] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } lg:sticky lg:top-0 lg:z-40 lg:h-screen lg:max-w-none lg:translate-x-0`}
            >
                {/* Brand */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-6">
                    <Link
                        href="/admin"
                        onClick={onClose}
                        className="group flex min-w-0 items-center gap-3 rounded-xl"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition group-hover:bg-blue-700">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-6 w-6"
                                aria-hidden="true"
                            >
                                <path d="M13 2 4 14h7l-1 8 10-12h-7l1-8Z" />
                            </svg>
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                Electroshop
                            </h2>

                            <p className="mt-0.5 text-xs font-medium text-slate-500">
                                {t("adminPanel")}
                            </p>
                        </div>
                    </Link>

                    {/* Close button (drawer only) */}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t("closeMenu")}
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 lg:hidden"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            className="size-5"
                            aria-hidden="true"
                        >
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav
                    aria-label={t("navigationLabel")}
                    className="flex-1 px-3 py-6"
                >
                    <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        {t("workspace")}
                    </p>

                    <div className="space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    aria-current={active ? "page" : undefined}
                                    className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors duration-200 ${
                                        active
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                >
                                    {active && (
                                        <motion.span
                                            layoutId="admin-sidebar-active"
                                            className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-blue-600"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                        />
                                    )}

                                    <span
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                            active
                                                ? "bg-white text-blue-600 shadow-sm"
                                                : "text-slate-400 group-hover:bg-white group-hover:text-blue-600"
                                        }`}
                                    >
                                        <SidebarIcon name={item.icon} />
                                    </span>

                                    <span className="flex-1">
                                        {t(item.labelKey)}
                                    </span>

                                    {active && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="h-1.5 w-1.5 rounded-full bg-cyan-500"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer */}
                <div className="border-t border-slate-100 p-4">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
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
                                    <path d="M12 3 4 6v5c0 5 3.4 8.3 8 10 4.6-1.7 8-5 8-10V6l-8-3Z" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-800">
                                    {t("administration")}
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    {t("storeManagement")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="mt-4 text-center text-[11px] text-slate-400">
                        {t("footer")}
                    </p>
                </div>
            </aside>
        </>
    );
}