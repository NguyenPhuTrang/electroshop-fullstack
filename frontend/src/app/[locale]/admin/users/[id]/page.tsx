"use client";

import { useAdminUserDetail } from "@/src/hooks/useAdminUserDetail";
import { useParams } from "next/navigation";
import { useRouter } from "@/src/i18n/navigation";
import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

import { useAdminUserAddresses } from "@/src/features/address/hooks/useAdminUserAddresses";
import { useAdminOrders } from "@/src/features/order/hooks/useAdminOrders";

const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const buttonClassName =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

const getRoleClassName = (role: string) => {
    switch (role) {
        case "ADMIN":
            return "border-blue-200 bg-blue-50 text-blue-700";

        case "USER":
            return "border-cyan-200 bg-cyan-50 text-cyan-700";

        default:
            return "border-slate-200 bg-slate-50 text-slate-600";
    }
};

const getStatusClassName = (status: string) => {
    switch (status) {
        case "ACTIVE":
        case "DELIVERED":
        case "PAID":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";

        case "INACTIVE":
        case "PENDING":
        case "PROCESSING":
            return "border-amber-200 bg-amber-50 text-amber-700";

        case "BANNED":
        case "CANCELLED":
        case "CANCELED":
        case "FAILED":
            return "border-rose-200 bg-rose-50 text-rose-700";

        case "CONFIRMED":
        case "SHIPPED":
        case "OUT_FOR_DELIVERY":
            return "border-blue-200 bg-blue-50 text-blue-700";

        default:
            return "border-slate-200 bg-slate-50 text-slate-600";
    }
};

