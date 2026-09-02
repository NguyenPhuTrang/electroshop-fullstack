import {prisma} from "../config/prisma";
import { AppError } from "../utils/AppError";

export const createAddress = async (
    userId: number,
    data: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        district: string;
        postalCode?: string;
        isDefault: boolean
    }
) => {
    const isDefault = data.isDefault ?? false

    if(isDefault)
    {
        await prisma.address.updateMany({
            where: {
                userId,
                isDefault: true,
            },
            data: {
                isDefault: false,
            },
        });
    }

    return prisma.address.create({
        data:{
            userId,
            fullName: data.fullName,
            phone: data.phone,
            address: data.address,
            city: data.city,
            district: data.district,
            postalCode: data.postalCode,
            isDefault,
        },
    });
};

export const getAddressById = async(
    userId: number,
    addressId: number
) => {
    return prisma.address.findFirst({
        where: {
            id: addressId,
            userId
        },
    });
};

export const getAddresses = async (
    userId: number
) => {
  const address = prisma.address.findMany({
        where: {
            userId,
        },
        orderBy: [
            {
                isDefault: "desc",
            },
            {
                createdAt: "desc"
            },
        ],
    });
      if (!address) {
        throw new AppError("Address not found", 404);
    }
    return address;
};

export const updateAddress = async (
    userId: number,
    addressId: number,
    data: {
        fullName?: string;
        phone?: string;
        address? : string;
        city?: string;
        district?: string;
        postalCode?: string;
        isDefault?: boolean
    } 
) => {
    const existingAddress = await prisma.address.findFirst({
        where: {
            id: addressId,
            userId,
        },
    });
    if(!existingAddress)
    {
        throw new AppError("Address not found",404);
    }
    if(data.isDefault === true)
    {
        await prisma.address.updateMany({
            where: {
                userId,
                isDefault: true,
                id: {
                    not: addressId,
                },
            },
            data: {
                isDefault: false
            }
        });
    
    }

    return prisma.address.update({
        where: {
            id: addressId,
        },
        data: {
            ...(data.fullName !== undefined && {
                fullName: data.fullName,
            }),
            ...(data.phone !== undefined && {
                phone: data.phone
            }),
            ...(data.address !== undefined && {
                address: data.address
            }),
            ...(data.city !== undefined && {
                city: data.city
            }),
            ...(data.district !== undefined && {
                district: data.district
            }),
            ...(data.postalCode !== undefined && {
                postalCode: data.postalCode
            }),
            ...(data.isDefault !== undefined && {
                isDefault: data.isDefault,
            }),
        },
    });
};

export const deleteAddress = async (
    userId: number,
    addressId: number
) => {
    const existingAddress = await prisma.address.findFirst({
        where:{
            id: addressId,
            userId,
        },
    });

    if(!existingAddress)
    {
        throw new AppError("Address not found",404);
    }

    return prisma.address.delete({
        where: {
            id: addressId,
        },
    });
};