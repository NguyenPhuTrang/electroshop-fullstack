import { Request, Response } from "express";
import { getPaymentById, updatePaymentStatus } from "../services/payment.service";
import { date, success } from "zod";
import { updatePaymentStatusSchema } from "../validations/payment.validation";
import { error } from "node:console";

export const getPaymentByIdController = async (
    req: Request,
    res: Response
) => {
    try {
            const paymentId = Number(req.params.id)
            if(!Number.isInteger(paymentId) || paymentId <= 0)
            {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment ID"
                });
            }
            const userId = req.user!.userId;
            const payment = await getPaymentById(
                paymentId,
                userId
            );

            return res.status(200).json({
                success: true,
                message: "Payment retrieved successfully",
                data: payment,
            });
    }  catch (error) {
        console.error(error);

        if (
            error instanceof Error &&
            error.message === "Payment not found"
        ) {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve payment",
        });
    }
};

export const updatePaymentStatusController = async (
    req: Request,
    res: Response
) => {
    try {
        const paymentId = Number (req.params.id);

        if(!Number.isInteger(paymentId) || paymentId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment ID",
            });
        }
        
        const result = updatePaymentStatusSchema.safeParse(req.body);

        if (!result.success)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status",
                errors: result.error.issues,
            });
        }

        const payment = await updatePaymentStatus(
            paymentId,
            result.data.status
        );

        return res.status(200).json({
            success: true,
            message: "Payment status updated successfully",
            date: payment,  
        });
    } catch (error) {
        console.error(error);

        if (
            error instanceof Error &&
            error.message === "Payment not found"
        ) {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update payment status",
        });
    }
};