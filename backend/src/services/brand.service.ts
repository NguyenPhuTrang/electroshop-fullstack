import { prisma } from "../config/prisma"

export const createBrand = async (
    data : {
        name: string,
        slug: string,
        description? : string,
        logo?: string
    }
) => {
    const existingBrand = await prisma.brand.findFirst({
        where: {
            OR:[
                {
                    name: data.name,
                },
                {
                    slug: data.slug
                },
            ],
        },
    });
    if(existingBrand)
    {
        if(existingBrand.name === data.name)
        {
            throw new Error("Brand name already exists");
        }
        
        if(existingBrand.slug === data.slug)
        {
            throw new Error("Brand slug already exists");
        }
    }

    return prisma.brand.create({
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            logo: data.logo
        },
    });
};

export const getBrands = async () =>{
    return prisma.brand.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getBrandById = async(
    brandId : number
) => {
    return prisma.brand.findUnique({
        where: {
            id: brandId
        },
    });
};

export const updateBrand = async (
    brandId : number,
    data: {
        name? : string;
        slug? : string;
        description?: string;
        logo?: string;
    }
) => {
    const existingBrand = await prisma.brand.findUnique({
        where: {
            id: brandId,
        }
    })
    if(!existingBrand)
    {
        throw new Error("Brand not found")
    }

    if (data.name !== undefined) {
        const nameExists = await prisma.brand.findFirst({
            where: {
                name: data.name,
                NOT: {
                    id: brandId,
                },
            },
        });

        if(nameExists)
        {
           throw new Error("Brand name already exists");
        }
    }

     if (data.slug !== undefined) {
        const slugExists = await prisma.brand.findFirst({
            where: {
                slug: data.slug,
                NOT: {
                    id: brandId,
                },
            },
        });

        if (slugExists) {
            throw new Error("Brand slug already exists");
        }
    }

    return prisma.brand.update({
        where: {
            id: brandId,
        },
        data: {
            ...(data.name !== undefined && {
                name: data.name
            }),
            ...(data.slug !== undefined && {
                slug: data.slug
            }),
            ...(data.description !== undefined && {
                description: data.description
            })
        },
    });
    
};

export const deleteBrand = async (
    brandId : number
) => {
    const existingBrand = await prisma.brand.findUnique({
      where: {
        id: brandId
      },
      include: {
        products: true
      }  
    });

    if(!existingBrand){
        throw new Error("Brand not found")
    }

    if(existingBrand.products.length > 0)
    {
        throw new Error("Can not delete brand because it has product")
    }

    return prisma.brand.delete({
        where: {
            id : brandId
        }
    });
};
