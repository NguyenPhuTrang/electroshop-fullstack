"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import LogoutButton from "../../auth/components/LogoutButton";
import { useUser } from "@/src/hooks/useUser";

export default function UserMenu() {
    const { user, loading } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {loading ? (
                // 1. Loading account information
                <div
                    className="h-9 w-24 animate-pulse rounded-xl bg-slate-100"
                    aria-hidden="true"
                />
            ) : !user ? (
                // 2. Not logged in
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4"
                    >
                        Login
                    </Link>

                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:px-5"
                    >
                        Register
                    </Link>
                </div>
            ) : (
                // 3. Logged in
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen((current) => !current)}
                        aria-haspopup="menu"
                        aria-expanded={isOpen}
                        aria-controls="user-menu-dropdown"
                        className={`flex max-w-[220px] items-center gap-2 rounded-xl border px-2 py-1.5 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/10 sm:gap-3 sm:px-3 ${
                            isOpen
                                ? "border-blue-200 bg-blue-50"
                                : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        {user.avatarUrl ? (
                            <Image
                                src={user.avatarUrl}
                                alt={user.name}
                                width={36}
                                height={36}
                                className="h-9 w-9 shrink-0 rounded-full border border-slate-200 object-cover"
                            />
                        ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <span className="max-w-[110px] truncate text-sm font-semibold text-slate-700">
                            {user.name}
                        </span>

                        <motion.svg
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-4 w-4 shrink-0 text-slate-400"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m6 9 6 6 6-6"
                            />
                        </motion.svg>
                    </button>

                    {/* Account Dropdown */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                id="user-menu-dropdown"
                                initial={{
                                    opacity: 0,
                                    y: 8,
                                    scale: 0.98,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: 5,
                                    scale: 0.98,
                                }}
                                transition={{ duration: 0.16 }}
                                className="absolute right-0 z-50 mt-3 w-60 origin-top-right mt-5"
                            >
                                {/* Outer Triangle Border */}
                                <span
                                    aria-hidden="true"
                                    className="absolute -top-[9px] right-5 z-20 h-0 w-0 border-x-[9px] border-b-[9px] border-x-transparent border-b-slate-200"
                                />

                                {/* Inner Triangle */}
                                <span
                                    aria-hidden="true"
                                    className="absolute -top-[7px] right-[21px] z-30 h-0 w-0 border-x-[8px] border-b-[8px] border-x-transparent border-b-white"
                                />

                                {/* Dropdown Panel */}
                                <div
                                    role="menu"
                                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
                                >
                                    {/* Menu Items */}
                                    <div className="space-y-1 p-2">
                                        {/* Admin */}
                                        {user.role === "ADMIN" && (
                                            <Link
                                                href="/admin"
                                                role="menuitem"
                                                onClick={() =>
                                                    setIsOpen(false)
                                                }
                                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.7"
                                                        className="h-4 w-4"
                                                        aria-hidden="true"
                                                    >
                                                        <rect
                                                            x="3"
                                                            y="3"
                                                            width="7"
                                                            height="7"
                                                            rx="1.5"
                                                        />
                                                        <rect
                                                            x="14"
                                                            y="3"
                                                            width="7"
                                                            height="7"
                                                            rx="1.5"
                                                        />
                                                        <rect
                                                            x="3"
                                                            y="14"
                                                            width="7"
                                                            height="7"
                                                            rx="1.5"
                                                        />
                                                        <rect
                                                            x="14"
                                                            y="14"
                                                            width="7"
                                                            height="7"
                                                            rx="1.5"
                                                        />
                                                    </svg>
                                                </span>

                                                Admin Dashboard
                                            </Link>
                                        )}

                                        {/* My Account */}
                                        <Link
                                            href="/account"
                                            role="menuitem"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                        >
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="8"
                                                        r="4"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M4 21v-2a8 8 0 0 1 16 0v2"
                                                    />
                                                </svg>
                                            </span>

                                            My Account
                                        </Link>

                                        {/* Orders */}
                                        <Link
                                            href="/orders"
                                            role="menuitem"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                        >
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M6 3h12l3 5v13H3V8l3-5Z" />
                                                    <path d="M3 8h18M9 12h6M9 16h6" />
                                                </svg>
                                            </span>

                                            Orders
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-slate-100 p-2">
                                        <div className="cursor-pointer rounded-xl transition-colors duration-200 hover:bg-rose-50">
                                            <LogoutButton />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </>
    );
}