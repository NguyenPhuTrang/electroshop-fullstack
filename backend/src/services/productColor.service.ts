
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import type{
    CreateProductColorInput,
    UpdateProductColorInput
} from "../validations/productColor.validation";

const ensureProductExists = async (productId: number) => {
    const product = await prisma.product.findUnique({
        where: {
            id: productId
        },
        select: { // để chọn ra nhưng cột File muốn lấy ra từ database thay vì lấy toàn bộ
            id: true,
        }
    });

    if(!product){
        throw new AppError("Product not found", 404);
    }

    return product;
};

const ensureProductColorExists = async (
    productId: number,
    colorId: number
) => {
    const color = await prisma.productColor.findFirst({ // findFirst trả về bản ghi đầu tiên khớp, hoặc null nếu không có.
        where: {
            id: colorId,
            productId // điều kiện viết tắt của productId : productId
        }
    })

    if(!color){
        throw new AppError("Product color not found", 404);
    }

    return color;
};

export const getProductColors = async (
    productId: number
) => {
    await ensureProductExists(productId);

    return prisma.productColor.findMany({ // lấy nhiều bản ghi (trả về mảng, rỗng nếu không có).
        where: {
            productId, // chỉ lấy các màu thuộc sản phẩm có productId này.
        },
        orderBy: [
            {
                sortOrder: "asc" // Trước hết theo sortOrder tăng dần (số nhỏ đứng trước).
            },
            {
                name: "asc" // Nếu hai màu có sortOrder bằng nhau thì xếp tiếp theo name từ A → Z.
            }
        ]
    })
};

export const getProductColorById = async (
    productId: number,
    colorId: number
) => {
    return ensureProductColorExists(
        productId,
        colorId
    )
};

export const createProductColor = async (
    productId: number,
    data: CreateProductColorInput
) => {
    await ensureProductExists(productId);

    const existingColor = await prisma.productColor.findFirst({
        where: {
            productId,
            name: data.name,
        },
        select: {
            id: true,
        },
    });

    if (existingColor) {
        throw new AppError(
            "This color already exists for this product",
            409
        );
    }

    return prisma.productColor.create({
        data: {
            productId,
            name: data.name,
            hexCode: data.hexCode ?? null,
            sortOrder: data.sortOrder ?? 0,
        },
    });
};

export const updateProductColor = async (
    productId: number,
    colorId: number,
    data: UpdateProductColorInput
) => {
    const existingColor = await ensureProductColorExists(
        productId,
        colorId
    );

    if (
        data.name !== undefined &&
        data.name !== existingColor.name
    ) {
        const duplicateColor =
            await prisma.productColor.findFirst({
                where: {
                    productId,
                    name: data.name,
                    id: {
                        not: colorId,
                    },
                },
                select: {
                    id: true,
                },
            });

        if (duplicateColor) {
            throw new AppError(
                "This color already exists for this product",
                409
            );
        }
    }

    return prisma.productColor.update({
        where: {
            id: colorId,
        },
        data: {
            ...(data.name !== undefined && {
                name: data.name,
            }),
            ...(data.hexCode !== undefined && {
                hexCode: data.hexCode,
            }),
            ...(data.sortOrder !== undefined && {
                sortOrder: data.sortOrder,
            }),
        },
    });
};

export const deleteProductColor = async (
    productId: number,
    colorId: number
) => {
    const color = await prisma.productColor.findFirst({
        where: {
            id: colorId,
            productId,
        },
        include: {
            _count: {
                select: {
                    variants: true,
                    images: true,
                },
            },
        },
    });

    if (!color) {
        throw new AppError(
            "Product color not found",
            404
        );
    }

    if (
        color._count.variants > 0 ||
        color._count.images > 0
    ) {
        throw new AppError(
            "Cannot delete this color while product variants or images are assigned to it. Reassign them first.",
            409
        );
    }

    return prisma.productColor.delete({
        where: {
            id: colorId,
        },
    });
};