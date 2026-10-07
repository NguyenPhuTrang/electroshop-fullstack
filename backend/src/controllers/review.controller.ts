import { NextFunction, Request, Response } from "express";
import {
  adminDeleteReview,
  createReview,
  createReviewReply,
  deleteReview,
  getAdminReviews,
  getReviewsByProductId,
  updateReviewReply,
} from "../services/review.service";
import {
  createReviewReplySchema,
  createReviewSchema,
  updateReviewReplySchema,
} from "../validations/review.validations";
import { success } from "zod";

export const createReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const result = createReviewSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid review data",
        errors: result.error.flatten(),
      });
    }

    const review = await createReview(
      userId,
      productId,
      result.data.rating,
      result.data.comment
    );

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewsByProductIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const reviews = await getReviewsByProductId(productId);

    return res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const reviewId = Number(req.params.id);

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    await deleteReview(userId, reviewId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviewId = Number(req.params.id);

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    await adminDeleteReview(reviewId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminReviewsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const page = Number(req.query.page) || 1; // lấy dữ liệu từ request gửi lên và trả về và lấy ra từ url
    const limit = Number(req.query.limit) || 10;

    const rating = req.query.rating ? Number(req.query.rating) : undefined;

    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    if(!Number.isInteger(page) || page <=0){
      return res.status(400).json({
        success: false,
        message: "Invalid page"
      })
    }

     if (!Number.isInteger(limit) || limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit",
      });
    }

    if (
      rating !== undefined &&
      (!Number.isInteger(rating) || rating < 1 || rating > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid rating",
      });
    }

    const result = await getAdminReviews({
      page,
      limit,
      search,
      rating
    });

    return res.status(200).json({
      success: true,
      message: "Admin reviews retrieved successfully",
      data: result.reviews,
      pagination: result.pagination
    })
  
  }catch(error){
    next(error);
  }

};

export const createReviewReplyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const adminId = req.user!.userId; //lấy userId từ access token
    const reviewId = Number(req.params.id); // lấy reviewId từ params

    if(!Number.isInteger(reviewId) || reviewId <= 0){
         return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const result = createReviewReplySchema.safeParse(req.body);

    if(!result.success){
      return res.status(400).json({
        success: false,
        message: "Invalid retrieved reply data",
        errors: result.error.flatten(), // .flatten() là hàm của Zod (thư viện validate dữ liệu mà bạn đang dùng trong, Nó gom các lỗi validate thành một object gọn gàng, dễ đọc.
      })
    }

    const reply = await createReviewReply(
      adminId,
      reviewId,
      result.data.comment
    );

    return res.status(201).json({
      success: true,
      message: "Review reply created successfully",
      data: reply
    })
  }catch(error){
    next(error);
  }
};

export const updateReviewReplyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const adminId = req.user!.userId;
    const reviewId = Number(req.params.id);

    if(!Number.isInteger(reviewId) || reviewId <= 0){
      return res.status(400).json({
        success: false,
        message: "Invalid review Id",
      })
    }

    const result = updateReviewReplySchema.safeParse(req.body);

    if(!result.success){
      return res.status(400).json({
        success: false,
        message: "Invalid review reply data",
        errors: result.error.flatten(),
      })
    }

    const reply = await updateReviewReply(
      adminId,
      reviewId,
      result.data.comment
    );

    return res.status(200).json({
      success: true,
      message: "Review reply updated successfully",
      data: reply,
    })
  }catch (error) {
    next(error);
  }
};

