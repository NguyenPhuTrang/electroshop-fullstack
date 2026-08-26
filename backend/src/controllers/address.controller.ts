import { Request, Response } from "express";
import {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
} from "../services/address.service";
import { createAddressSChema, updateAddressSchema } from "../validations/address.validation";
import { boolean, json, success } from "zod";



export const createAddressController = async (
    req: Request,
    res: Response
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
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to create address",
        });
    }   
};

export const getAddressController = async (
    req: Request,
    res: Response
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
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve addresses",
        });
    }
};

export const getAddressByIdController = async (
    req: Request,
    res: Response
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

        if(!address){
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Address retrieved successfully ",
            data: address
        });
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieved address"
        });
    }
};

export const updateAddressController = async (
    req: Request,
    res: Response
) => {
    try{
        const userId = req.user!.userId;
        const addressId = Number(req.params.id);
        
        if(!Number.isInteger(addressId) || addressId <=0)
        {
            return res.status(400).json({
                success: false,
                message: "Invalid address Id"
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
        console.error(error);
        if(
            error instanceof Error && error.message === "Address not found"
        )
        {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }
        return res.status(500).json({
            success:false,
            message: "Failed to update address",
        });
    }
};

export const deleteAddressController = async (
    req: Request,
    res: Response
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
        console.error(error);

        if (
            error instanceof Error &&
            error.message === "Address not found"
        ) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete address",
        });
    }
};
