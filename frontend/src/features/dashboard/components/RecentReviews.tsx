import Link from "next/link";

type RecentReview = {
  id: number;
  user: {
    name: string;
  };
  createdAt: string;
  product: {
    name: string;
  };
  comment: string | null;
  rating: number;
  reply: { id?: number } | null;
};

type RecentReviewsProps = {
  reviews: RecentReview[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function RecentReviews({
  reviews,
}: RecentReviewsProps) {
  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Recent Reviews
          </h2>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Latest customer feedback and reply status.
          </p>
        </div>

        <Link
          href="/admin/reviews"
          className="inline-flex min-h-9 w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
        >
          View All Reviews
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-slate-100">
        {reviews.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No reviews found.
          </div>
        ) : (
          reviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:px-6"
            >
              {/* Review Information */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {review.user.name}
                  </p>

                  <span className="text-xs text-slate-400">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {review.product.name}
                </p>

                {review.comment && (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-700">
                    {review.comment}
                  </p>
                )}
              </div>

              {/* Rating and Reply Status */}
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <span
                  className="text-sm font-semibold text-amber-600"
                  aria-label={`Rating ${review.rating} out of 5`}
                >
                  {"★".repeat(review.rating)}
                  <span className="ml-1 text-slate-500">
                    {review.rating}/5
                  </span>
                </span>

                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                    review.reply
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {review.reply ? "Replied" : "Needs response"}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}