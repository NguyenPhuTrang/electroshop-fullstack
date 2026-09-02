import { Request, Response, NextFunction } from "express";
import { createBrandSchema, updateBrandSchema } from "../validations/brand.validation"
import { createBrand, deleteBrand, getBrandById, getBrands, updateBrand } from "../services/brand.service";

export const createBrandController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try{
        const vadidation = createBrandSchema.safeParse(req.body);
        
        if(!vadidation.success)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid brand data",
                error: vadidation.error.issues
            });
        }
        const brand = await createBrand(vadidation.data);

        return res.status(201).json({
            success: true,
            message: "Brand created successfully",
            data: brand
        });
    } catch(error){
        next(error);
    }
};

export const getBrandsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const brands = await getBrands();

        return res.status(200).json({
            success: true,
            message: "Brand retrieved successfully",
            data: brands
        });
    } catch(error) {
        next(error);
    }
};

export const getBrandByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try{
        const brandId = Number(req.params.id);
        if(!Number.isInteger(brandId) || brandId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid brand Id"
            });
        }

        const brand = await getBrandById(brandId);
       
        return res.status(200).json({
            success: true,
            message: "Brand retrieve successfully",
            data: brand
        });
    } catch(error){
        next(error);
    }
};

export const updateBrandController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try{
        const brandId = Number(req.params.id);
        
        if(!Number.isInteger(brandId) || brandId <= 0)
            {
                return res.status(400).json({
                    success: false,
                    message: "Invalid brand Id"
                });
            }

        const validation = updateBrandSchema.safeParse(req.body);
        
        if(!validation.success)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid brand data",
                error: validation.error.issues, 
            });
        }
        
        const brand = await updateBrand(
            brandId,
            validation.data
        )

        return res.status(200).json({
            success: true,
            message: "Brand updated successfully",
            data: brand
        });
    } catch(error){
        next(error);
    }
};

export const deleteBrandController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try{
        const brandId = Number(req.params.id);

        if(!Number.isInteger(brandId) || brandId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid brand id"
            });
        }

        await deleteBrand(brandId);

        return res.status(200).json({
            success: true,
            message: "Brand deleted successfully"
        });
    }catch(error){
        next(error);
    }
};
