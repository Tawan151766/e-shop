// src/module/cart/CartItemList.js
"use client";
import CartItemCard from "./CartItemCard";

export default function CartItemList({ items, onUpdateQuantity, onRemoveItem, updating }) {
  return (
    <div className="space-y-4">
      <h2 className="text-[#181411] text-xl font-bold mb-4">Cart Items</h2>
      
      {items.map((item) => (
        <CartItemCard
          key={item.id}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          disabled={updating}
        />
      ))}
    </div>
  );
}