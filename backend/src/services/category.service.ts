import { prisma } from "../config/prisma";

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
            throw new Error("Category name already exists");
        }
        if(existingCategory.name === data.slug)
        {
            throw new Error("Category slug already exists");
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
    return prisma.category.findUnique({
        where: {
            id: categoryId
        },
    });
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
        throw new Error("Category not found");
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
            throw new Error("Category name already exists");
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
            throw new Error("Category slug already exists")
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
        throw new Error("Category not found");
    }

    if(existingCategory.products.length > 0)
    {
        throw new Error("Cannot delete category because it has product");
    }

      return prisma.category.delete({
        where: {
            id: categoryId,
        },
    });
};