function SectionHeading({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: "user" | "calendar" | "address" | "orders";
}) {
    const icons = {
        user: (
            <>
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
            </>
        ),
        calendar: (
            <>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 3v4M8 3v4M3 11h18"
                />
            </>
        ),
        address: (
            <>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
                />
                <circle cx="12" cy="10" r="2.5" />
            </>
        ),
        orders: (
            <>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 7h16M4 12h16M4 17h10"
                />
                <rect x="2.5" y="3" width="19" height="18" rx="2" />
            </>
        ),
    };

    return (
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                    aria-hidden="true"
                >
                    {icons[icon]}
                </svg>
            </div>

            <div>
                <h2 className="font-semibold text-slate-800">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

function InfoField({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-2 break-words text-sm font-medium text-slate-800">
                {value}
            </p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const t = useTranslations("AdminUserDetailPage");

    // Show the translated label, or the raw status code if unknown.
    const label = t.has(`statuses.${status}`)
        ? t(`statuses.${status}`)
        : status;

    return (
        <span
            className={`inline-flex min-w-24 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${getStatusClassName(
                status
            )}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {label}
        </span>
    );
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 w-28 rounded bg-slate-200" />

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-slate-200" />

                            <div className="flex-1 space-y-3">
                                <div className="h-5 w-48 rounded bg-slate-200" />
                                <div className="h-4 w-64 max-w-full rounded bg-slate-100" />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-slate-200 bg-white p-6"
                            >
                                <div className="mb-6 h-5 w-44 rounded bg-slate-200" />

                                <div className="space-y-6">
                                    {Array.from({ length: 4 }).map(
                                        (_, fieldIndex) => (
                                            <div
                                                key={fieldIndex}
                                                className="space-y-2"
                                            >
                                                <div className="h-3 w-20 rounded bg-slate-100" />
                                                <div className="h-4 w-40 max-w-full rounded bg-slate-200" />
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-64 rounded-2xl border border-slate-200 bg-white" />
                </div>
            </div>
        </div>
    );
}

function LoadingTableRows() {
    return (
        <>
            {Array.from({ length: 3 }).map((_, index) => (
                <tr
                    key={index}
                    className="animate-pulse border-b border-slate-100 last:border-b-0"
                >
                    {Array.from({ length: 5 }).map((_, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-4">
                            <div className="h-4 w-20 rounded bg-slate-100" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

export default function AdminUserDetailPage() {
    const t = useTranslations("AdminUserDetailPage");
    const locale = useLocale();
    const params = useParams();
    const router = useRouter();

    const id = Number(params.id);

    const [status, setStatus] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [ordersPage, setOrdersPage] = useState(1);

    const {
        user,
        loading,
        error,
        updateUserStatus,
    } = useAdminUserDetail(id);

    const {
        orders,
        pagination: ordersPagination,
        loading: ordersLoading,
        error: ordersError,
    } = useAdminOrders({
        userId: id,
        page: ordersPage,
        limit: 10,
    });

    const {
        addresses,
        loading: addressesLoading,
        error: addressesError,
    } = useAdminUserAddresses(id);

    const formatDateTime = (value: string) => {
        return new Date(value).toLocaleString(locale, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatPrice = (value: string | number) => {
        return Number(value).toLocaleString(locale, {
            style: "currency",
            currency: "USD",
        });
    };

    // Show a translated label for a role/status code, or the raw code if unknown.
    const getLabel = (group: "roles" | "statuses", value: string) =>
        t.has(`${group}.${value}`) ? t(`${group}.${value}`) : value;

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                        <div
                            role="alert"
                            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5 shrink-0"
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
                                    {t("unableToLoadUser")}
                                </p>
                                <p className="mt-1">
                                    {error || t("userNotFound")}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push("/admin/users")}
                            className={`${buttonClassName} mt-5`}
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
                            {t("backToUsers")}
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Update user account status
    const handleUpdateStatus = async () => {
        const nextStatus = status || user.status;

        if (updatingStatus || nextStatus === user.status) {
            return;
        }

        const toastId = toast.loading(t("updatingStatusToast"));

        setUpdatingStatus(true);

        try {
            await updateUserStatus(nextStatus);

            setStatus("");

            toast.success(t("statusUpdated"), {
                id: toastId,
                description: t("statusUpdatedDesc", {
                    status: getLabel("statuses", nextStatus),
                }),
            });
        } catch (error) {
            console.error("Failed to update user status:", error);

            toast.error(t("statusUpdateFailed"), {
                id: toastId,
            });
        } finally {
            setUpdatingStatus(false);
        }
    };

    return (
        <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8"
        >
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                        <button
                            type="button"
                            onClick={() => router.push("/admin/users")}
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
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
                            {t("backToUsers")}
                        </button>
                    </div>

                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="flex min-w-0 items-center gap-4">
                            {user.avatarUrl ? (
                                <Image
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    width={72}
                                    height={72}
                                    className="h-[72px] w-[72px] shrink-0 rounded-full border border-slate-200 object-cover"
                                />
                            ) : (
                                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-2xl font-bold text-blue-700">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div className="min-w-0">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
                                    {t("userProfile")}
                                </p>

                                <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    {user.name}
                                </h1>

                                <p className="mt-1 break-all text-sm text-slate-500">
                                    {user.email}
                                </p>

                                <p className="mt-2 text-xs text-slate-400">
                                    {t("userIdLabel", { id: user.id })}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold ${getRoleClassName(
                                    user.role
                                )}`}
                            >
                                {getLabel("roles", user.role)}
                            </span>

                            <StatusBadge status={user.status} />
                        </div>
                    </div>
                </motion.section>

                {/* User Information */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Account Information */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                        <SectionHeading
                            title={t("accountInfo")}
                            description={t("accountInfoDesc")}
                            icon="user"
                        />

                        <div className="space-y-6 p-5 sm:p-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <InfoField
                                    label={t("fieldUserId")}
                                    value={`#${user.id}`}
                                />

                                <InfoField
                                    label={t("fieldFullName")}
                                    value={user.name}
                                />

                                <div className="sm:col-span-2">
                                    <InfoField
                                        label={t("fieldEmail")}
                                        value={user.email}
                                    />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        {t("fieldRole")}
                                    </p>

                                    <div className="mt-2">
                                        <span
                                            className={`inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold ${getRoleClassName(
                                                user.role
                                            )}`}
                                        >
                                            {getLabel("roles", user.role)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-5">
                                <label
                                    htmlFor="user-account-status"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    {t("updateAccountStatus")}
                                </label>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <select
                                        id="user-account-status"
                                        value={status || user.status}
                                        onChange={(event) =>
                                            setStatus(event.target.value)
                                        }
                                        className={inputClassName}
                                        disabled={updatingStatus}
                                    >
                                        <option value="ACTIVE">
                                            {getLabel("statuses", "ACTIVE")}
                                        </option>

                                        <option value="INACTIVE">
                                            {getLabel("statuses", "INACTIVE")}
                                        </option>

                                        <option value="BANNED">
                                            {getLabel("statuses", "BANNED")}
                                        </option>
                                    </select>

                                    <button
                                        type="button"
                                        disabled={
                                            updatingStatus ||
                                            (status || user.status) ===
                                                user.status
                                        }
                                        onClick={() =>
                                            void handleUpdateStatus()
                                        }
                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                                    >
                                        {updatingStatus ? (
                                            <>
                                                <svg
                                                    className="h-4 w-4 animate-spin"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    aria-hidden="true"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="9"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                    />
                                                    <path
                                                        className="opacity-90"
                                                        fill="currentColor"
                                                        d="M12 3a9 9 0 0 1 9 9h-3a6 6 0 0 0-6-6V3Z"
                                                    />
                                                </svg>
                                                {t("saving")}
                                            </>
                                        ) : (
                                            t("saveChanges")
                                        )}
                                    </button>
                                </div>

                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    {t("statusWarning")}
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Account Dates */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                        <SectionHeading
                            title={t("accountDetails")}
                            description={t("accountDetailsDesc")}
                            icon="calendar"
                        />

                        <div className="space-y-6 p-5 sm:p-6">
                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {t("createdAt")}
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                    {formatDateTime(user.createdAt)}
                                </p>
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                                    {t("lastUpdated")}
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                    {formatDateTime(user.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </motion.section>
                </div>

                {/* Addresses */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <SectionHeading
                        title={t("addresses")}
                        description={t("addressesDesc")}
                        icon="address"
                    />

                    <div className="p-5 sm:p-6">
                        {addressesLoading ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {Array.from({ length: 2 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="animate-pulse rounded-xl border border-slate-200 p-5"
                                    >
                                        <div className="h-4 w-36 rounded bg-slate-200" />
                                        <div className="mt-3 h-3 w-28 rounded bg-slate-100" />
                                        <div className="mt-5 h-3 w-full rounded bg-slate-100" />
                                        <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
                                    </div>
                                ))}
                            </div>
                        ) : addressesError ? (
                            <div
                                role="alert"
                                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                            >
                                {addressesError}
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        className="h-6 w-6"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
                                        />
                                        <circle cx="12" cy="10" r="2.5" />
                                    </svg>
                                </div>

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    {t("noAddresses")}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    {t("noAddressesDesc")}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {addresses.map((address, index) => (
                                    <motion.div
                                        key={address.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.25,
                                            delay: index * 0.05,
                                        }}
                                        className="rounded-xl border border-slate-200 p-5 transition-colors hover:border-blue-200"
                                    >
                                        <div className="mb-4 flex items-start justify-between gap-4">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.7"
                                                        className="h-5 w-5"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
                                                        />
                                                        <circle
                                                            cx="12"
                                                            cy="10"
                                                            r="2.5"
                                                        />
                                                    </svg>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="break-words font-semibold text-slate-800">
                                                        {address.fullName}
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {address.phone}
                                                    </p>
                                                </div>
                                            </div>

                                            {address.isDefault && (
                                                <span className="inline-flex shrink-0 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                    {t("defaultLabel")}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
                                            <p>{address.address}</p>

                                            <p>
                                                {address.district},{" "}
                                                {address.city}
                                            </p>

                                            {address.postalCode && (
                                                <p className="text-slate-400">
                                                    {t("postalCode", {
                                                        code: address.postalCode,
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.section>

                {/* Orders */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <SectionHeading
                        title={t("orders")}
                        description={t("ordersDesc")}
                        icon="orders"
                    />

                    <div className="p-5 sm:p-6">
                        {ordersLoading ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50">
                                            {[
                                                t("colOrder"),
                                                t("colTotal"),
                                                t("colStatus"),
                                                t("colCreated"),
                                                t("colAction"),
                                            ].map((label) => (
                                                <th
                                                    key={label}
                                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                                                >
                                                    {label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <LoadingTableRows />
                                    </tbody>
                                </table>
                            </div>
                        ) : ordersError ? (
                            <div
                                role="alert"
                                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                            >
                                {ordersError}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        className="h-6 w-6"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 7h16M4 12h16M4 17h10"
                                        />
                                        <rect
                                            x="2.5"
                                            y="3"
                                            width="19"
                                            height="18"
                                            rx="2"
                                        />
                                    </svg>
                                </div>

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    {t("noOrders")}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    {t("noOrdersDesc")}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-[780px] w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50">
                                            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                {t("colOrder")}
                                            </th>

                                            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                {t("colTotal")}
                                            </th>

                                            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                {t("colStatus")}
                                            </th>

                                            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                {t("colCreated")}
                                            </th>

                                            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                {t("colAction")}
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {orders.map((order, index) => (
                                            <motion.tr
                                                key={order.id}
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
                                                    delay: index * 0.03,
                                                }}
                                                className="transition-colors hover:bg-blue-50/40"
                                            >
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {order.orderNumber}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {t("orderId", {
                                                            id: order.id,
                                                        })}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4 text-sm font-semibold text-blue-700">
                                                    {formatPrice(order.total)}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <StatusBadge
                                                        status={order.status}
                                                    />
                                                </td>

                                                <td className="px-4 py-4 text-sm text-slate-500">
                                                    {formatDateTime(
                                                        order.createdAt
                                                    )}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.push(
                                                                `/admin/orders/${order.id}?userId=${user.id}`
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                                    >
                                                        {t("view")}

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
                                                                d="M5 12h14m-6-6 6 6-6 6"
                                                            />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Orders Pagination */}
                        {!ordersLoading &&
                            !ordersError &&
                            ordersPagination.totalPages > 1 && (
                                <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-slate-500">
                                        {t.rich("pageOf", {
                                            page: ordersPagination.page,
                                            total: ordersPagination.totalPages,
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
                                            disabled={ordersPage <= 1}
                                            onClick={() =>
                                                setOrdersPage(
                                                    (current) => current - 1
                                                )
                                            }
                                            className={buttonClassName}
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
                                            disabled={
                                                ordersPage >=
                                                ordersPagination.totalPages
                                            }
                                            onClick={() =>
                                                setOrdersPage(
                                                    (current) => current + 1
                                                )
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-blue-700 hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
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
                                </div>
                            )}
                    </div>
                </motion.section>
            </div>
        </motion.main>
    );
}