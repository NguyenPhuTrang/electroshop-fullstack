import { prisma } from "../config/prisma"
import { AppError } from "../utils/AppError"

type CreateProductSpecificationInput = {
    productId : number,
    groupName? : string | null,
    label: string,
    value: string,
    sortOrder?: number
}

type UpdateProductSpecificationInput = {
    groupName?: string | null;
    label?: string;
    value?: string;
    sortOrder?: number;
};

export const getProductSpecifications = async (productId : number) => {
    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },
        select: {
            id: true
        }
    });

    if(!product)
    {
        throw new AppError("Product not found", 404);
    }

    return prisma.productSpecification.findMany({
        where: {
            productId
        },
        orderBy: [
            {
                sortOrder: "asc"
            },
            {
                id: "asc"
            }
        ]
    })
};

export const getProductSpecificationById = async (id: number) => {
    const specification = await prisma.productSpecification.findUnique({
        where: {
            id,
        },
    });

    if(!specification){
        throw new AppError("Product speccification not found", 404);
    }

    return specification;
};

export const createProductSpecification = async (
    data: CreateProductSpecificationInput
) => {
    const product = await prisma.product.findUnique({
        where: {
            id: data.productId,
        },
        select: {
            id: true,
        },
    });

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return prisma.productSpecification.create({
        data: {
            productId: data.productId,
            groupName: data.groupName,
            label: data.label,
            value: data.value,
            sortOrder: data.sortOrder ?? 0,
        },
    });
};

export const updateProductSpecification = async (
    id: number,
    data: UpdateProductSpecificationInput
) => {
    const existingSpecification =
        await prisma.productSpecification.findUnique({
            where: {
                id,
            },
        });

    if (!existingSpecification) {
        throw new AppError("Product specification not found", 404);
    }

    return prisma.productSpecification.update({
        where: {
            id,
        },
        data,
    });
};

export const deleteProductSpecification = async (id: number) => {
    const existingSpecification =
        await prisma.productSpecification.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });

    if (!existingSpecification) {
        throw new AppError("Product specification not found", 404);
    }

    return prisma.productSpecification.delete({
        where: {
            id,
        },
    });
};

// Create multiple specifications for a product
type BulkSpecificationItem = {
    groupName?: string | null;
    label: string;
    value: string;
    sortOrder?: number;
};

type CreateBulkProductSpecificationsInput = {
    productId: number;
    specifications: BulkSpecificationItem[];
};

export const createBulkProductSpecifications = async (  // có thể thêm nhiều thông số kỹ thuật cho cùng một sản phẩm trong một lần gọi API.
    data: CreateBulkProductSpecificationsInput
) => {
    const product = await prisma.product.findUnique({
        where: { id: data.productId },
        select: { id: true },
    });

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    const result = await prisma.productSpecification.createMany({
        data: data.specifications.map((specification) => ({
            productId: data.productId,
            groupName: specification.groupName ?? null,
            label: specification.label,
            value: specification.value,
            sortOrder: specification.sortOrder ?? 0,
        })),
    });

    return {
        productId: data.productId,
        createdCount: result.count,
    };
};

type ReplaceProductSpecificationInput = {
    groupName?: string | null; // groupName là tên nhóm dùng để gom các thông số có liên quan với nhau.
    label: string;
    value: string;
    sortOrder?: number;
};

export const replaceProductSpecifications = async (
    productId: number,
    specifications: ReplaceProductSpecificationInput[]
) => {
    return prisma.$transaction(async (tx) => { // transaction giúp gom nhiều thao tác Database thành một nhóm đảm bảo tính nhất quán
        const product = await tx.product.findUnique({  // tx là đối tượng dùng để thực hiện các thao tác đó bên trong nhóm nếu một trong số tx lỗi thì transaction rollback
            where: { id: productId },
            select: { id: true },
        });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        await tx.productSpecification.deleteMany({
            where: { productId },
        });

        if (specifications.length > 0) { // thêm nhiều mảng thông số kỹ thuật vào Database cùng một lúc
            await tx.productSpecification.createMany({
                data: specifications.map((specification) => ({
                    productId,
                    groupName: specification.groupName ?? null,
                    label: specification.label,
                    value: specification.value,
                    sortOrder: specification.sortOrder ?? 0,
                })),
            });
        }

        return tx.productSpecification.findMany({ // ấy lại toàn bộ thông số kỹ thuật của sản phẩm vừa cập nhật và trả kết quả về cho nơi gọi Service
            where: { productId },
            orderBy: [
                { sortOrder: "asc" },
                { id: "asc" },
            ],
        });
    });
};