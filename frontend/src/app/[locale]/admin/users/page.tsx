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
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

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
        setPage(1);
    };

    return (
        <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-10 lg:px-40"
        >
            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                            <span className="h-2 w-2 rounded-full bg-cyan-500" />
                            {t("adminWorkspace")}
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {t("title")}
                        </h1>

                        <p className="mt-2 text-sm text-slate-500 sm:text-base">
                            {t("subtitle")}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start rounded-xl border border-blue-100 bg-white px-4 py-3 shadow-sm sm:self-auto">
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
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                    <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
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

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
                        {/* Search */}
                        <div>
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
                                    className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path
                                        strokeLinecap="round"
                                        d="m16 16 4 4"
                                    />
                                </svg>

                                <input
                                    id="user-search"
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        handleSearchChange(event.target.value)
                                    }
                                    placeholder={t("searchPlaceholder")}
                                    className={`${inputClassName} pl-10`}
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label
                                htmlFor="user-role"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                {t("role")}
                            </label>

                            <select
                                id="user-role"
                                value={role}
                                onChange={(event) =>
                                    handleRoleChange(event.target.value)
                                }
                                className={inputClassName}
                            >
                                <option value="">{t("allRoles")}</option>

                                {USER_ROLES.map((userRole) => (
                                    <option key={userRole} value={userRole}>
                                        {getLabel("roles", userRole)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label
                                htmlFor="user-status"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                {t("status")}
                            </label>

                            <select
                                id="user-status"
                                value={status}
                                onChange={(event) =>
                                    handleStatusChange(event.target.value)
                                }
                                className={inputClassName}
                            >
                                <option value="">{t("allStatuses")}</option>

                                {USER_STATUSES.map((userStatus) => (
                                    <option
                                        key={userStatus}
                                        value={userStatus}
                                    >
                                        {getLabel("statuses", userStatus)}
                                    </option>
                                ))}
                            </select>
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
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-800">
                                {t("registeredUsers")}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {t("registeredUsersDesc")}
                            </p>
                        </div>

                        <span className="inline-flex items-center self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:self-auto">
                            {t("usersPerPage", { limit })}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[900px] w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {t("colUser")}
                                    </th>

                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {t("colEmail")}
                                    </th>

                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {t("colRole")}
                                    </th>

                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {t("colStatus")}
                                    </th>

                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {t("colCreated")}
                                    </th>

                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {t("colAction")}
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <UserTableSkeleton />
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-16 text-center"
                                        >
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    className="h-6 w-6"
                                                    aria-hidden="true"
                                                >
                                                    <circle
                                                        cx="11"
                                                        cy="11"
                                                        r="7"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        d="m16 16 4 4"
                                                    />
                                                </svg>
                                            </div>

                                            <p className="mt-3 text-sm font-semibold text-slate-700">
                                                {t("noUsers")}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {t("noUsersHint")}
                                            </p>

                                            {hasFilters && (
                                                <button
                                                    type="button"
                                                    onClick={clearFilters}
                                                    className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                                                >
                                                    {t("clearFilters")}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{
                                                opacity: 0,
                                                y: 6,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                duration: 0.2,
                                                delay: index * 0.025,
                                            }}
                                            className="group transition-colors hover:bg-blue-50/40"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {user.avatarUrl ? (
                                                        <Image
                                                            src={user.avatarUrl}
                                                            alt={user.name}
                                                            width={40}
                                                            height={40}
                                                            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-sm font-bold text-blue-700">
                                                            {user.name
                                                                ?.charAt(0)
                                                                .toUpperCase() ||
                                                                "U"}
                                                        </div>
                                                    )}

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-slate-800">
                                                            {user.name}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {t("userId", {
                                                                id: user.id,
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="text-sm text-slate-600">
                                                    {user.email}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex min-w-20 items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${getRoleClassName(
                                                        user.role
                                                    )}`}
                                                >
                                                    {getLabel("roles", user.role)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex min-w-20 items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${getStatusClassName(
                                                        user.status
                                                    )}`}
                                                >
                                                    {getLabel(
                                                        "statuses",
                                                        user.status
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                {formatDate(user.createdAt)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push(
                                                            `/admin/users/${user.id}`
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                                >
                                                    {t("view")}

                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M5 12h14m-6-6 6 6-6 6"
                                                        />
                                                    </svg>
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
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

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage((current) => current - 1)
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
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
                                className="inline-flex items-center gap-2 rounded-xl border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
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