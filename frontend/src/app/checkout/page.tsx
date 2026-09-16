"use client";

import { getAddresses } from "@/src/features/address/services/address.service";
import { Address } from "@/src/features/address/types/address";
import { getCart } from "@/src/features/cart/services/cart.service";
import { Cart } from "@/src/features/cart/types/cart";
import { createOrder } from "@/src/features/order/services/order.service";
import { PaymentMethod } from "@/src/features/order/types/order";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function CheckoutPage() {
    const [shippingName, setShippingName] = useState("");
    const [shippingPhone, setShippingPhone] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [shippingCity, setShippingCity] = useState("");
    const [shippingDistrict, setShippingDistrict] = useState("");
    const [note, setNote] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    const [cart, setCart] = useState<Cart | null>(null)

    const router = useRouter();

    const handleCreateOrder = async () => {
      
      if(isSubmitting) return;

      if(!selectedAddressId){
        console.error("Please sellect a shipping address");
        return;
      }

      if (
            !shippingName.trim() ||
            !shippingPhone.trim() ||
            !shippingAddress.trim() ||
            !shippingCity.trim() ||
            !shippingDistrict.trim()
          ) {
            console.error("Please complete shipping information");
            return;
          }
          
        try{
            setIsSubmitting(true);
            const result = await createOrder({
                shippingName,
                shippingPhone,
                shippingAddress,
                shippingCity,
                shippingDistrict,
                note,
                paymentMethod
            });
            
            console.log("Order data", result)

            router.push(`/orders/${result.order.id}`);

            
        } catch(error){
            console.error("Failed to create order :", error);
            setIsSubmitting(false)
        }
    };

    useEffect(() => {
      const fetchAddresses = async () => {
        try{
          const data = await getAddresses();

          setAddresses(data);

          const defaultAddress = data.find(
            (address) => address.isDefault
          );

          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setShippingName(defaultAddress.fullName);
            setShippingPhone(defaultAddress.phone);
            setShippingAddress(defaultAddress.address);
            setShippingCity(defaultAddress.city);
            setShippingDistrict(defaultAddress.district);

          }
        } catch(error){
          console.error("Failed to get address", error)
        }
      }
      fetchAddresses();
    },[])
    
    const handleSelectAddress = (address: Address) => {
      setSelectedAddressId(address.id);

      setShippingName(address.fullName);
      setShippingPhone(address.phone);
      setShippingAddress(address.address);
      setShippingCity(address.city);
      setShippingDistrict(address.district);
    };

    useEffect(() => {
      const fetchCart = async () => {
        try{
          const data = await getCart();
          setCart(data);
        } catch(error){
          console.error("Failed to get cart", error)
        }
      }
      fetchCart()
    }, [])

    if(!cart)
    {
      return <p>Loading cart...</p>
    }

