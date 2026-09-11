"use client";

import { useState } from "react";
import type { CartItem as CartItemType } from "@/src/features/cart/types/cart";
import { removeCartItem, updateCartItem } from "@/src/features/cart/services/cart.service";

type CartItemProps = {
  item: CartItemType;
  onRemove: (productId: number) => void;
};

export default function CartItem({ item, onRemove }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleIncrease = async () => {
    if (quantity >= item.product.stock) {
      return;
    }

    const newQuantity = quantity + 1;

    await updateCartItem(item.productId, newQuantity);

    setQuantity(newQuantity);
  };

  const handleDecrease = async () => {
    if (quantity <= 1) {
      return;
    }

    const newQuantity = quantity - 1;

    await updateCartItem(item.productId, newQuantity);

    setQuantity(newQuantity);
  };

  const handleRemove = async () => {
  await removeCartItem(item.productId);

  onRemove(item.productId);
};


  const price = Number(
    item.product.salePrice ?? item.product.price
  );
  
  const subtotal = price * quantity



  return (
    <div className="flex items-center justify-between border-b py-4">
      <div>
        <h2 className="font-semibold">
          {item.product.name}
        </h2>

        <p className="mt-1">
          Price: {Number(price).toLocaleString("vi-VN")} VND
        </p>

        <div className="mt-2 flex items-center">
          <button
            type="button"
            onClick={handleDecrease}
            className="h-8 w-8 border"
          >
            -
          </button>

          <span className="flex h-8 w-10 items-center justify-center border-y">
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrease}
            className="h-8 w-8 border"
          >
            +
          </button>
        </div>
        <button
            type="button"
            onClick={handleRemove}
            className="mt-2 text-red-500"
            >
            Remove
        </button>
      </div>
        <p className="mt-2 font-semibold">
            Subtotal: {subtotal.toLocaleString("vi-VN")} VND
        </p>
    </div>
  );
}