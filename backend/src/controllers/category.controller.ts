import { number, success } from "zod";
import { createCategorySchema, updateCategorySchema } from "../validations/category.validation"
import { Request, Response } from "express";
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../services/category.service";
import { error } from "node:console";

export const createCategoryController = async (
    req: Request,
    res: Response
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
            massage: "Create category successfully",
            data: category
        })
    } catch (error) {
        console.error(error)

        if(error instanceof Error && error.message === "Category slug already exists")
        {
            return res.status(409).json({
                success: false,
                message: "Ctegory slug already exists"
            });
        }

        if(error instanceof Error && error.message === "Category name already exists"){
            return res.status(409).json({
                success: false,
                message: "Category name already exists"
            })
        }

        return res.status(500).json({
            success: false,
            message: "Failed to post category"
        })
    }
};

export const getCategoriesController = async (
    req: Request,
    res: Response
) => {
    try{
    const categories = await getCategories();
    return res.status(200).json({
        success: true,
        message: "Categories retrieved successfully",
        data: categories
    });
} catch(error){
    console.log(error);
    return res.status(500).json({
        success: false,
        message: "Failed to retrieve categories"
    });
    }
};

export const getCategoryByIdController = async (
    req: Request,
    res: Response
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

         if(!category){
            res.status(404).json({
                success: false,
                message: "Category not found"
            });
         }

         return res.status(200).json({
            success: true,
            message: "Category retrieved successfully",
            data: category
         });

    } catch(error)
    {
        console.log(error)
        return res.status(500).json({
            success:false,
            message: "Failed to retrieve category"
        });
    }
};

export const updateCategoryController = async (
    req: Request,
    res: Response
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
        console.log(error);

        if(error instanceof Error && error.message === "Category not found")
        {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        if(error instanceof Error && error.message === "Category slug already exists")
        {
            return res.status(409).json({
                success: false,
                message: "Category slug already exists"
            });
        }

        if(error instanceof Error && error.message === "Category name already exists")
        {
            return res.status(409).json({
                success: false,
                message: "Category name already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update category"
        });
    };
};

export const deleteCategoryController = async (
    req: Request,
    res: Response
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
        console.log(error);
        if(error instanceof Error && error.message === "Category not found")
        {
            res.status(404).json({
                success: false,
                message: "Invalid category Id"
            });
        }
        if(error instanceof Error && error.message ==="Category slug already exits")
        {
            return res.status(409).json({
                success: false,
                message: "Category slug already exits"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete category"
        });
    }
}