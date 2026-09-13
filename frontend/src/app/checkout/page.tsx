"use client";

import { createOrder } from "@/src/features/order/services/order.service";
import { PaymentMethod } from "@/src/features/order/types/order";
import { useRouter } from "next/navigation";
import { useState } from "react"

export default function CheckoutPage() {
    const [shippingName, setShippingName] = useState("");
    const [shippingPhone, setShippingPhone] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [shippingCity, setShippingCity] = useState("");
    const [shippingDistrict, setShippingDistrict] = useState("");
    const [note, setNote] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

    const handleCreateOrder = async () => {
        try{
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

            router.push(`/orders/${result.id}`);

            
        } catch(error){
            console.error("Failed to create order :", error)
        }
    };

    const router = useRouter();

    return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold">
        Checkout
      </h1>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block">
            Shipping Name
          </label>

          <input
            type="text"
            value={shippingName}
            onChange={(e) => setShippingName(e.target.value)}
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
            onChange={(e) => setShippingPhone(e.target.value)}
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
            onChange={(e) => setShippingAddress(e.target.value)}
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
            onChange={(e) => setShippingCity(e.target.value)}
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
            onChange={(e) => setShippingDistrict(e.target.value)}
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block">
            Note
          </label>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded border p-2"
          />
        </div>

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
                onChange={() => setPaymentMethod("COD")}
              />
              <span className="ml-2">COD</span>
            </label>

            <label className="block">
              <input
                type="radio"
                value="BANK_TRANSFER"
                checked={paymentMethod === "BANK_TRANSFER"}
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
                checked={paymentMethod === "CREDIT_CARD"}
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
          className="w-full rounded bg-black px-6 py-3 text-white"
        >
          Đặt hàng
        </button>
      </div>
    </main>
  );
}
 
