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
    <div className="flex flex-col gap-3">
      {/* Quantity Selector */}
      <div className="flex items-center justify-between">
        <span className="text-[#181411] font-medium">จำนวน:</span>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="px-4 py-2 min-w-[50px] text-center border-x border-gray-300">
            {quantity}
          </span>
          <button
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>
      </div>

      {/* Stock Info */}
      <div className="text-sm text-gray-600">
        {isOutOfStock ? (
          <span className="text-red-600 font-medium">สินค้าหมด</span>
        ) : (
          <span>เหลือ {product.stock} ชิ้น</span>
        )}
      </div>

      {/* Add to Cart Button */}
      <button
        className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 text-base font-bold leading-normal tracking-[0.015em] transition-colors ${
          isOutOfStock || isLoading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#eb9947] text-[#181411] hover:bg-[#d88a3f]"
        }`}
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
            `เพิ่มลงตะกร้า (${(Number(product.price) * quantity).toLocaleString()} ฿)`
          )}
        </span>
      </button>

      {/* Buy Now Button */}
      {!isOutOfStock && (
        <button
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-[#181411] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#2a2520] transition-colors"
          onClick={() => {
            // TODO: Implement buy now
            alert("ฟีเจอร์ซื้อเลย กำลังพัฒนา");
          }}
        >
          <span className="truncate">ซื้อเลย</span>
        </button>
      )}
    </div>
  );
}