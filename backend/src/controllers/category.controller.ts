import { createCategorySchema, updateCategorySchema } from "../validations/category.validation"
import { NextFunction, Request, Response } from "express";
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../services/category.service";

export const createCategoryController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validation = createCategorySchema.safeParse(req.body);
        if(!validation.success)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid category data",
                errors: validation.error.issues    
            });
        }

        const category = await createCategory(validation.data);

        return res.status(201).json({
            success: true,
            message: "Create category successfully",
            data: category
        })
    } catch (error) {
       next(error);
    }
};

export const getCategoriesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try{
    const categories = await getCategories();
    return res.status(200).json({
        success: true,
        message: "Categories retrieved successfully",
        data: categories
    });
} catch(error){
   next(error);
    }
};

export const getCategoryByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try{
        const categoryId =Number(req.params.id);
        if(!Number.isInteger(categoryId) || categoryId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid category Id"
            });
        }

         const category = await getCategoryById(categoryId);

         return res.status(200).json({
            success: true,
            message: "Category retrieved successfully",
            data: category
         });

    } catch(error)
    {
        next(error);
    }
};

export const updateCategoryController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const categoryId = Number(req.params.id);

        if(!Number.isInteger(categoryId) || categoryId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid category Id"
            });
        }

        const validation = updateCategorySchema.safeParse(req.body)
        
        if(!validation.success)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid category data",
                error: validation.error.issues
            })
        }
        const category = await updateCategory(
            categoryId,
            validation.data
        );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        })
 
    } catch(error){
        next(error);
    };
};

export const deleteCategoryController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const categoryId = Number(req.params.id);
        if(!Number.isInteger(categoryId) || categoryId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid category Id"
            });
        }

        await deleteCategory(
            categoryId
        )
        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch(error){
        next(error);
    }
}