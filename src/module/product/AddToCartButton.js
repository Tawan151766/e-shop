// src/module/product/AddToCartButton.js
"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ product, onClick }) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=" + window.location.pathname);
      return;
    }

    if (product.stock < quantity) {
      alert("สินค้าไม่เพียงพอ");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (response.ok) {
        alert("เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว");
        if (onClick) onClick();
      } else {
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="flex flex-col w-full gap-4 bg-white ">
      {/* Quantity Selector */}
      <label className="flex flex-col min-w-40 flex-1">
        <p className="text-[#181411] text-base font-semibold pb-2">Quantity</p>
        <input
          type="number"
          min="1"
          placeholder="1"
          className="form-input w-full rounded-lg border border-[#e5e0dc] bg-white h-14 px-4 text-base text-[#181411] placeholder:text-[#b0a89f] focus:border-[#eb9947] focus:ring-2 focus:ring-[#eb9947]/30 transition-all duration-200"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          disabled={isLoading}
        />
      </label>

      {/* Add to Cart Button */}
      <button
        className="flex min-w-[120px] h-14 items-center justify-center rounded-lg bg-[#eb9947] text-white text-base font-bold px-6 shadow hover:bg-[#d97d23] transition-all duration-200"
        onClick={handleAddToCart}
        disabled={isOutOfStock || isLoading}
      >
        <span className="truncate">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              กำลังเพิ่ม...
            </div>
          ) : isOutOfStock ? (
            "สินค้าหมด"
          ) : (
            `เพิ่มลงตะกร้า (${(
              Number(product.price) * quantity
            ).toLocaleString()} ฿)`
          )}
        </span>
      </button>
    </div>
  );
}
