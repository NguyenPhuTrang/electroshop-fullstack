"use client";

import { useState } from "react";
import type { CreateAddressData } from "@/src/features/address/types/address";

type AddressFormProps = {
  initialData?: CreateAddressData;
  onSubmit: (data: CreateAddressData) => void;
  buttonText?: string;
};

export default function AddressForm({
  initialData,
  onSubmit,
  buttonText = "Save Address"
}: AddressFormProps) {

  const [fullName, setFullName] = useState(
    initialData?.fullName ?? ""
  );

  const [phone, setPhone] = useState(
    initialData?.phone ?? ""
  );

  const [address, setAddress] = useState(
    initialData?.address ?? ""
  );

  const [city, setCity] = useState(
    initialData?.city ?? ""
  );

  const [district, setDistrict] = useState(
    initialData?.district ?? ""
  );

  const [postalCode, setPostalCode] = useState(
    initialData?.postalCode ?? ""
  );

  const [isDefault, setIsDefault] = useState(
    initialData?.isDefault ?? false
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      fullName,
      phone,
      address,
      city,
      district,
      postalCode: postalCode || undefined,
      isDefault,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-4 rounded border p-6"
    >
      <div>
        <label className="mb-1 block">
          Full Name
        </label>

        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block">
          Phone
        </label>

        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block">
          Address
        </label>

        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block">
          City
        </label>

        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block">
          District
        </label>

        <input
          type="text"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block">
          Postal Code
        </label>

        <input
          type="text"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />

        Set as default
      </label>

        <button
          type="submit"
          className="rounded bg-black px-5 py-2 text-white"
        >
          {buttonText}
    </button>
    </form>
  );
}