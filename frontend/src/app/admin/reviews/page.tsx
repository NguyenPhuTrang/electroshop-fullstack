"use client";

import { useState } from "react";
import { useAdminReviews } from "@/src/features/review/hooks/useAdminReviews";
import { createReviewReply, updateReviewReply } from "@/src/features/review/services/review.service";
import { Review } from "@/src/features/review/types/review";

const REVIEW_RATINGS = [5, 4, 3, 2, 1];

export default function AdminReviewsPage() {
    const [search, setSearch] = useState("");
    const [rating, setRating] = useState("");
    const [page, setPage] = useState(1);

    const [selectedReview, setSelectedReview] = useState<Review|null>(null)
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
        return new Date(value).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };

    const renderRating = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map(
                    (_, index) => (
                        <span
                            key={index}
                            className={
                                index < rating
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                            }
                        >
                            ★
                        </span>
                    )
                )}
            </div>
        );
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
        setReplyError("Reply is required");
        return;
    }

    try {
        setSubmittingReply(true);
        setReplyError("");

        if (selectedReview.reply) {
            await updateReviewReply(
                selectedReview.id,
                comment
            );
        } else {
            await createReviewReply(
                selectedReview.id,
                comment
            );
        }

        await refetch();

        handleCloseReply();
    } catch (error) {
        console.error(
            "Failed to save review reply",
            error
        );

        setReplyError("Failed to save reply");
    } finally {
        setSubmittingReply(false);
    }
};

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Review Management
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Manage customer product reviews
                </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 md:flex-row">
                <div className="flex-1">
                    <label
                        htmlFor="review-search"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Search
                    </label>

                    <input
                        id="review-search"
                        type="text"
                        value={search}
                        onChange={(event) =>
                            handleSearchChange(
                                event.target.value
                            )
                        }
                        placeholder="Search by comment, customer, email, or product..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500"
                    />
                </div>

                <div className="w-full md:w-56">
                    <label
                        htmlFor="review-rating"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Rating
                    </label>

                    <select
                        id="review-rating"
                        value={rating}
                        onChange={(event) =>
                            handleRatingChange(
                                event.target.value
                            )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500"
                    >
                        <option value="">
                            All Ratings
                        </option>

                        {REVIEW_RATINGS.map(
                            (reviewRating) => (
                                <option
                                    key={reviewRating}
                                    value={reviewRating}
                                >
                                    {reviewRating} Stars
                                </option>
                            )
                        )}
                    </select>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Customer
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Product
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Rating
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Comment
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Created
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-sm text-gray-500"
                                    >
                                        Loading reviews...
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-sm text-gray-500"
                                    >
                                        No reviews found.
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => (
                                    <tr
                                        key={review.id}
                                        className="transition hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-gray-900">
                                                {review.user.name}
                                            </div>

                                            <div className="mt-1 text-xs text-gray-500">
                                                {review.user.email}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="font-medium text-gray-900">
                                                {review.product.name}
                                            </div>

                                            <div className="mt-1 text-xs text-gray-500">
                                                ID: {review.product.id}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div>
                                                {renderRating(
                                                    review.rating
                                                )}

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {review.rating}/5
                                                </p>
                                            </div>
                                        </td>

                                        <td className="max-w-md px-4 py-4">
                                            <p className="line-clamp-2 text-sm text-gray-700">
                                                {review.comment ||
                                                    "No comment"}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {formatDate(
                                                review.createdAt
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                           <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenReply(review)
                                                }
                                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                                            >
                                                {review.reply ? "Edit Reply" : "Reply"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!loading &&
                pagination.totalPages > 0 && (
                    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-sm text-gray-500">
                            Page {pagination.page} of{" "}
                            {pagination.totalPages}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage(
                                        (current) =>
                                            current - 1
                                    )
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={
                                    page >=
                                    pagination.totalPages
                                }
                                onClick={() =>
                                    setPage(
                                        (current) =>
                                            current + 1
                                    )
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {selectedReview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {selectedReview.reply
                                            ? "Edit Reply"
                                            : "Reply to Review"}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {selectedReview.product.name}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCloseReply}
                                    disabled={submittingReply}
                                    className="text-xl text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-5 p-6">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedReview.user.name}
                                    </p>

                                    <div className="mt-1">
                                        {renderRating(selectedReview.rating)}
                                    </div>

                                    <p className="mt-3 text-sm leading-6 text-gray-700">
                                        {selectedReview.comment || "No comment"}
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="review-reply"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Your Response
                                    </label>

                                    <textarea
                                        id="review-reply"
                                        value={replyComment}
                                        onChange={(event) =>
                                            setReplycomment(event.target.value)
                                        }
                                        rows={5}
                                        placeholder="Write a response to this customer..."
                                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500"
                                    />
                                </div>

                                {replyError && (
                                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                        {replyError}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseReply}
                                        disabled={submittingReply}
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSubmitReply}
                                        disabled={
                                            submittingReply ||
                                            !replyComment.trim()
                                        }
                                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {submittingReply
                                            ? "Saving..."
                                            : selectedReview.reply
                                            ? "Update Reply"
                                            : "Send Reply"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}