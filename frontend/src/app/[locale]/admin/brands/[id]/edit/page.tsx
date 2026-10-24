"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

import type { Brand } from "@/src/features/brand/types/brand";
import {
    getBrandById,
    updateBrand,
} from "@/src/features/brand/services/brand.service";

type BrandFormErrors = {
    name?: string;
    slug?: string;
    logo?: string;
};

export default function EditBrandPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const brandId = Number(params.id);

    const [brand, setBrand] = useState<Brand | null>(null);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [logo, setLogo] = useState("");

    const [errors, setErrors] = useState<BrandFormErrors>({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Load the existing brand.
    const loadBrand = useCallback(async () => {
        if (!Number.isInteger(brandId) || brandId <= 0) {
            setLoadError("Invalid brand ID.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setLoadError("");

        try {
            const data = await getBrandById(brandId);

            setBrand(data);
            setName(data.name);
            setSlug(data.slug);
            setDescription(data.description ?? "");

            // Keep the current logo unless a replacement URL is provided.
            setLogo("");
            setErrors({});
        } catch (error) {
            console.error("Failed to load brand:", error);
            setLoadError("Unable to load brand. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [brandId]);

    useEffect(() => {
        void loadBrand();
    }, [loadBrand]);

    // Save brand changes.
    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (submitting || !brand) {
            return;
        }

        const trimmedName = name.trim();
        const trimmedSlug = slug.trim();
        const trimmedDescription = description.trim();
        const trimmedLogo = logo.trim();

        const nextErrors: BrandFormErrors = {};

        if (!trimmedName) {
            nextErrors.name = "Brand name is required.";
        }

        if (!trimmedSlug) {
            nextErrors.slug = "Brand slug is required.";
        } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
            nextErrors.slug =
                "Use lowercase letters, numbers, and hyphens only.";
        }

        if (trimmedLogo) {
            try {
                const logoUrl = new URL(trimmedLogo);

                if (
                    logoUrl.protocol !== "http:" &&
                    logoUrl.protocol !== "https:"
                ) {
                    nextErrors.logo =
                        "Logo URL must start with http:// or https://.";
                }
            } catch {
                nextErrors.logo = "Please enter a valid logo URL.";
            }
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        const toastId = toast.loading("Updating brand...");
        setSubmitting(true);

        try {
            await updateBrand(brandId, {
                name: trimmedName,
                slug: trimmedSlug,
                description: trimmedDescription,
                logo: trimmedLogo || undefined,
            });

            toast.success("Brand updated successfully.", {
                id: toastId,
            });

            router.push("/admin/brands");
        } catch (error) {
            console.error("Failed to update brand:", error);

            toast.error(
                "Unable to update brand. Check that the name and slug are unique and the logo URL is valid.",
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
                Loading brand...
            </div>
        );
    }

    // Error state.
    if (loadError || !brand) {
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
                    Unable to load brand
                </h2>

                <p className="mt-1 text-sm text-rose-600">
                    {loadError || "Brand not found."}
                </p>

                <div className="mt-5 flex gap-3">
                    <button
                        type="button"
                        onClick={() => void loadBrand()}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                        Try Again
                    </button>

                    <Link
                        href="/admin/brands"
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Back to Brands
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
            <header className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-2 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-cyan-500" />

                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                        Electroshop Administration
                    </p>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    Edit Brand
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Update the information for {brand.name}.
                </p>
            </header>

            {/* Edit Form */}
            <form
                onSubmit={handleSubmit}
                noValidate
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
                <div className="space-y-6 p-5 sm:p-6">
                    {/* Brand Name */}
                    <div>
                        <label
                            htmlFor="brand-name"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Brand Name
                            <span className="ml-1 text-rose-500">*</span>
                        </label>

                        <input
                            id="brand-name"
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
                            <p role="alert" className="mt-2 text-xs text-rose-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Slug */}
                    <div>
                        <label
                            htmlFor="brand-slug"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Slug
                            <span className="ml-1 text-rose-500">*</span>
                        </label>

                        <input
                            id="brand-slug"
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
                            aria-describedby="brand-slug-hint"
                            className={`h-11 w-full rounded-lg border bg-white px-3 font-mono text-sm text-slate-800 outline-none transition focus:ring-2 ${
                                errors.slug
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                    : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />

                        <p
                            id="brand-slug-hint"
                            className="mt-2 text-xs text-slate-500"
                        >
                            Use lowercase letters, numbers, and hyphens.
                        </p>

                        {errors.slug && (
                            <p role="alert" className="mt-2 text-xs text-rose-600">
                                {errors.slug}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="brand-description"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Description
                            <span className="ml-2 text-xs font-normal text-slate-400">
                                Optional
                            </span>
                        </label>

                        <textarea
                            id="brand-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            rows={4}
                            placeholder="Enter information about this brand..."
                            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Current Logo */}
                    {brand.logo && (
                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-700">
                                Current Logo
                            </p>

                            <div className="flex size-24 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
                                <Image
                                    src={brand.logo}
                                    alt={`${brand.name} logo`}
                                    width={80}
                                    height={80}
                                    className="size-full object-contain"
                                />
                            </div>
                        </div>
                    )}

                    {/* Replace Logo */}
                    <div>
                        <label
                            htmlFor="brand-logo"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            New Logo URL
                            <span className="ml-2 text-xs font-normal text-slate-400">
                                Optional
                            </span>
                        </label>

                        <input
                            id="brand-logo"
                            type="url"
                            value={logo}
                            onChange={(event) => {
                                setLogo(event.target.value);

                                setErrors((prev) => ({
                                    ...prev,
                                    logo: undefined,
                                }));
                            }}
                            placeholder="https://example.com/new-logo.png"
                            aria-invalid={Boolean(errors.logo)}
                            className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                                errors.logo
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                    : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            Enter a publicly accessible URL to replace the
                            current logo. Leave blank to keep the current logo.
                            The backend uploads replacement images to
                            Cloudinary.
                        </p>

                        {errors.logo && (
                            <p role="alert" className="mt-2 text-xs text-rose-600">
                                {errors.logo}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:px-6">
                    <Link
                        href="/admin/brands"
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