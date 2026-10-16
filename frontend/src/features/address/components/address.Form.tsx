
"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { CreateAddressData } from "@/src/features/address/types/address";

type AddressFormProps = {
  initialData?: CreateAddressData;
  onSubmit: (data: CreateAddressData) => void | Promise<void>;
  buttonText?: string;
};

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

const labelClassName =
  "mb-1.5 block text-sm font-medium text-slate-700";

export default function AddressForm({
  initialData,
  onSubmit,
  buttonText = "Save Address",
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form values when the selected address changes.
  useEffect(() => {
    setFullName(initialData?.fullName ?? "");
    setPhone(initialData?.phone ?? "");
    setAddress(initialData?.address ?? "");
    setCity(initialData?.city ?? "");
    setDistrict(initialData?.district ?? "");
    setPostalCode(initialData?.postalCode ?? "");
    setIsDefault(initialData?.isDefault ?? false);
  }, [
    initialData?.fullName,
    initialData?.phone,
    initialData?.address,
    initialData?.city,
    initialData?.district,
    initialData?.postalCode,
    initialData?.isDefault,
  ]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await onSubmit({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        district: district.trim(),
        postalCode: postalCode.trim() || undefined,
        isDefault,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Recipient Information */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-slate-800">
          Recipient Information
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="address-full-name"
              className={labelClassName}
            >
              Full Name
            </label>

            <input
              id="address-full-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter recipient's full name"
              className={inputClassName}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="address-phone"
              className={labelClassName}
            >
              Phone Number
            </label>

            <input
              id="address-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter phone number"
              className={inputClassName}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">
          Address Information
        </h3>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="address-street"
              className={labelClassName}
            >
              Street Address
            </label>

            <input
              id="address-street"
              type="text"
              autoComplete="street-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="House number, street name, etc."
              className={inputClassName}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="address-city"
                className={labelClassName}
              >
                City
              </label>

              <input
                id="address-city"
                type="text"
                autoComplete="address-level2"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Enter city"
                className={inputClassName}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="address-district"
                className={labelClassName}
              >
                District
              </label>

              <input
                id="address-district"
                type="text"
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                placeholder="Enter district"
                className={inputClassName}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="sm:max-w-[calc(50%-0.625rem)]">
            <label
              htmlFor="address-postal-code"
              className={labelClassName}
            >
              Postal Code
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <input
              id="address-postal-code"
              type="text"
              autoComplete="postal-code"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              placeholder="Enter postal code"
              className={inputClassName}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Default Address */}
      <div className="border-t border-slate-100 pt-5">
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(event) => setIsDefault(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-blue-600"
            disabled={isSubmitting}
          />

          <span>
            <span className="block text-sm font-medium text-slate-800">
              Set as default address
            </span>

            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Use this address as your default delivery address.
            </span>
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end border-t border-slate-100 pt-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting && (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          )}

          {isSubmitting ? "Saving..." : buttonText}
        </button>
      </div>
    </form>
  );
}
