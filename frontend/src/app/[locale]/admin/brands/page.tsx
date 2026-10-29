"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

import type { Brand } from "@/src/features/brand/types/brand";
import useBrands from "@/src/features/brand/hooks/useBrands";
import {
    createBrand,
    deleteBrand,
    updateBrand,
} from "@/src/features/brand/services/brand.service";
import ConfirmDialog from "@/src/components/common/Confirmdialog";

type BrandModalMode = "create" | "edit" | null;

type BrandFormErrors = {
    name?: string;
    slug?: string;
    logo?: string;
};

export default function AdminBrandsPage() {
    const t = useTranslations("AdminBrandsPage");
    const locale = useLocale();

    const { brands, loading, error, refetch } = useBrands();

    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
    const [minimumLoadingElapsed, setMinimumLoadingElapsed] = useState(false);

    const [modalMode, setModalMode] = useState<BrandModalMode>(null);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [logo, setLogo] = useState("");

    const [formErrors, setFormErrors] = useState<BrandFormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    // Keep the initial loading skeleton visible for at least 600 ms.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setMinimumLoadingElapsed(true);
        }, 600);

        return () => window.clearTimeout(timer);
    }, []);

    // Close the modal with Escape.
    useEffect(() => {
        if (!modalMode) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !submitting) {
                setModalMode(null);
                setEditingBrand(null);
                setFormErrors({});
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [modalMode, submitting]);

    // Close the delete confirmation dialog with Escape.
    useEffect(() => {
        if (!brandToDelete) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && deletingId === null) {
                setBrandToDelete(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [brandToDelete, deletingId]);

    const showLoading = loading || !minimumLoadingElapsed;

    const formatDate = (value: string) =>
        new Date(value).toLocaleDateString(locale, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    const formatNumber = (value: number) =>
        new Intl.NumberFormat(locale).format(value);

    // Filter brands by name, slug, or description.
    const filteredBrands = brands.filter((brand) => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return true;
        }

        return (
            brand.name.toLowerCase().includes(keyword) ||
            brand.slug.toLowerCase().includes(keyword) ||
            (brand.description ?? "").toLowerCase().includes(keyword)
        );
    });

    const resetForm = () => {
        setName("");
        setSlug("");
        setDescription("");
        setLogo("");
        setFormErrors({});
    };

    const openCreateModal = () => {
        setEditingBrand(null);
        resetForm();
        setModalMode("create");
    };

    const openEditModal = (brand: Brand) => {
        setEditingBrand(brand);
        setName(brand.name);
        setSlug(brand.slug);
        setDescription(brand.description ?? "");

        // A blank logo URL means keep the existing logo.
        setLogo("");
        setFormErrors({});
        setModalMode("edit");
    };

    const closeModal = () => {
        if (submitting) {
            return;
        }

        setModalMode(null);
        setEditingBrand(null);
        resetForm();
    };

    // Create or update a brand from the modal.
    const handleBrandSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (
            submitting ||
            !modalMode ||
            (modalMode === "edit" && !editingBrand)
        ) {
            return;
        }

        const trimmedName = name.trim();
        const trimmedSlug = slug.trim();
        const trimmedDescription = description.trim();
        const trimmedLogo = logo.trim();

        const nextErrors: BrandFormErrors = {};

        if (!trimmedName) {
            nextErrors.name = t("validation.nameRequired");
        }

        if (!trimmedSlug) {
            nextErrors.slug = t("validation.slugRequired");
        } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
            nextErrors.slug = t("validation.slugFormat");
        }

        if (trimmedLogo) {
            try {
                const logoUrl = new URL(trimmedLogo);

                if (
                    logoUrl.protocol !== "http:" &&
                    logoUrl.protocol !== "https:"
                ) {
                    nextErrors.logo = t("validation.logoProtocol");
                }
            } catch {
                nextErrors.logo = t("validation.logoInvalid");
            }
        }

        setFormErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        const isEditing = modalMode === "edit";
        const toastId = toast.loading(
            isEditing ? t("toasts.updating") : t("toasts.creating")
        );

        setSubmitting(true);

        try {
            const input = {
                name: trimmedName,
                slug: trimmedSlug,
                description: trimmedDescription || undefined,
                logo: trimmedLogo || undefined,
            };

            if (isEditing && editingBrand) {
                await updateBrand(editingBrand.id, input);

                toast.success(t("toasts.updated"), {
                    id: toastId,
                });
            } else {
                await createBrand(input);

                toast.success(t("toasts.created"), {
                    id: toastId,
                });
            }

            // Close and reset the modal after a successful save.
            setModalMode(null);
            setEditingBrand(null);
            resetForm();

            // The mutation has succeeded; a refresh failure should not
            // turn the successful save into an error.
            try {
                await refetch();
            } catch (refreshError) {
                console.error(
                    "Failed to refresh brands after saving:",
                    refreshError
                );
            }
        } catch (submitError) {
            console.error("Failed to save brand:", submitError);

            toast.error(
                isEditing
                    ? t("toasts.updateFailed")
                    : t("toasts.createFailed"),
                { id: toastId }
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Delete the brand chosen in the confirmation dialog.
    const handleConfirmDelete = async () => {
        if (!brandToDelete || deletingId !== null) {
            return;
        }

        const id = brandToDelete.id;
        const toastId = toast.loading(t("toasts.deleting"));

        setDeletingId(id);

        try {
            await deleteBrand(id);

            toast.success(t("toasts.deleted"), {
                id: toastId,
            });

            setBrandToDelete(null);

            try {
                await refetch();
            } catch (refreshError) {
                console.error(
                    "Failed to refresh brands after deletion:",
                    refreshError
                );
            }
        } catch (deleteError) {
            console.error("Failed to delete brand:", deleteError);

            toast.error(t("toasts.deleteFailed"), {
                id: toastId,
            });
        } finally {
            setDeletingId(null);
        }
    };

    const isEditing = modalMode === "edit";

    // Edit and delete buttons, shared by the mobile cards and the desktop table.
    // On mobile they share the card width equally and are tall enough to tap.
    const renderBrandActions = (brand: Brand, fullWidth: boolean) => (
        <div
            className={
                fullWidth
                    ? "grid grid-cols-2 gap-2"
                    : "flex justify-end gap-2"
            }
        >
            <button
                type="button"
                onClick={() => openEditModal(brand)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                    fullWidth ? "min-h-10" : "py-2"
                }`}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5"
                    aria-hidden="true"
                >
                    <path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
                </svg>

                {t("buttons.edit")}
            </button>

            <button
                type="button"
                onClick={() => setBrandToDelete(brand)}
                disabled={deletingId === brand.id}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                    fullWidth ? "min-h-10" : "py-2"
                }`}
            >
                {deletingId === brand.id ? (
                    <>
                        <span className="size-3.5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
                        {t("buttons.deleting")}
                    </>
                ) : (
                    <>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-3.5"
                            aria-hidden="true"
                        >
                            <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
                        </svg>

                        {t("buttons.delete")}
                    </>
                )}
            </button>
        </div>
    );

    // Brand logo or two-letter fallback, shared by cards and table.
    const renderBrandLogo = (brand: Brand) =>
        brand.logo ? (
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
                <Image
                    src={brand.logo}
                    alt={t("brandLogoAlt", {
                        name: brand.name,
                    })}
                    width={40}
                    height={40}
                    className="size-full object-contain"
                />
            </div>
        ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-blue-50 text-sm font-bold text-blue-600">
                {brand.name.slice(0, 2).toUpperCase()}
            </div>
        );

    return (
        <>
            {/* The admin layout already provides the page padding. */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6"
            >
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-6"
                >
                    <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2">
                            <span className="size-2 rounded-full bg-cyan-500" />

                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                                {t("header.brand")}
                            </p>
                        </div>

                        <h1 className="break-words text-xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                            {t("header.title")}
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {t("header.description")}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            className="size-4"
                            aria-hidden="true"
                        >
                            <path d="M12 5v14M5 12h14" />
                        </svg>

                        {t("buttons.addBrand")}
                    </button>
                </motion.header>

                {/* Search */}
                <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    aria-label={t("search.sectionLabel")}
                    className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
                >
                    <div className="mb-4 flex items-center gap-2">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-5 text-blue-600"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m16 16 4 4" />
                        </svg>

                        <h2 className="text-sm font-semibold text-slate-800">
                            {t("search.title")}
                        </h2>
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t("search.placeholder")}
                        aria-label={t("search.ariaLabel")}
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </motion.section>

                {/* Brand List */}
                <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    aria-label={t("table.sectionLabel")}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                    <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                {t("table.title")}
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {t("table.description")}
                            </p>
                        </div>

                        {!showLoading && !error && (
                            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                                <span className="size-1.5 rounded-full bg-cyan-500" />

                                {filteredBrands.length === 1
                                    ? t("counts.single", {
                                          count: formatNumber(filteredBrands.length),
                                      })
                                    : t("counts.multiple", {
                                          count: formatNumber(filteredBrands.length),
                                      })}
                            </span>
                        )}
                    </div>

                    {showLoading ? (
                        <div
                            className="space-y-4 p-4 sm:p-6"
                            aria-busy="true"
                            aria-label={t("loading.ariaLabel")}
                        >
                            {Array.from({ length: 5 }, (_, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.06,
                                        ease: "easeOut",
                                    }}
                                    className="flex items-center gap-4"
                                >
                                    <motion.div
                                        animate={{ opacity: [0.4, 0.85, 0.4] }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="size-12 shrink-0 rounded-lg bg-slate-100"
                                    />

                                    <div className="min-w-0 flex-1 space-y-2">
                                        <motion.div
                                            animate={{ opacity: [0.4, 0.85, 0.4] }}
                                            transition={{
                                                duration: 1.2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: 0.1,
                                            }}
                                            className="h-3.5 w-1/3 rounded bg-slate-200"
                                        />

                                        <motion.div
                                            animate={{ opacity: [0.4, 0.85, 0.4] }}
                                            transition={{
                                                duration: 1.2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: 0.2,
                                            }}
                                            className="h-3 w-1/4 rounded bg-slate-100"
                                        />
                                    </div>

                                    <div className="hidden items-center gap-2 sm:flex">
                                        <motion.div
                                            animate={{ opacity: [0.4, 0.85, 0.4] }}
                                            transition={{
                                                duration: 1.2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                            className="h-8 w-14 rounded-lg bg-slate-100"
                                        />

                                        <motion.div
                                            animate={{ opacity: [0.4, 0.85, 0.4] }}
                                            transition={{
                                                duration: 1.2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: 0.1,
                                            }}
                                            className="h-8 w-16 rounded-lg bg-rose-50"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : error ? (
                        <div
                            role="alert"
                            className="flex min-h-52 flex-col items-center justify-center px-5 py-10 text-center"
                        >
                            <div className="flex size-12 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                    strokeLinecap="round"
                                    className="size-5"
                                    aria-hidden="true"
                                >
                                    <path d="M12 8v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z" />
                                </svg>
                            </div>

                            <p className="mt-4 text-sm font-semibold text-slate-800">
                                {t("errors.title")}
                            </p>

                            <p className="mt-1 max-w-md text-sm leading-6 text-rose-600">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => void refetch()}
                                className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                            >
                                {t("buttons.tryAgain")}
                            </button>
                        </div>
                    ) : filteredBrands.length === 0 ? (
                        <div className="flex min-h-60 flex-col items-center justify-center px-5 py-12 text-center">
                            <div className="flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="size-7"
                                    aria-hidden="true"
                                >
                                    <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l3.59-3.59a2 2 0 0 0 0-2.59Z" />
                                    <circle cx="7.5" cy="7.5" r="1.25" />
                                </svg>
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                {search.trim()
                                    ? t("empty.matchingTitle")
                                    : t("empty.noBrandsTitle")}
                            </h3>

                            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                                {search.trim()
                                    ? t("empty.matchingDescription")
                                    : t("empty.noBrandsDescription")}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile: one card per brand (below 768px) */}
                            <ul className="divide-y divide-slate-100 md:hidden">
                                {filteredBrands.map((brand) => (
                                    <li key={brand.id} className="space-y-3 px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            {renderBrandLogo(brand)}

                                            <div className="min-w-0 flex-1">
                                                <p className="break-words text-sm font-semibold text-slate-900">
                                                    {brand.name}
                                                </p>

                                                <span className="mt-1 inline-block max-w-full truncate rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                                                    {brand.slug}
                                                </span>
                                            </div>
                                        </div>

                                        {brand.description && (
                                            <p className="line-clamp-2 text-sm leading-5 text-slate-600">
                                                {brand.description}
                                            </p>
                                        )}

                                        <p className="text-xs text-slate-500">
                                            {t("columns.createdAt")}:{" "}
                                            <span className="text-slate-600">
                                                {formatDate(brand.createdAt)}
                                            </span>
                                        </p>

                                        {renderBrandActions(brand, true)}
                                    </li>
                                ))}
                            </ul>

                            {/* Tablet and desktop: table (from 768px) */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[720px] text-sm">
                                    <thead className="border-b border-slate-200 bg-slate-50">
                                        <tr className="text-left">
                                            <th className="px-5 py-4 font-semibold text-slate-600 sm:px-6">
                                                {t("columns.brand")}
                                            </th>
                                            <th className="px-5 py-4 font-semibold text-slate-600">
                                                {t("columns.slug")}
                                            </th>
                                            <th className="px-5 py-4 font-semibold text-slate-600">
                                                {t("columns.description")}
                                            </th>
                                            <th className="px-5 py-4 font-semibold text-slate-600">
                                                {t("columns.createdAt")}
                                            </th>
                                            <th className="px-5 py-4 text-right font-semibold text-slate-600">
                                                {t("columns.actions")}
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {filteredBrands.map((brand, index) => (
                                            <motion.tr
                                                key={brand.id}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.25,
                                                    delay: Math.min(index * 0.035, 0.2),
                                                    ease: "easeOut",
                                                }}
                                                className="transition-colors hover:bg-slate-50/80"
                                            >
                                                <td className="px-5 py-4 sm:px-6">
                                                    <div className="flex min-w-48 items-center gap-3">
                                                        {renderBrandLogo(brand)}

                                                        <span className="font-semibold text-slate-900">
                                                            {brand.name}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4">
                                                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                                                        {brand.slug}
                                                    </span>
                                                </td>

                                                <td className="max-w-64 px-5 py-4">
                                                    <p className="line-clamp-2 text-sm leading-5 text-slate-600">
                                                        {brand.description || "—"}
                                                    </p>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                                                    {formatDate(brand.createdAt)}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4">
                                                    {renderBrandActions(brand, false)}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </motion.section>
            </motion.div>

            {/* Create / Edit Brand Modal */}
            <AnimatePresence>
                {modalMode && (
                    <motion.div
                        key="brand-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                closeModal();
                            }
                        }}
                        className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-3 backdrop-blur-[2px] sm:p-4"
                    >
                        <motion.section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="brand-modal-title"
                            aria-describedby="brand-modal-description"
                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                                        {t("header.brand")}
                                    </p>

                                    <h2
                                        id="brand-modal-title"
                                        className="mt-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
                                    >
                                        {isEditing
                                            ? t("modal.editTitle")
                                            : t("modal.createTitle")}
                                    </h2>

                                    <p
                                        id="brand-modal-description"
                                        className="mt-1 text-sm leading-6 text-slate-500"
                                    >
                                        {isEditing
                                            ? t("modal.editDescription")
                                            : t("modal.createDescription")}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={submitting}
                                    aria-label={t("modal.close")}
                                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                        strokeLinecap="round"
                                        className="size-4"
                                        aria-hidden="true"
                                    >
                                        <path d="m18 6-12 12M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form
                                onSubmit={handleBrandSubmit}
                                noValidate
                            >
                                <div className="max-h-[calc(90dvh-200px)] space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        {/* Brand Name */}
                                        <div>
                                            <label
                                                htmlFor="modal-brand-name"
                                                className="mb-2 block text-sm font-medium text-slate-700"
                                            >
                                                {t("fields.name")}
                                                <span className="ml-1 text-rose-500">*</span>
                                            </label>

                                            <input
                                                id="modal-brand-name"
                                                type="text"
                                                autoFocus
                                                value={name}
                                                onChange={(event) => {
                                                    setName(event.target.value);
                                                    setFormErrors((previous) => ({
                                                        ...previous,
                                                        name: undefined,
                                                    }));
                                                }}
                                                placeholder={t("fields.namePlaceholder")}
                                                required
                                                aria-invalid={Boolean(formErrors.name)}
                                                aria-describedby={
                                                    formErrors.name
                                                        ? "modal-brand-name-error"
                                                        : undefined
                                                }
                                                className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                                                    formErrors.name
                                                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                                        : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                                                }`}
                                            />

                                            {formErrors.name && (
                                                <p
                                                    id="modal-brand-name-error"
                                                    role="alert"
                                                    className="mt-2 text-xs text-rose-600"
                                                >
                                                    {formErrors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Slug */}
                                        <div>
                                            <label
                                                htmlFor="modal-brand-slug"
                                                className="mb-2 block text-sm font-medium text-slate-700"
                                            >
                                                {t("fields.slug")}
                                                <span className="ml-1 text-rose-500">*</span>
                                            </label>

                                            <input
                                                id="modal-brand-slug"
                                                type="text"
                                                value={slug}
                                                onChange={(event) => {
                                                    setSlug(event.target.value);
                                                    setFormErrors((previous) => ({
                                                        ...previous,
                                                        slug: undefined,
                                                    }));
                                                }}
                                                placeholder={t("fields.slugPlaceholder")}
                                                required
                                                aria-invalid={Boolean(formErrors.slug)}
                                                aria-describedby="modal-brand-slug-hint"
                                                className={`h-11 w-full rounded-lg border bg-white px-3 font-mono text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                                                    formErrors.slug
                                                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                                        : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                                                }`}
                                            />

                                            <p
                                                id="modal-brand-slug-hint"
                                                className="mt-2 text-xs leading-5 text-slate-500"
                                            >
                                                {t("fields.slugHint")}
                                            </p>

                                            {formErrors.slug && (
                                                <p
                                                    role="alert"
                                                    className="mt-2 text-xs text-rose-600"
                                                >
                                                    {formErrors.slug}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label
                                            htmlFor="modal-brand-description"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            {t("fields.description")}
                                            <span className="ml-2 text-xs font-normal text-slate-400">
                                                {t("common.optional")}
                                            </span>
                                        </label>

                                        <textarea
                                            id="modal-brand-description"
                                            value={description}
                                            onChange={(event) =>
                                                setDescription(event.target.value)
                                            }
                                            placeholder={t("fields.descriptionPlaceholder")}
                                            rows={3}
                                            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                    {/* Current Logo when editing */}
                                    {isEditing && editingBrand?.logo && (
                                        <div>
                                            <p className="mb-2 text-sm font-medium text-slate-700">
                                                {t("modal.currentLogo")}
                                            </p>

                                            <div className="flex size-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
                                                <Image
                                                    src={editingBrand.logo}
                                                    alt={t("brandLogoAlt", {
                                                        name: editingBrand.name,
                                                    })}
                                                    width={64}
                                                    height={64}
                                                    className="size-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Logo URL */}
                                    <div>
                                        <label
                                            htmlFor="modal-brand-logo"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            {isEditing
                                                ? t("fields.newLogoUrl")
                                                : t("fields.logoUrl")}

                                            <span className="ml-2 text-xs font-normal text-slate-400">
                                                {t("common.optional")}
                                            </span>
                                        </label>

                                        <input
                                            id="modal-brand-logo"
                                            type="url"
                                            value={logo}
                                            onChange={(event) => {
                                                setLogo(event.target.value);
                                                setFormErrors((previous) => ({
                                                    ...previous,
                                                    logo: undefined,
                                                }));
                                            }}
                                            placeholder={t("fields.logoPlaceholder")}
                                            aria-invalid={Boolean(formErrors.logo)}
                                            aria-describedby={
                                                formErrors.logo
                                                    ? "modal-brand-logo-error"
                                                    : "modal-brand-logo-hint"
                                            }
                                            className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                                                formErrors.logo
                                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                                    : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                                            }`}
                                        />

                                        <p
                                            id="modal-brand-logo-hint"
                                            className="mt-2 text-xs leading-5 text-slate-500"
                                        >
                                            {isEditing
                                                ? t("fields.editLogoHint")
                                                : t("fields.createLogoHint")}
                                        </p>

                                        {formErrors.logo && (
                                            <p
                                                id="modal-brand-logo-error"
                                                role="alert"
                                                className="mt-2 text-xs text-rose-600"
                                            >
                                                {formErrors.logo}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:flex-row sm:px-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={submitting}
                                        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {t("buttons.cancel")}
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="size-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
                                                {isEditing
                                                    ? t("buttons.saving")
                                                    : t("buttons.creating")}
                                            </>
                                        ) : (
                                            <>
                                                {isEditing ? (
                                                    t("buttons.saveChanges")
                                                ) : (
                                                    <>
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            className="size-4"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M12 5v14M5 12h14" />
                                                        </svg>

                                                        {t("buttons.createBrand")}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.section>
                    </motion.div>
                )}
            </AnimatePresence>

          {/* Delete Brand Confirmation */}
            <ConfirmDialog
                open={brandToDelete !== null}
                title={t("deleteTitle")}
                itemName={brandToDelete?.name}
                description={t("deleteConfirmation")}
                confirmLabel={t("buttons.delete")}
                cancelLabel={t("buttons.cancel")}
                loadingLabel={t("buttons.deleting")}
                loading={deletingId !== null}
                onConfirm={() => void handleConfirmDelete()}
                onCancel={() => {
                    if (deletingId === null) {
                        setBrandToDelete(null);
                    }
                }}
            />
        </>
    );
}