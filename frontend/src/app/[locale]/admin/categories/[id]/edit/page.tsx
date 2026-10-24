"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    useCallback,
    useEffect,
    useState,
    type FormEvent,
} from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

import type { Category } from "@/src/features/category/types/category";
import {
    getCategoryById,
    updateCategory,
} from "@/src/features/category/services/category.service";

type CategoryFormErrors = {
    name?: string;
    slug?: string;
};

export default function EditCategoryPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const categoryId = Number(params.id);

    const [category, setCategory] = useState<Category | null>(null);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");

    const [errors, setErrors] = useState<CategoryFormErrors>({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Load the existing category.
    const loadCategory = useCallback(async () => {
        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            setLoadError("Invalid category ID.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setLoadError("");

        try {
            const data = await getCategoryById(categoryId);

            setCategory(data);
            setName(data.name);
            setSlug(data.slug);
            setDescription(data.description ?? "");
            setErrors({});
        } catch (error) {
            console.error("Failed to load category:", error);
            setLoadError("Unable to load category. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [categoryId]);

    useEffect(() => {
        void loadCategory();
    }, [loadCategory]);

    // Save category changes.
    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (submitting || !category) {
            return;
        }

        const trimmedName = name.trim();
        const trimmedSlug = slug.trim();
        const trimmedDescription = description.trim();

        const nextErrors: CategoryFormErrors = {};

        if (!trimmedName) {
            nextErrors.name = "Category name is required.";
        }

        if (!trimmedSlug) {
            nextErrors.slug = "Category slug is required.";
        } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
            nextErrors.slug =
                "Use lowercase letters, numbers, and hyphens only.";
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        const toastId = toast.loading("Updating category...");
        setSubmitting(true);

        try {
            await updateCategory(categoryId, {
                name: trimmedName,
                slug: trimmedSlug,
                description: trimmedDescription,
            });

            toast.success("Category updated successfully.", {
                id: toastId,
            });

            router.push("/admin/categories");
        } catch (error) {
            console.error("Failed to update category:", error);

            toast.error(
                "Unable to update category. Check that the name and slug are unique.",
                { id: toastId }
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state.
    if (loading) {
        return (
            <div
                className="flex min-h-60 items-center justify-center gap-3 text-sm text-slate-500"
                aria-busy="true"
            >
                <span className="size-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
                Loading category...
            </div>
        );
    }

    // Error state.
    if (loadError || !category) {
        return (
            <div
                role="alert"
                className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-10 text-center"
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

                <h2 className="mt-4 text-base font-semibold text-slate-900">
                    Unable to load category
                </h2>

                <p className="mt-1 text-sm text-rose-600">
                    {loadError || "Category not found."}
                </p>

                <div className="mt-5 flex gap-3">
                    <button
                        type="button"
                        onClick={() => void loadCategory()}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                        Try Again
                    </button>

                    <Link
                        href="/admin/categories"
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Back to Categories
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto max-w-4xl space-y-6"
        >
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
            >
                <div className="mb-2 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-cyan-500" />

                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                        Electroshop Administration
                    </p>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    Edit Category
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Update the information for {category.name}.
                </p>
            </motion.header>

            {/* Edit Form */}
            <form
                onSubmit={handleSubmit}
                noValidate
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
                <div className="space-y-6 p-5 sm:p-6">
                    {/* Category Name */}
                    <div>
                        <label
                            htmlFor="category-name"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Category Name
                            <span className="ml-1 text-rose-500">*</span>
                        </label>

                        <input
                            id="category-name"
                            type="text"
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);

                                setErrors((prev) => ({
                                    ...prev,
                                    name: undefined,
                                }));
                            }}
                            required
                            aria-invalid={Boolean(errors.name)}
                            className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition focus:ring-2 ${
                                errors.name
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                    : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />

                        {errors.name && (
                            <p
                                role="alert"
                                className="mt-2 text-xs text-rose-600"
                            >
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Category Slug */}
                    <div>
                        <label
                            htmlFor="category-slug"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Slug
                            <span className="ml-1 text-rose-500">*</span>
                        </label>

                        <input
                            id="category-slug"
                            type="text"
                            value={slug}
                            onChange={(event) => {
                                setSlug(event.target.value);

                                setErrors((prev) => ({
                                    ...prev,
                                    slug: undefined,
                                }));
                            }}
                            required
                            aria-invalid={Boolean(errors.slug)}
                            aria-describedby="category-slug-hint"
                            className={`h-11 w-full rounded-lg border bg-white px-3 font-mono text-sm text-slate-800 outline-none transition focus:ring-2 ${
                                errors.slug
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                    : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />

                        <p
                            id="category-slug-hint"
                            className="mt-2 text-xs text-slate-500"
                        >
                            Use lowercase letters, numbers, and hyphens.
                        </p>

                        {errors.slug && (
                            <p
                                role="alert"
                                className="mt-2 text-xs text-rose-600"
                            >
                                {errors.slug}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="category-description"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Description
                            <span className="ml-2 text-xs font-normal text-slate-400">
                                Optional
                            </span>
                        </label>

                        <textarea
                            id="category-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            rows={4}
                            placeholder="Describe the products in this category..."
                            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:px-6">
                    <Link
                        href="/admin/categories"
                        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? (
                            <>
                                <span className="size-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}