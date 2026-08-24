
import { Request, Response } from "express";
import { adminDeleteReview, createReview, deleteReview, getReviewsByProductId, updateReview } from "../services/review.service";
import { createReviewSchema, updateReviewSchema } from "../validations/review.validations";
import { number, success } from "zod";
import { error } from "node:console";


export const createReviewController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user!.userId;
        const productId = Number(req.params.productId);

        const result = createReviewSchema.safeParse(req.body);

        if(!result.success)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid review data",
                error: result.error.flatten(),
            });
        }

        if(!Number.isInteger(productId) || productId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
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
    } catch (error){
        console.error(error);

        if(error instanceof Error)
        {
            if(error.message === "Product not found")
                {
                    return res.status(404).json({
                        success: false,
                        message: error.message,
                    });
                }
            if (error.message === "You can only review product you have purchased")
            {
                return res.status(403).json({
                    success: false,
                    message: error.message,
                });
            }

            if (error.message === "You have alrealy reviewed this product")
            {
                return res.status(409).json({
                    success: false,
                    message: error.message,
                });
            }
        }
        return res.status(500).json({
            success: false,
            message: "Failed to create review"
        });
    }
};

export const getReviewsByProductIdController = async (
    req: Request,
    res: Response
) => {
    try {
        const productId = Number(req.params.productId);
        
        if(!Number.isInteger(productId) || productId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",

            });
        }

        const review = await getReviewsByProductId(productId);

        return res.status(200).json({
            success: true,
            message: "Reviews retrieved successfully",
            data: review,
        });
    } catch (error) {
        console.log("===== GET REVIEWS ERROR =====");
        console.log(error);

        if(
            error instanceof Error && 
            error.message === "Product not found"
        )
        {
            return res.status(400).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failsed to retrive review"
        });
    }

};

export const updateReviewController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user!.userId;
        const reviewId = Number(req.params.id);
    
        if(!Number.isInteger(reviewId) || reviewId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid review Id"
            });
        }
        const result = updateReviewSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid review data",
                errors: result.error.flatten(),
            });
        }
        const review = await updateReview(
            userId,
            reviewId,
            result.data.rating,
            result.data.comment
        );
        
        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: review,
        });

    } catch(error){
        console.log("===== UPDATE RIVIEW ERROR =====");
        console.log(error);
        if(error instanceof Error)
        {
            if(error.message === "Review not found") {
                return res.status(404).json({
                    success: false,
                    message: "Review not found",
                });
            }
            if(error.message === "You can only update your own review")
            {
                return res.status(403).json({
                    success:false,
                    message: "You can only update your own review",
                });
            }
        }

        return res.status(500).json({
            success: false,
            message: "Failed update review",
        });
    }
};

export const deleteReviewController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user!.userId;
        const reviewId = Number(req.params.id);

        if(!Number.isInteger(reviewId) || reviewId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid review Id"
            });
        }
        
        await deleteReview(userId, reviewId);

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch(error) {
        console.log("===== Delete reviews error =====");
        console.log(error);

        if(error instanceof Error)
        {
            if(error.message === "Review not found")
            {
                return res.status(404).json({
                    success: false,
                    message: "Review not found"
                });
            }
            
            if(error.message === "You can only delete your own review")
            {
                return res.status(403).json({
                    success: false,
                    message: "You can only delete your own review"
                });
            }
        }
        return res.status(500).json({
            success: false,
            message: "Failed delete review"
        });
    };
};

export const adminDeleteReviewController = async (
    req: Request,
    res: Response
) => {
    try{
        const reviewId = Number(req.params.id);

        if(!Number.isInteger(reviewId) || reviewId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid delete review"
            });
        }

        await adminDeleteReview(reviewId)

        return res.status(200).json({
            success: true, 
            message: "Review deleted successfully"
        })
    } catch(error){
        console.log("===== Admin delete review error =====");
        console.log(error)
        
        if(error instanceof Error && error.message === "Review not found")
        {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }
        return res.status(500).json({
            success: true,
            message: "Failed to delete review"
        });
    };

};