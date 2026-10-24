"use client";

import { Link } from "@/src/i18n/navigation";
import { useRouter } from "@/src/i18n/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { createCategory } from "@/src/features/category/services/category.service";

type CategoryFormErrors = {
    name?: string;
    slug?: string;
};

export default function CreateCategoryPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");

    const [errors, setErrors] = useState<CategoryFormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (submitting) {
            return;
        }

        const trimmedName = name.trim();
        const trimmedSlug = slug.trim();
        const trimmedDescription = description.trim();

        const nextErrors: CategoryFormErrors = {};

        // Validate category name.
        if (!trimmedName) {
            nextErrors.name = "Category name is required.";
        }

        // Validate category slug.
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

        const toastId = toast.loading("Creating category...");
        setSubmitting(true);

        try {
            await createCategory({
                name: trimmedName,
                slug: trimmedSlug,
                description: trimmedDescription || undefined,
            });

            toast.success("Category created successfully.", {
                id: toastId,
            });

            router.push("/admin/categories");
        } catch (error) {
            console.error("Failed to create category:", error);

            toast.error(
                "Unable to create category. Check that the name and slug are unique.",
                { id: toastId }
            );
        } finally {
            setSubmitting(false);
        }
    };

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
                    Create Category
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Add a new category to organize your products.
                </p>
            </motion.header>

            {/* Form */}
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
                            placeholder="e.g. Smartphones"
                            required
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={
                                errors.name ? "category-name-error" : undefined
                            }
                            className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                                errors.name
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                    : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />

                        {errors.name && (
                            <p
                                id="category-name-error"
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
                            placeholder="e.g. smartphones"
                            required
                            aria-invalid={Boolean(errors.slug)}
                            aria-describedby="category-slug-hint"
                            className={`h-11 w-full rounded-lg border bg-white px-3 font-mono text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
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
                            For example: computer-accessories.
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
                            placeholder="Describe the products in this category..."
                            rows={4}
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
                                Creating...
                            </>
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

                                Create Category
                            </>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}