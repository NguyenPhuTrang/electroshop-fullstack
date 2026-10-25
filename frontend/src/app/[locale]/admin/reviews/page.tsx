"use client";

import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useAdminReviews } from "@/src/features/review/hooks/useAdminReviews";
import {
    createReviewReply,
    updateReviewReply,
} from "@/src/features/review/services/review.service";
import type { Review } from "@/src/features/review/types/review";
import { useSearchParams } from "next/navigation";

const REVIEW_RATINGS = [5, 4, 3, 2, 1];

const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const buttonClassName =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

function ReviewRating({ rating }: { rating: number }) {
    const t = useTranslations("AdminReviewsPage");

    return (
        <div
            className="flex items-center gap-0.5"
            aria-label={t("starsAria", { rating })}
        >
            {Array.from({ length: 5 }).map((_, index) => (
                <svg
                    key={index}
                    viewBox="0 0 24 24"
                    fill={index < rating ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`h-4 w-4 ${
                        index < rating
                            ? "text-amber-400"
                            : "text-slate-300"
                    }`}
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6.01L12 16.77l-5.4 2.84 1.03-6.01L3.27 9.35l6.03-.88L12 3Z"
                    />
                </svg>
            ))}
        </div>
    );
}

function ReplyStatusBadge({ hasReply }: { hasReply: boolean }) {
    const t = useTranslations("AdminReviewsPage");

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                hasReply
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {hasReply ? t("replied") : t("awaitingReply")}
        </span>
    );
}

function ReviewTableSkeleton() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, index) => (
                <tr
                    key={index}
                    className="animate-pulse border-b border-slate-100 last:border-b-0"
                >
                    <td className="px-5 py-4">
                        <div className="h-4 w-28 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-36 rounded bg-slate-100" />
                    </td>

                    <td className="px-5 py-4">
                        <div className="h-4 w-32 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-16 rounded bg-slate-100" />
                    </td>

                    <td className="px-5 py-4">
                        <div className="h-4 w-24 rounded bg-slate-100" />
                        <div className="mt-2 h-3 w-10 rounded bg-slate-100" />
                    </td>

                    <td className="px-5 py-4">
                        <div className="h-4 w-48 rounded bg-slate-100" />
                        <div className="mt-2 h-3 w-36 rounded bg-slate-100" />
                    </td>

                    <td className="px-5 py-4">
                        <div className="h-4 w-20 rounded bg-slate-100" />
                    </td>

                    <td className="px-5 py-4">
                        <div className="h-8 w-24 rounded-lg bg-slate-100" />
                    </td>
                </tr>
            ))}
        </>
    );
}

function EmptyReviews({
    unanswered,
    hasFilters,
    onClearFilters,
}: {
    unanswered: boolean;
    hasFilters: boolean;
    onClearFilters: () => void;
}) {
    const t = useTranslations("AdminReviewsPage");

    return (
        <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-7 w-7"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
                    />
                </svg>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-800">
                {unanswered ? t("noUnanswered") : t("noReviews")}
            </p>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                {unanswered ? t("noUnansweredDesc") : t("noReviewsDesc")}
            </p>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onClearFilters}
                    className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                    {t("clearFilters")}
                </button>
            )}
        </div>
    );
}

