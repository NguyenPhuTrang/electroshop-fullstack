"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

type SidebarIconName =
    | "dashboard"
    | "products"
    | "orders"
    | "users"
    | "reviews";

const NAV_ITEMS: {
    label: string;
    href: string;
    icon: SidebarIconName;
}[] = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: "dashboard",
    },
    {
        label: "Products",
        href: "/admin/products",
        icon: "products",
    },
    {
        label: "Orders",
        href: "/admin/orders",
        icon: "orders",
    },
    {
        label: "Users",
        href: "/admin/users",
        icon: "users",
    },
    {
        label: "Reviews",
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

        products: (
            <>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m12 3 9 5-9 5-9-5 9-5Z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m3 12 9 5 9-5M3 16l9 5 9-5"
                />
            </>
        ),

        orders: (
            <>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 3h12l3 5v13H3V8l3-5Z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8h18M9 12h6M9 16h6"
                />
            </>
        ),

        users: (
            <>
                <circle cx="9" cy="8" r="4" />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2 21v-2a7 7 0 0 1 14 0v2"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 4.5a4 4 0 0 1 0 7.5m2 3a6 6 0 0 1 4 5.5v.5"
                />
            </>
        ),

        reviews: (
            <>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 12 2 2 4-4"
                />
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

export default function AdminSidebar() {
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
        <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
            {/* Brand */}
            <div className="border-b border-slate-100 px-5 py-6">
                <Link
                    href="/admin"
                    className="group flex items-center gap-3 rounded-xl"
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
                            Admin Panel
                        </p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav
                aria-label="Admin navigation"
                className="flex-1 px-3 py-6"
            >
                <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Workspace
                </p>

                <div className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={
                                    active ? "page" : undefined
                                }
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
                                    {item.label}
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
                                Administration
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-500">
                                Store management
                            </p>
                        </div>
                    </div>
                </div>

                <p className="mt-4 text-center text-[11px] text-slate-400">
                    Electroshop Admin
                </p>
            </div>
        </aside>
    );
}