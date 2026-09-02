import { Request, Response, NextFunction } from "express";
import {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
} from "../services/address.service";
import { createAddressSChema, updateAddressSchema } from "../validations/address.validation";



export const createAddressController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
    const userId = req.user!.userId;

    const validation = createAddressSChema.safeParse(req.body);

    if(!validation.success)
    {
        return res.status(400).json({
            success: false,
            message:"Invalid address data",
            errors: validation.error.issues
        });
    }

    const address = await createAddress(
        userId,
        validation.data
    );

    return res.status(201).json({
        success: true,
        message: "Address create successfully",
        data: address
    });

    }catch(error){
        next(error);
    }   
};

export const getAddressController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try{
        const userId = req.user!.userId;
        const addresses = await getAddresses(userId)

        return res.status(200).json({
            success: true,
            message: "Addresses retrieved successfully",
            data: addresses,
        });
    } catch(error){
        next(error);
    }
};

export const getAddressByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try{
        const userId = req.user!.userId;
        const addressId = Number(req.params.id);

        if(!Number.isInteger(addressId) || addressId <= 0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID",
            });
        }

        const address = await getAddressById(
            userId,
            addressId
        );
        
        return res.status(200).json({
            success: true,
            message: "Address retrieved successfully ",
            data: address
        });
    } catch(error) {
        next(error);
    }
};

export const updateAddressController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try{
        const userId = req.user!.userId;
        const addressId = Number(req.params.id);
        
        if(!Number.isInteger(addressId) || addressId <=0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid address data"
            });
        }

        const validation = updateAddressSchema.safeParse(
            req.body
        );
        
        if(!validation.success)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid Address Id",
                errors: validation.error.issues,
            });
        }

        const address = await updateAddress(
            userId,
            addressId,
            validation.data
        );
        
        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: address,
        });
    } catch (error){
        next(error);
    }
};

export const deleteAddressController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
        try {
        const userId = req.user!.userId;
        const addressId = Number(req.params.id);
        if(!Number.isInteger(addressId) || addressId <= 0)
            {
                return res.status(400).json({
                    success: false,
                    message: "Invalid address Id"
                });
            } 
            await deleteAddress(
                userId,
                addressId
            );
        return res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });
} catch (error) {
       next(error);
    }
};