function AdminReviewsContent() {
    const t = useTranslations("AdminReviewsPage");
    const locale = useLocale();
    const searchParams = useSearchParams();

    const unanswered = searchParams.get("unanswered") === "true";

    const [search, setSearch] = useState("");
    const [rating, setRating] = useState("");
    const [page, setPage] = useState(1);

    const [selectedReview, setSelectedReview] =
        useState<Review | null>(null);

    const [replyComment, setReplycomment] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);
    const [replyError, setReplyError] = useState("");

    const limit = 10;

    const {
        reviews,
        pagination,
        loading,
        error,
        refetch,
    } = useAdminReviews({
        search: search || undefined,
        rating: rating ? Number(rating) : undefined,
        unanswered,
        page,
        limit,
    });

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleRatingChange = (value: string) => {
        setRating(value);
        setPage(1);
    };

    const formatDate = (value: string) => {
        return new Date(value).toLocaleDateString(locale, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleOpenReply = (review: Review) => {
        setSelectedReview(review);
        setReplycomment(review.reply?.comment ?? "");
        setReplyError("");
    };

    const handleCloseReply = () => {
        if (submittingReply) {
            return;
        }

        setSelectedReview(null);
        setReplycomment("");
        setReplyError("");
    };

    const handleSubmitReply = async () => {
        if (!selectedReview) {
            return;
        }

        const comment = replyComment.trim();

        if (!comment) {
            setReplyError(t("replyRequired"));
            return;
        }

        try {
            setSubmittingReply(true);
            setReplyError("");

            if (selectedReview.reply) {
                await updateReviewReply(selectedReview.id, comment);
            } else {
                await createReviewReply(selectedReview.id, comment);
            }

            await refetch();

            setSelectedReview(null);
            setReplycomment("");
            setReplyError("");
        } catch (error) {
            console.error("Failed to save review reply", error);
            setReplyError(t("replyFailed"));
        } finally {
            setSubmittingReply(false);
        }
    };

    const hasFilters = Boolean(search || rating);

    const clearFilters = () => {
        setSearch("");
        setRating("");
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
                            {unanswered
                                ? t("subtitleUnanswered")
                                : t("subtitleAll")}
                        </p>
                    </div>

                    {unanswered && (
                        <div className="inline-flex items-center gap-2 self-start rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 sm:self-auto">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="12" r="9" />
                                <path
                                    strokeLinecap="round"
                                    d="M12 7v5l3 2"
                                />
                            </svg>
                            {t("awaitingResponse")}
                        </div>
                    )}
                </motion.div>

                {/* Filters */}
                <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                    <div className="mb-5">
                        <h2 className="text-base font-semibold text-slate-800">
                            {t("searchAndFilters")}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {t("searchAndFiltersDesc")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                        {/* Search */}
                        <div>
                            <label
                                htmlFor="review-search"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                {t("searchReviews")}
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
                                    id="review-search"
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

                        {/* Rating */}
                        <div>
                            <label
                                htmlFor="review-rating"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                {t("rating")}
                            </label>

                            <select
                                id="review-rating"
                                value={rating}
                                onChange={(event) =>
                                    handleRatingChange(event.target.value)
                                }
                                className={inputClassName}
                            >
                                <option value="">{t("allRatings")}</option>

                                {REVIEW_RATINGS.map((reviewRating) => (
                                    <option
                                        key={reviewRating}
                                        value={reviewRating}
                                    >
                                        {t("starsOption", {
                                            count: reviewRating,
                                        })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {hasFilters && (
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                            >
                                {t("clearFilters")}
                            </button>
                        </div>
                    )}
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-800">
                                {t("customerReviews")}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {t("customerReviewsDesc")}
                            </p>
                        </div>

                        <span
                            className={`inline-flex items-center self-start rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                                unanswered
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-slate-200 bg-slate-50 text-slate-600"
                            }`}
                        >
                            {unanswered
                                ? t("unansweredBadge")
                                : t("allReviewsBadge")}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[1050px] w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {t("colCustomer")}
                                    </th>

                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {t("colProduct")}
                                    </th>

                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {t("colRating")}
                                    </th>

                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {t("colComment")}
                                    </th>

                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {t("colCreated")}
                                    </th>

                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {t("colReplyStatus")}
                                    </th>

                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {t("colAction")}
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <ReviewTableSkeleton />
                                ) : reviews.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-0">
                                            <EmptyReviews
                                                unanswered={unanswered}
                                                hasFilters={hasFilters}
                                                onClearFilters={clearFilters}
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    reviews.map((review, index) => (
                                        <motion.tr
                                            key={review.id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.2,
                                                delay: index * 0.025,
                                            }}
                                            className="transition-colors hover:bg-blue-50/40"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {review.user.name}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {review.user.email}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="max-w-56 truncate text-sm font-semibold text-slate-800">
                                                    {review.product.name}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {t("productId", {
                                                        id: review.product.id,
                                                    })}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <ReviewRating
                                                    rating={review.rating}
                                                />

                                                <p className="mt-1.5 text-xs font-medium text-slate-500">
                                                    {review.rating}/5
                                                </p>
                                            </td>

                                            <td className="max-w-sm px-5 py-4">
                                                <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                                                    {review.comment ||
                                                        t("noComment")}
                                                </p>

                                                {review.reply?.comment && (
                                                    <p className="mt-2 line-clamp-1 text-xs text-emerald-700">
                                                        {t("replyLine", {
                                                            comment:
                                                                review.reply
                                                                    .comment,
                                                        })}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                                                {formatDate(review.createdAt)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <ReplyStatusBadge
                                                    hasReply={Boolean(
                                                        review.reply
                                                    )}
                                                />
                                            </td>

                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleOpenReply(review)
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                                >
                                                    {review.reply
                                                        ? t("editReply")
                                                        : t("reply")}

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
                                                            d="m10 17 5-5-5-5M4 12h11"
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
                                disabled={page >= pagination.totalPages}
                                onClick={() =>
                                    setPage((current) => current + 1)
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
                    </motion.div>
                )}
            </div>

            {/* Reply Modal */}
            <AnimatePresence>
                {selectedReview && (
                    <motion.div
                        key="review-reply-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"
                        onMouseDown={(event) => {
                            if (
                                event.target === event.currentTarget &&
                                !submittingReply
                            ) {
                                handleCloseReply();
                            }
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="review-reply-title"
                            className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div className="min-w-0">
                                    <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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
                                                d="m10 17 5-5-5-5M4 12h11"
                                            />
                                        </svg>
                                    </div>

                                    <h2
                                        id="review-reply-title"
                                        className="text-lg font-bold text-slate-900"
                                    >
                                        {selectedReview.reply
                                            ? t("editReply")
                                            : t("replyToReview")}
                                    </h2>

                                    <p className="mt-1 truncate text-sm text-slate-500">
                                        {selectedReview.product.name}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCloseReply}
                                    disabled={submittingReply}
                                    aria-label={t("closeDialog")}
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-5 p-5 sm:p-6">
                                {/* Customer Review */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {selectedReview.user.name}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {selectedReview.user.email}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <ReviewRating
                                                rating={selectedReview.rating}
                                            />
                                            <span className="text-xs font-semibold text-slate-600">
                                                {selectedReview.rating}/5
                                            </span>
                                        </div>
                                    </div>

                                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                        {selectedReview.comment ||
                                            t("noComment")}
                                    </p>
                                </div>

                                {/* Reply Form */}
                                <div>
                                    <label
                                        htmlFor="review-reply"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        {t("yourResponse")}
                                    </label>

                                    <textarea
                                        id="review-reply"
                                        value={replyComment}
                                        onChange={(event) =>
                                            setReplycomment(
                                                event.target.value
                                            )
                                        }
                                        rows={5}
                                        maxLength={2000}
                                        disabled={submittingReply}
                                        placeholder={t("replyPlaceholder")}
                                        className={`${inputClassName} resize-y leading-6 disabled:cursor-not-allowed disabled:bg-slate-50`}
                                    />

                                    <div className="mt-1.5 flex items-center justify-between gap-3">
                                        <p className="text-xs text-slate-400">
                                            {t("replyHint")}
                                        </p>

                                        <span className="shrink-0 text-xs tabular-nums text-slate-400">
                                            {replyComment.length}/2000
                                        </span>
                                    </div>
                                </div>

                                {replyError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        role="alert"
                                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                                    >
                                        {replyError}
                                    </motion.div>
                                )}

                                {/* Modal Actions */}
                                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCloseReply}
                                        disabled={submittingReply}
                                        className={buttonClassName}
                                    >
                                        {t("cancel")}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSubmitReply}
                                        disabled={
                                            submittingReply ||
                                            !replyComment.trim() ||
                                            replyComment.trim().length > 2000
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                                    >
                                        {submittingReply ? (
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
                                            <>
                                                {selectedReview.reply
                                                    ? t("updateReply")
                                                    : t("sendReply")}
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
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.main>
    );
}

export default function AdminReviewsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-40 animate-pulse bg-slate-50/70 p-6">
                    <div className="mx-auto max-w-[1600px] space-y-5">
                        <div className="h-8 w-64 rounded-lg bg-slate-200" />
                        <div className="h-20 rounded-2xl border border-slate-200 bg-white" />
                        <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
                    </div>
                </div>
            }
        >
            <AdminReviewsContent />
        </Suspense>
    );
}