import { Request, Response } from "express";
import { createBrandSchema, updateBrandSchema } from "../validations/brand.validation"
import console from "node:console";
import { createBrand, deleteBrand, getBrandById, getBrands, updateBrand } from "../services/brand.service";


export const createBrandController = async (
    req: Request,
    res: Response
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
        console.log(error);
        if(error instanceof Error && error.message === "Brand name already exists")
        {
            return res.status(409).json({
                success: false,
                message: "Brand name already exists"
            });
        }

        if(error instanceof Error && error.message === "Brand slug already exists")
        {
            return res.status(409).json({
                success: false,
                message: "Brand slug already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed crate brand"
        });
    }
};

export const getBrandsController = async (
    req: Request,
    res: Response
) => {
    try {
        const brands = await getBrands();

        return res.status(200).json({
            success: true,
            message: "Brand retrieved successfully",
            data: brands
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve brand"
        });
    }
};

export const getBrandByIdController = async (
    req: Request,
    res: Response
) => {
    try{
        const brandId = Number(req.params.id);
        if(!Number(brandId) || brandId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid brand Id"
            });
        }
        const brand = await getBrandById(brandId);
        if(!brand)
        {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Brand retrieve successfully",
            data: brand
        });
    } catch(error){
        console.error(error)
        
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve brand"
        });
    }
};

export const updateBrandController = async (
    req: Request,
    res: Response
) => {
    try{
        const brandId = Number(req.params.id);
        
        if(!Number(brandId) || brandId <= 0)
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
        console.log(error)
        if(error instanceof Error && error.message === "Brand not found")
        {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            });
        }

        if(error instanceof Error && error.message === "Brand name already exists")
        {
            return res.status(409).json({
                success: false,
                message: "Brand name already exists"
            });
        }

        if(error instanceof Error && error.message === "Brand slug already exists")
        {
            return res.status(409).json({
                success: false,
                message: "Brand slug already exists"
            });
        }

        return res.status(500).json({
                success: false,
                message: "Failed update brand"
            });
    }
};

export const deleteBrandController = async (
    req: Request,
    res: Response
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
        console.log(error);
        if(error instanceof Error && error.message === "Brand not found")
        {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            });
        }
        
        if(error instanceof Error && error.message === "Can not delete brand because it has product"){
            return res.status(409).json({
                success: false,
                message: "Can not delete brand because it has product"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete brand"
        });
    }
};
