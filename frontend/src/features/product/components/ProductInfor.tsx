"use client";
import { addCartItem } from "@/src/features/cart/services/cart.service";
import { useState } from "react";


type ProductInforProps = {
    productId: number;
    name: string,
    price: string,
    salePrice: string | null;
    stock: number;
    brandName: string;
    categoryName: string;
    description: string;
};



export default function ProductInfor({
    productId,
    name,
    price,
    salePrice,
    stock,
    brandName,
    categoryName,
    description
}: ProductInforProps) {
    
     const formattedPrice = Number(price).toLocaleString("vi-VN");

     const formattedSalePrice = salePrice

        ? Number(salePrice).toLocaleString("vi-VN")
        : null;

    const [quantity, setQuantity] = useState(1)

    const handleAddToCart = async () => {
      await addCartItem(productId, quantity)
    }

         return (
    <div>
      <h1 className="text-3xl font-bold">
        {name}
      </h1>

      <p className="mt-2 text-gray-500">
        {brandName}
      </p>

      <p className="mt-1 text-gray-500">
        {categoryName}
      </p>

      <div className="mt-6">
        {formattedSalePrice ? (
          <>
            <p className="text-2xl font-bold">
              {formattedSalePrice} VND
            </p>

            <p className="mt-1 text-gray-500 line-through">
              {formattedPrice} VND
            </p>
          </>
        ) : (
          <p className="text-2xl font-bold">
            {formattedPrice} VND
          </p>
        )}
      </div>

      <p className="mt-4">
        Stock: {stock}
      </p>

      <div className="mt-8">
        <h2 className="mb-2 font-semibold">
          Description
        </h2>

        <p className="text-gray-600">
          {description}
        </p>
      </div>

        <div className="mt-8">
            <p className="mb-2 font-semibold">
              Quantity
            </p>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
                className="h-10 w-10 border"
              >
                -
              </button>

              <span className="flex h-10 w-12 items-center justify-center border-y">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.min(stock, current + 1))
                }
                className="h-10 w-10 border"
              >
                +
              </button>
            </div>
          </div>

      <button
        onClick={handleAddToCart}
        type="button"
        className="mt-8 rounded-lg bg-black px-6 py-3 text-white"
      >
        Thêm vào giỏ hàng
      </button>
    </div>
  );
}


