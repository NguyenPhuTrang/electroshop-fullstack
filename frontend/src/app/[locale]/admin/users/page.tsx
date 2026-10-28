"use client";

import { useAdminUsers } from "@/src/hooks/useAdminUser";
import { useRouter } from "@/src/i18n/navigation";
import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

const USER_ROLES = ["USER", "ADMIN"];

const USER_STATUSES = ["ACTIVE", "INACTIVE", "BANNED"];

const inputClassName =
    "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const getRoleClassName = (userRole: string) => {
    switch (userRole) {
        case "ADMIN":
            return "border-blue-200 bg-blue-50 text-blue-700";

        case "USER":
            return "border-cyan-200 bg-cyan-50 text-cyan-700";

        default:
            return "border-slate-200 bg-slate-50 text-slate-600";
    }
};

const getStatusClassName = (userStatus: string) => {
    switch (userStatus) {
        case "ACTIVE":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";

        case "INACTIVE":
            return "border-slate-200 bg-slate-100 text-slate-600";

        case "BANNED":
            return "border-rose-200 bg-rose-50 text-rose-700";

        default:
            return "border-slate-200 bg-slate-50 text-slate-600";
    }
};

function UserTableSkeleton() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, index) => (
                <tr
                    key={index}
                    className="animate-pulse border-b border-slate-100 last:border-b-0"
                >
                    <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100" />

                            <div className="space-y-2">
                                <div className="h-3.5 w-28 rounded bg-slate-100" />
                                <div className="h-3 w-16 rounded bg-slate-100" />
                            </div>
                        </div>
                    </td>

                    <td className="px-5 py-4">
                        <div className="h-3.5 w-36 rounded bg-slate-100" />
                    </td>

                    <td className="px-5 py-4">
                        <div className="h-7 w-20 rounded-lg bg-slate-100" />
                    </td>

                    <td className="px-5 py-4">
                        <div className="h-7 w-20 rounded-lg bg-slate-100" />
                    </td>

                    <td className="px-5 py-4">
                        <div className="h-3.5 w-20 rounded bg-slate-100" />
                    </td>

                    <td className="px-5 py-4">
                        <div className="h-8 w-16 rounded-lg bg-slate-100" />
                    </td>
                </tr>
            ))}
        </>
    );
}