return (
  <main className="mx-auto max-w-2xl p-6">
    <h1 className="text-3xl font-bold">
      Checkout
    </h1>

    {/* Order Summary */}
    <section className="mt-6 rounded border p-6">
      <h2 className="text-xl font-semibold">
        Order Summary
      </h2>

      <div className="mt-4 space-y-4">
        {cart.items.map((item) => {
          const price = Number(
            item.product.salePrice ?? item.product.price
          );

          const subtotal = price * item.quantity;

          return (
            <div
              key={item.id}
              className="flex justify-between border-b pb-4"
            >
              <div>
                <p className="font-semibold">
                  {item.product.name}
                </p>

                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>

              <p>
                {subtotal.toLocaleString("vi-VN")} VND
              </p>
            </div>
          );
        })}

        <div className="border-t pt-4 text-right">
          <p className="text-xl font-bold">
            Total:{" "}
            {cart.items
              .reduce((sum, item) => {
                const price = Number(
                  item.product.salePrice ?? item.product.price
                );

                return sum + price * item.quantity;
              }, 0)
              .toLocaleString("vi-VN")}{" "}
            VND
          </p>
        </div>
      </div>
    </section>

    {/* Shipping Address */}
    <section className="mt-6">
      <h2 className="text-xl font-semibold">
        Shipping Address
      </h2>

      {addresses.length === 0 ? (
        <div className="mt-4">
          <p className="text-gray-500">
            You have no saved addresses.
          </p>

          <button
            type="button"
            onClick={() => router.push("/addresses")}
            className="mt-3 rounded bg-black px-4 py-2 text-white"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {addresses.map((address) => (
            <label
              key={address.id}
              className="block cursor-pointer rounded border p-4"
            >
              <div className="flex gap-3">
                <input
                  type="radio"
                  name="shippingAddress"
                  checked={selectedAddressId === address.id}
                  onChange={() => handleSelectAddress(address)}
                />

                <div>
                  <p className="font-semibold">
                    {address.fullName}
                  </p>

                  <p className="mt-1">
                    Phone: {address.phone}
                  </p>

                  <p className="mt-1">
                    Address: {address.address}
                  </p>

                  <p className="mt-1">
                    {address.city} - {address.district}
                  </p>

                  {address.postalCode && (
                    <p className="mt-1">
                      Postal Code: {address.postalCode}
                    </p>
                  )}

                  {address.isDefault && (
                    <p className="mt-2 text-sm font-semibold">
                      Default
                    </p>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </section>

    {/* Shipping Information */}
    <section className="mt-6 space-y-4">
      <div>
        <label className="mb-1 block">
          Shipping Name
        </label>

        <input
          type="text"
          value={shippingName}
          onChange={(e) =>
            setShippingName(e.target.value)
          }
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block">
          Shipping Phone
        </label>

        <input
          type="text"
          value={shippingPhone}
          onChange={(e) =>
            setShippingPhone(e.target.value)
          }
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block">
          Shipping Address
        </label>

        <input
          type="text"
          value={shippingAddress}
          onChange={(e) =>
            setShippingAddress(e.target.value)
          }
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block">
          City
        </label>

        <input
          type="text"
          value={shippingCity}
          onChange={(e) =>
            setShippingCity(e.target.value)
          }
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block">
          District
        </label>

        <input
          type="text"
          value={shippingDistrict}
          onChange={(e) =>
            setShippingDistrict(e.target.value)
          }
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block">
          Note
        </label>

        <textarea
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
          className="w-full rounded border p-2"
        />
      </div>

      {/* Payment Method */}
      <div>
        <p className="mb-2 font-semibold">
          Payment Method
        </p>

        <div className="space-y-2">
          <label className="block">
            <input
              type="radio"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={() =>
                setPaymentMethod("COD")
              }
            />
            <span className="ml-2">COD</span>
          </label>

          <label className="block">
            <input
              type="radio"
              value="BANK_TRANSFER"
              checked={
                paymentMethod === "BANK_TRANSFER"
              }
              onChange={() =>
                setPaymentMethod("BANK_TRANSFER")
              }
            />
            <span className="ml-2">
              Bank Transfer
            </span>
          </label>

          <label className="block">
            <input
              type="radio"
              value="CREDIT_CARD"
              checked={
                paymentMethod === "CREDIT_CARD"
              }
              onChange={() =>
                setPaymentMethod("CREDIT_CARD")
              }
            />
            <span className="ml-2">
              Credit Card
            </span>
          </label>

          <label className="block">
            <input
              type="radio"
              value="VNPAY"
              checked={paymentMethod === "VNPAY"}
              onChange={() =>
                setPaymentMethod("VNPAY")
              }
            />
            <span className="ml-2">
              VNPAY
            </span>
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCreateOrder}
        disabled={isSubmitting}
        className="w-full rounded bg-black px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Đang đặt hàng..." : "Đặt hàng"}
      </button>
    </section>
  </main>
);
}
 
