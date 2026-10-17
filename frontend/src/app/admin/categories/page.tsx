"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { useCategories } from "@/src/features/category/hooks/useCategories";
import { deleteCategory } from "@/src/features/category/services/category.service";

export default function AdminCategoriesPage() {
    const { categories, loading, error, refetch } = useCategories();

    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [minimumLoadingElapsed, setMinimumLoadingElapsed] = useState(false);

    // Keep the initial loading skeleton visible for at least 600 ms.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setMinimumLoadingElapsed(true);
        }, 600);

        return () => window.clearTimeout(timer);
    }, []);

    const showLoading = loading || !minimumLoadingElapsed;

    // Filter categories by name, slug, or description.
    const filteredCategories = categories.filter((category) => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return true;
        }

        return (
            category.name.toLowerCase().includes(keyword) ||
            category.slug.toLowerCase().includes(keyword) ||
            (category.description ?? "").toLowerCase().includes(keyword)
        );
    });

    // Delete a category.
    const handleDeleteCategory = async (id: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this category? This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        const toastId = toast.loading("Deleting category...");
        setDeletingId(id);

        try {
            await deleteCategory(id);

            toast.success("Category deleted successfully.", {
                id: toastId,
            });

            // Refresh the category list after deletion.
            await refetch();
        } catch (error) {
            console.error("Failed to delete category:", error);

            toast.error(
                "Unable to delete category. It may be assigned to existing products.",
                { id: toastId }
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
        >
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="flex flex-col justify-between gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6"
            >
                <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-cyan-500" />

                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                            Electroshop Administration
                        </p>
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                        Category Management
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Manage your product categories and category information.
                    </p>
                </div>

                <Link
                    href="/admin/categories/create"
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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

                    Add Category
                </Link>
            </motion.header>

            {/* Search */}
            <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                aria-label="Category search"
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
                        Search Categories
                    </h2>
                </div>

                <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by category name, slug, or description..."
                    aria-label="Search categories"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
            </motion.section>

            {/* Category Table */}
            <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                aria-label="Categories list"
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
                <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Categories
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            View and manage your store categories.
                        </p>
                    </div>

                    {!showLoading && !error && (
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                            <span className="size-1.5 rounded-full bg-cyan-500" />

                            {filteredCategories.length}{" "}
                            {filteredCategories.length === 1
                                ? "category"
                                : "categories"}
                        </span>
                    )}
                </div>

                {showLoading ? (
                    /* Loading skeleton with Motion animations */
                    <div
                        className="space-y-4 p-5 sm:p-6"
                        aria-busy="true"
                        aria-label="Loading categories"
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
                                {/* Category icon skeleton */}
                                <motion.div
                                    animate={{
                                        opacity: [0.4, 0.85, 0.4],
                                    }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="size-12 shrink-0 rounded-lg bg-slate-100"
                                />

                                {/* Category information skeleton */}
                                <div className="min-w-0 flex-1 space-y-2">
                                    <motion.div
                                        animate={{
                                            opacity: [0.4, 0.85, 0.4],
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: 0.1,
                                        }}
                                        className="h-3.5 w-1/3 rounded bg-slate-200"
                                    />

                                    <motion.div
                                        animate={{
                                            opacity: [0.4, 0.85, 0.4],
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: 0.2,
                                        }}
                                        className="h-3 w-1/4 rounded bg-slate-100"
                                    />
                                </div>

                                {/* Action button skeletons */}
                                <div className="hidden items-center gap-2 sm:flex">
                                    <motion.div
                                        animate={{
                                            opacity: [0.4, 0.85, 0.4],
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="h-8 w-14 rounded-lg bg-slate-100"
                                    />

                                    <motion.div
                                        animate={{
                                            opacity: [0.4, 0.85, 0.4],
                                        }}
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
                    /* Error state */
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
                            Unable to load categories
                        </p>

                        <p className="mt-1 max-w-md text-sm leading-6 text-rose-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    /* Empty state */
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
                                <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                                <path d="m3 12 9 5 9-5" />
                                <path d="m3 16 9 5 9-5" />
                            </svg>
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-slate-900">
                            {search.trim()
                                ? "No matching categories"
                                : "No categories found"}
                        </h3>

                        <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                            {search.trim()
                                ? "Try a different search term."
                                : "Add your first category to get started."}
                        </p>
                    </div>
                ) : (
                    /* Category table */
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr className="text-left">
                                    <th className="px-5 py-4 font-semibold text-slate-600 sm:px-6">
                                        Category
                                    </th>

                                    <th className="px-5 py-4 font-semibold text-slate-600">
                                        Slug
                                    </th>

                                    <th className="px-5 py-4 font-semibold text-slate-600">
                                        Description
                                    </th>

                                    <th className="px-5 py-4 font-semibold text-slate-600">
                                        Created At
                                    </th>

                                    <th className="px-5 py-4 text-right font-semibold text-slate-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredCategories.map((category, index) => (
                                    <motion.tr
                                        key={category.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.25,
                                            delay: Math.min(
                                                index * 0.035,
                                                0.2
                                            ),
                                            ease: "easeOut",
                                        }}
                                        className="transition-colors hover:bg-slate-50/80"
                                    >
                                        {/* Category */}
                                        <td className="px-5 py-4 sm:px-6">
                                            <div className="flex min-w-48 items-center gap-3">
                                                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth={1.7}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="size-5"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                                                        <path d="m3 12 9 5 9-5" />
                                                        <path d="m3 16 9 5 9-5" />
                                                    </svg>
                                                </div>

                                                <span className="font-semibold text-slate-900">
                                                    {category.name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Slug */}
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                                                {category.slug}
                                            </span>
                                        </td>

                                        {/* Description */}
                                        <td className="max-w-64 px-5 py-4">
                                            <p className="line-clamp-2 text-sm leading-5 text-slate-600">
                                                {category.description || "—"}
                                            </p>
                                        </td>

                                        {/* Created At */}
                                        <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                                            {new Date(
                                                category.createdAt
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </td>

                                        {/* Actions */}
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/categories/${category.id}/edit`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
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

                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleDeleteCategory(
                                                            category.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId === category.id
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {deletingId === category.id ? (
                                                        <>
                                                            <span className="size-3.5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
                                                            Deleting...
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

                                                            Delete
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.section>
        </motion.div>
    );
}