export default function AdminUsersPage() {
    const t = useTranslations("AdminUsersPage");
    const locale = useLocale();
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [page, setPage] = useState(1);

    const limit = 10;

    const {
        users,
        pagination,
        loading,
        error,
    } = useAdminUsers({
        page,
        limit,
        role: role || undefined,
        status: status || undefined,
        search: search || undefined,
    });

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleRoleChange = (value: string) => {
        setRole(value);
        setPage(1);
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        setPage(1);
    };

    const formatDate = (value: string) => {
        return new Date(value).toLocaleDateString(locale, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Show a translated label for a role/status code, or the raw code if unknown.
    const getLabel = (group: "roles" | "statuses", value: string) =>
        t.has(`${group}.${value}`) ? t(`${group}.${value}`) : value;

    const hasFilters = Boolean(search || role || status);

    const clearFilters = () => {
        setSearch("");
        setRole("");
        setStatus("");
        setRoleDropdownOpen(false);
        setStatusDropdownOpen(false);
        setPage(1);
    };

    return (
        <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="min-h-full bg-[#f7f8fa] p-4 sm:p-6 lg:p-8"
        >
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-6"
                >
                    <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                            <span className="h-2 w-2 rounded-full bg-cyan-500" />
                            {t("adminWorkspace")}
                        </div>

                        <h1 className="break-words text-xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                            {t("title")}
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                            {t("subtitle")}
                        </p>
                    </div>

                    <div className="flex w-fit shrink-0 items-center gap-2 self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:self-auto">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                />
                                <circle cx="10" cy="7" r="4" />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20 8v6m3-3h-6"
                                />
                            </svg>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-slate-500">
                                {t("currentPage")}
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                                {t("currentPageValue", {
                                    page: pagination.page,
                                    total: pagination.totalPages,
                                })}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
                >
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-800">
                                {t("searchAndFilters")}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {t("searchAndFiltersDesc")}
                            </p>
                        </div>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-2 self-start text-sm font-medium text-blue-600 transition hover:text-blue-700 sm:mt-0"
                            >
                                {t("clearFilters")}
                            </button>
                        )}
                    </div>

                    {/* One column on phones, two columns on tablets, three columns on wide screens */}
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {/* Search */}
                        <div className="relative min-w-0">
                            <label
                                htmlFor="user-search"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                {t("searchUsers")}
                            </label>

                            <div className="relative">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path strokeLinecap="round" d="m16 16 4 4" />
                                </svg>

                                <input
                                    id="user-search"
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        handleSearchChange(event.target.value)
                                    }
                                    placeholder={t("searchPlaceholder")}
                                    className={`${inputClassName} pl-9 pr-3`}
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="relative min-w-0">
                            <label
                                htmlFor="user-role"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                {t("role")}
                            </label>

                            <button
                                id="user-role"
                                type="button"
                                aria-label={t("role")}
                                aria-haspopup="listbox"
                                aria-expanded={roleDropdownOpen}
                                onClick={() => {
                                    setRoleDropdownOpen((open) => !open);
                                    setStatusDropdownOpen(false);
                                }}
                                className={`flex h-11 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left text-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${roleDropdownOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}
                            >
                                <span className="min-w-0 truncate text-slate-700">
                                    {role ? getLabel("roles", role) : t("allRoles")}
                                </span>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`}
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>

                            {roleDropdownOpen && (
                                <>
                                    <button
                                        type="button"
                                        aria-label={t("role")}
                                        className="fixed inset-0 z-40 cursor-default"
                                        onClick={() => setRoleDropdownOpen(false)}
                                    />
                                    <div
                                        role="listbox"
                                        aria-label={t("role")}
                                        className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/60"
                                    >
                                        {[
                                            { value: "", label: t("allRoles") },
                                            ...USER_ROLES.map((userRole) => ({
                                                value: userRole,
                                                label: getLabel("roles", userRole),
                                            })),
                                        ].map((option) => (
                                            <button
                                                key={option.value || "all-roles"}
                                                type="button"
                                                role="option"
                                                aria-selected={role === option.value}
                                                onClick={() => {
                                                    handleRoleChange(option.value);
                                                    setRoleDropdownOpen(false);
                                                }}
                                                className={`flex min-h-10 w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors ${role === option.value ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
                                            >
                                                <span className="min-w-0 flex-1 truncate">
                                                    {option.label}
                                                </span>
                                                {role === option.value && (
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        aria-hidden="true"
                                                        className="ml-2 h-4 w-4 shrink-0 text-blue-600"
                                                    >
                                                        <path d="m5 12 4 4L19 6" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Status */}
                        <div className="relative min-w-0">
                            <label
                                htmlFor="user-status"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                {t("status")}
                            </label>

                            <button
                                id="user-status"
                                type="button"
                                aria-label={t("status")}
                                aria-haspopup="listbox"
                                aria-expanded={statusDropdownOpen}
                                onClick={() => {
                                    setStatusDropdownOpen((open) => !open);
                                    setRoleDropdownOpen(false);
                                }}
                                className={`flex h-11 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left text-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${statusDropdownOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}
                            >
                                <span className="min-w-0 truncate text-slate-700">
                                    {status ? getLabel("statuses", status) : t("allStatuses")}
                                </span>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${statusDropdownOpen ? "rotate-180" : ""}`}
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>

                            {statusDropdownOpen && (
                                <>
                                    <button
                                        type="button"
                                        aria-label={t("status")}
                                        className="fixed inset-0 z-40 cursor-default"
                                        onClick={() => setStatusDropdownOpen(false)}
                                    />
                                    <div
                                        role="listbox"
                                        aria-label={t("status")}
                                        className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/60"
                                    >
                                        {[
                                            { value: "", label: t("allStatuses") },
                                            ...USER_STATUSES.map((userStatus) => ({
                                                value: userStatus,
                                                label: getLabel("statuses", userStatus),
                                            })),
                                        ].map((option) => (
                                            <button
                                                key={option.value || "all-statuses"}
                                                type="button"
                                                role="option"
                                                aria-selected={status === option.value}
                                                onClick={() => {
                                                    handleStatusChange(option.value);
                                                    setStatusDropdownOpen(false);
                                                }}
                                                className={`flex min-h-10 w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors ${status === option.value ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
                                            >
                                                <span className="min-w-0 flex-1 truncate">
                                                    {option.label}
                                                </span>
                                                {status === option.value && (
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        aria-hidden="true"
                                                        className="ml-2 h-4 w-4 shrink-0 text-blue-600"
                                                    >
                                                        <path d="m5 12 4 4L19 6" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        role="alert"
                        className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="mt-0.5 h-5 w-5 shrink-0"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="9" />
                            <path
                                strokeLinecap="round"
                                d="M12 8v4m0 4h.01"
                            />
                        </svg>

                        <div>
                            <p className="font-semibold">
                                {t("errorTitle")}
                            </p>
                            <p className="mt-1">{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* Table */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                    <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                {t("registeredUsers")}
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {t("registeredUsersDesc")}
                            </p>
                        </div>

                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                            <span className="size-1.5 rounded-full bg-cyan-500" />
                            {t("usersPerPage", { limit })}
                        </span>
                    </div>

                    {loading ? (
                        <>
                            {/* Phones and tablets: card skeletons */}
                            <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 xl:hidden">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="animate-pulse rounded-xl border border-slate-200 p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 shrink-0 rounded-full bg-slate-100" />
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <div className="h-3.5 w-2/5 rounded bg-slate-200" />
                                                <div className="h-3 w-3/5 rounded bg-slate-100" />
                                            </div>
                                        </div>
                                        <div className="mt-5 space-y-3">
                                            <div className="h-3 w-full rounded bg-slate-100" />
                                            <div className="h-3 w-4/5 rounded bg-slate-100" />
                                            <div className="h-3 w-2/3 rounded bg-slate-100" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Wide screens: table skeleton */}
                            <div className="hidden overflow-x-auto xl:block">
                                <table className="w-full min-w-[900px]">
                                    <tbody>
                                        <UserTableSkeleton />
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : users.length === 0 ? (
                        <div className="flex min-h-60 flex-col items-center justify-center px-5 py-12 text-center">
                            <div className="flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="size-7"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m16 16 4 4" />
                                </svg>
                            </div>

                            <p className="mt-4 text-sm font-semibold text-slate-900">
                                {t("noUsers")}
                            </p>

                            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                                {t("noUsersHint")}
                            </p>

                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                                >
                                    {t("clearFilters")}
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Phones and tablets (below 1280px): one card per user,
                                in 1 column on phones and 2 columns on tablets */}
                            <ul className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 xl:hidden">
                                {users.map((user, index) => (
                                    <motion.li
                                        key={user.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: Math.min(index * 0.025, 0.2) }}
                                        className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4"
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            {user.avatarUrl ? (
                                                <Image
                                                    src={user.avatarUrl}
                                                    alt={user.name}
                                                    width={40}
                                                    height={40}
                                                    className="size-10 shrink-0 rounded-full border border-slate-200 object-cover"
                                                />
                                            ) : (
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-sm font-bold text-blue-700">
                                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <p className="break-words text-sm font-semibold leading-5 text-slate-900">
                                                    {user.name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {t("userId", { id: user.id })}
                                                </p>
                                            </div>
                                        </div>

                                        <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm">
                                            <dt className="text-slate-500">{t("colEmail")}</dt>
                                            <dd className="break-all text-right text-slate-700">{user.email}</dd>

                                            <dt className="text-slate-500">{t("colRole")}</dt>
                                            <dd className="flex justify-end">
                                                <span className={`inline-flex min-w-20 items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${getRoleClassName(user.role)}`}>
                                                    {getLabel("roles", user.role)}
                                                </span>
                                            </dd>

                                            <dt className="text-slate-500">{t("colStatus")}</dt>
                                            <dd className="flex justify-end">
                                                <span className={`inline-flex min-w-20 items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${getStatusClassName(user.status)}`}>
                                                    {getLabel("statuses", user.status)}
                                                </span>
                                            </dd>

                                            <dt className="text-slate-500">{t("colCreated")}</dt>
                                            <dd className="text-right text-slate-700">{formatDate(user.createdAt)}</dd>
                                        </dl>

                                        <button
                                            type="button"
                                            onClick={() => router.push(`/admin/users/${user.id}`)}
                                            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                                        >
                                            {t("view")}
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="size-4"
                                                aria-hidden="true"
                                            >
                                                <path d="M5 12h14m-6-6 6 6-6 6" />
                                            </svg>
                                        </button>
                                    </motion.li>
                                ))}
                            </ul>

                            {/* Wide screens (from 1280px): table */}
                            <div className="hidden overflow-x-auto xl:block">
                                <table className="w-full min-w-[1000px] text-sm">
                                    <thead className="border-b border-slate-200 bg-slate-50">
                                        <tr className="text-left">
                                            <th className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600 sm:px-6">{t("colUser")}</th>
                                            <th className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">{t("colEmail")}</th>
                                            <th className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">{t("colRole")}</th>
                                            <th className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">{t("colStatus")}</th>
                                            <th className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">{t("colCreated")}</th>
                                            <th className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-600">{t("colAction")}</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {users.map((user, index) => (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: Math.min(index * 0.025, 0.2) }}
                                                className="group transition-colors hover:bg-slate-50/80"
                                            >
                                                <td className="px-5 py-4 sm:px-6">
                                                    <div className="flex min-w-56 items-center gap-3">
                                                        {user.avatarUrl ? (
                                                            <Image
                                                                src={user.avatarUrl}
                                                                alt={user.name}
                                                                width={40}
                                                                height={40}
                                                                className="size-10 shrink-0 rounded-full border border-slate-200 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-sm font-bold text-blue-700">
                                                                {user.name?.charAt(0).toUpperCase() || "U"}
                                                            </div>
                                                        )}

                                                        <div className="min-w-0">
                                                            <p className="break-words font-medium leading-5 text-slate-900">{user.name}</p>
                                                            <p className="mt-1 text-xs text-slate-400">{t("userId", { id: user.id })}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600">{user.email}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex min-w-20 items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${getRoleClassName(user.role)}`}>
                                                        {getLabel("roles", user.role)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex min-w-20 items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${getStatusClassName(user.status)}`}>
                                                        {getLabel("statuses", user.status)}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.push(`/admin/users/${user.id}`)}
                                                        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                                                    >
                                                        {t("view")}
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.8"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="size-3.5"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M7 17 17 7M7 7h10v10" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </motion.section>

                {/* Pagination */}
                {!loading && pagination.totalPages > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                        <p className="text-sm text-slate-500">
                            {t.rich("pageOf", {
                                page: pagination.page,
                                total: pagination.totalPages,
                                b: (chunks) => (
                                    <span className="font-semibold text-slate-800">
                                        {chunks}
                                    </span>
                                ),
                            })}
                        </p>

                        <div className="flex w-full items-center gap-2 sm:w-auto">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage((current) => current - 1)
                                }
                                className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600 sm:flex-none sm:px-4"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m15 18-6-6 6-6"
                                    />
                                </svg>

                                {t("previous")}
                            </button>

                            <button
                                type="button"
                                disabled={page >= pagination.totalPages}
                                onClick={() =>
                                    setPage((current) => current + 1)
                                }
                                className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:flex-none sm:px-4"
                            >
                                {t("next")}

                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m9 18 6-6-6-6"
                                    />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.main>
    );
}