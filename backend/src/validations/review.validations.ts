import z from "zod";

export const createReviewSchema = z.object({
    rating:z
        .number()
        .int()
        .min(1)
        .max(5),
    comment:z
        .string()
        .trim()
        .optional(),
});

export const updateReviewSchema = z.object({
    rating: z
        .number()
        .int()
        .min(1)
        .max(5)
        .optional(),
    comment: z
        .string()
        .trim()
        .optional(),
})
.refine(
    (data) =>
        data.rating !== undefined || data.comment !== undefined,
    {
        message: "At least one filed must be proviedid"
    }
);


