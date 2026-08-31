
import { Request, Response } from "express";
import { createProductImageSchema, updateProductImageSchema } from "../validations/productImage.validation";
import { createProductImage, deleteProductImage, getProductImageById, getProductImages, updateProductImage } from "../services/productImage.service";
export const createProductImageController = async (
    req: Request,
    res: Response
) => {
    try
    {
        const productId = Number(req.params.productId);

        if(!Number.isInteger(productId) || productId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid product Id"
            });
        }

        const validation = createProductImageSchema.safeParse(req.body);
        
        if(!validation.success)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid product image data",
                error: validation.error.issues
            });
        }

        const image = await createProductImage(
            productId,
            validation.data
        );

        return res.status(201).json({
            success: true,
            message: "Product image created successfully",
            data: image
        });
    } catch(error){
        console.log(error);
        
        if(error instanceof Error && error.message === "Product not found")
        {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create product image"
        });
    }
};

export const getProductImagesController = async (
    req: Request,
    res: Response
) => {
    try{
        const productId = Number(req.params.productId);

        if(!productId)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid Product id"
            });
        }

        const images = await getProductImages(productId);

        return res.status(200).json({
            success: true,
            message: "Product images retrieved successfully",
            data: images
        });
    }catch(error){
        console.log(error);

        if(error instanceof Error && error.message === "Product not found")
        {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to get product image"
        });
    }

};

export const updateProductImageController = async (
    req: Request,
    res: Response
) => {
    try{
        const imageId = Number(req.params.id);

        if(!Number.isInteger(imageId) || imageId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid product image Id"
            });
        }

        const validation = updateProductImageSchema.safeParse(req.body);

        if(!validation.success)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid product image data",
                error: validation.error.issues
            });
        }

        const image = await updateProductImage(
            imageId,
            validation.data
        )

        return res.status(200).json({
            success: true,
            message: "Product image updated successfully",
            data: image
        });

    }catch(error){
        console.log(error)

        if(error instanceof Error && error.message === "Product image not found")
            {
                return res.status(404).json({
                    success: false,
                    message: "Product image not found"
                });
            } 

        return res.status(500).json({
            success: false,
            message: "Failed to update product image"
        });
    }
};

export const getProductImageByIdController = async (
    req: Request,
    res: Response
) => {
    try {
        const imageId = Number(req.params.id);

        if (!Number.isInteger(imageId) || imageId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product image id",
            });
        }

        const image = await getProductImageById(imageId);

        return res.status(200).json({
            success: true,
            message: "Product image retrieved successfully",
            data: image,
        });
    } catch (error) {
        console.log(error);

        if (
            error instanceof Error &&
            error.message === "Product image not found"
        ) {
            return res.status(404).json({
                success: false,
                message: "Product image not found",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to get product image",
        });
    }
};

export const deldeteProductImageController = async(
    req: Request,
    res: Response
) => {
    try{
        const imageId = Number(req.params.id);

        if(!Number.isInteger(imageId) || imageId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid product image Id"
            });
        }

        await deleteProductImage(imageId);

        return res.status(200).json({
            success: true,
            message: "Product image deleted successfully"
        });
    } catch(error){
        console.log(error)

        if(error instanceof Error && error.message === "Product image not found")
        {
            return res.status(404).json({
                success: false,
                message: "Product image not found"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete product image"
        });
    }
};

