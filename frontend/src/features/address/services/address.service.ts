import api from "@/src/lib/axios";
import type {
  Address,
  CreateAddressData,
  UpdateAddressData,
} from "../types/address";

export const getAddresses = async (): Promise<Address[]> => {
    const response = await api.get("/addresses");

    return response.data.data;
};

export const getAddressById = async (
    addressId: number
): Promise<Address> => {
    const response = await api.get(`/addresses/${addressId}`);

    return response.data.data;
} 

export const  createAddress = async (
    data: CreateAddressData
): Promise<Address> => {
    const respone = await api.post("/addresses", data);

    return respone.data.data
}

export const updateAddress = async (
    addressId: number,
    data: UpdateAddressData
): Promise<Address> => {
    const response = api.patch(`/addresses/${addressId}`, data);

    return (await response).data.data
}

export const deleteAddress = async (
    addressId: number
) => {
    const response = await api.delete(`/addresses/${addressId}`)

    return response.data;
}