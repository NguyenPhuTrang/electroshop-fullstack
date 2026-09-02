import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

export const createCategory = async (
    data: {
        name: string;
        slug: string;
        description?: string
    }
) => {
    const existingCategory = await prisma.category.findFirst({
          where: {
            OR: [
                {
                    name: data.name,
                },
                {
                    slug: data.slug,
                },
            ],
        },
    });

    if(existingCategory)
    {
        if(existingCategory.name === data.name)
        {
            throw new AppError("Category name already exists", 409);
        }
        if(existingCategory.slug === data.slug)
        {
            throw new AppError("Category slug already exists", 409);
        }
    }

    return prisma.category.create({
        data:{
            name: data.name,
            slug: data.slug,
            description: data.description,
        },
    });
};

export const getCategories = async () => {
    return prisma.category.findMany({
        orderBy: {
            createdAt: "desc"
        }
    })
}


export const getCategoryById = async (
    categoryId: number
) => {
    const category = await prisma.category.findUnique({
        where: {
            id: categoryId
        },
    });
    if(!category)
    {
        throw new AppError("Category not found", 404);
    }
    return category;
};

export const updateCategory = async(
    categoryId: number,
    data: {
        name?: string;
        slug?: string;
        description?: string;
    }
) => {
    const existingCategory = await prisma.category.findUnique({
        where: {
            id: categoryId,
        },
    });

    if(!existingCategory) 
    {
        throw new AppError("Category not found", 404);
    }

    if(data.name !== undefined){
        const nameExists = await prisma.category.findFirst({
            where: {
                name: data.name,
                NOT : {
                    id: categoryId,
                },
            }
        });

        if(nameExists)
        {
            throw new AppError("Category name already exists", 409);
        }
    } 

    if( data.slug !== undefined && data.slug !== existingCategory.slug )
        {
        const slugExits = await prisma.category.findUnique({
            where: {
                slug: data.slug
            },
        });

        if(slugExits)
        {
            throw new AppError("Category slug already exists", 409);
        }
    }

    return prisma.category.update({
        where: {
            id: categoryId,
        },
        data: {
            ...(data.name !== undefined && {
                name: data.name,
            }),
            ...(data.slug !== undefined && {
                slug: data.slug,
            }),
            ...(data.description !== undefined && {
                description: data.description
            }),
            
        },
    });
};

export const deleteCategory = async (
    categoryId: number
) => {
    const existingCategory = await prisma.category.findUnique({
        where: {
            id: categoryId,
        },
        include: {
            products: true,
        },
    });

    if(!existingCategory)
    {
        throw new AppError("Category not found", 404);
    }

    if(existingCategory.products.length > 0)
    {
        throw new AppError("Cannot delete category because it has product", 409);
    }

      return prisma.category.delete({
        where: {
            id: categoryId,
        },
    });
};