"use client";

import AddressForm from "@/src/features/address/components/address.Form";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "@/src/features/address/services/address.service";


import type {
  Address,
  CreateAddressData,
} from "@/src/features/address/types/address";

import { useEffect, useState } from "react";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] =  useState<Address | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await getAddresses();

        setAddresses(data);
      } catch (error) {
        console.error("Fail to get addresses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleUpdateAddress = async (
    data: CreateAddressData
  ) => {
    if (!editingAddress) return;

    try {
      const updatedAddress = await updateAddress(
        editingAddress.id,
        data
      );

      setAddresses((prev) =>
        prev.map((address) =>
          address.id === updatedAddress.id
            ? updatedAddress
            : address
        )
      );

      setEditingAddress(null);
    } catch (error) {
      console.error("Failed to update address:", error);
    }
  };

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  const handleDeleteAddress = async (addressId: number) => {
    try{
      await deleteAddress(addressId);

      setAddresses((prev) => 
      prev.filter((addresses) => addresses.id !== addressId)
      );
    }catch(error){
      console.error("Failed to delete address", error)
    }
  };

  const handleCreateAddress = async (
    data: CreateAddressData
  ) => {
    try{
      const newAddresses = await createAddress(data);

      setAddresses((prev) =>[
        ...prev,
        newAddresses
      ]);
      setIsCreating(false);
    }catch(error){
      console.error("Failed to create address ", error)
    }
  };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold">
        My Addresses
      </h1>
          <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="mt-4 rounded bg-black px-4 py-2 text-white"
            >
              + Add Address
        </button>
      {addresses.length === 0 ? (
        <p className="mt-6">
          You have no saved addresses.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded border p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">
                  {address.fullName}
                </h2>

                {address.isDefault && (
                  <span className="rounded border px-3 py-1 text-sm">
                    Default
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-1">
                <p>Phone: {address.phone}</p>

                <p>Address: {address.address}</p>

                <p>City: {address.city}</p>

                <p>District: {address.district}</p>

                {address.postalCode && (
                  <p>
                    Postal Code: {address.postalCode}
                  </p>
                )}
              </div>

             <div className="mt-4 flex gap-2">

                <button
                    type="button"
                    onClick={() => setEditingAddress(address)}
                    className="rounded border px-4 py-2"
                  >
                    Edit
                </button>

                <button
                    type="button"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="rounded bg-red-500 px-4 py-2 text-white"
                  >
                    Delete
                </button>
          </div>
            </div>
          ))}
        </div>
      )}

      {editingAddress && (
        <AddressForm
          initialData={{
            fullName: editingAddress.fullName,
            phone: editingAddress.phone,
            address: editingAddress.address,
            city: editingAddress.city,
            district: editingAddress.district,
            postalCode:
              editingAddress.postalCode ?? undefined,
            isDefault: editingAddress.isDefault,
          }}
          onSubmit={handleUpdateAddress}
          buttonText="Update Address"
        />
      )}

          {isCreating && (
            <AddressForm
              onSubmit={handleCreateAddress}
              buttonText="Save Address"
            />
          )}
    </main>
  );
}