"use client";
import { Review } from "../types/review";

type ReviewListProps = {
  reviews: Review[];
};

export default function ReviewList({
  reviews,
}: ReviewListProps) {
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold">
        Reviews ({reviews.length})
      </h2>

      {/* Average Rating */}
      <div className="mt-4 flex items-center gap-3">
        <div className="text-lg text-yellow-500">
          {"★".repeat(Math.round(averageRating))}
          {"☆".repeat(5 - Math.round(averageRating))}
        </div>

        <span className="font-semibold">
          {averageRating.toFixed(1)}
        </span>

        <span className="text-gray-500">
          ({reviews.length}{" "}
          {reviews.length === 1 ? "review" : "reviews"})
        </span>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-6 text-gray-500">
          No reviews yet.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b pb-6"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {review.user.name}
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString("en-US")}
                </p>
              </div>

              <div className="mt-2 text-yellow-500">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </div>

              {review.comment && (
                <p className="mt-3 text-gray-600">
                  {review.comment}
                </p>
              )}

              {review.reply && (
                <div className="mt-4 border-l-2 border-gray-200 pl-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Electroshop Response
                    </p>

                    <span className="text-xs text-gray-400">
                      {review.reply.admin.name}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {review.reply.comment}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}