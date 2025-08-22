// src/module/cart/CartItemCard.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartItemCard({ item, onUpdateQuantity, onRemoveItem, disabled }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const product = item.product;
  
  // คำนวณราคา
  let itemPrice = Number(product.price);
  let originalPrice = itemPrice;
  let hasPromotion = false;
  let discountPercent = 0;

  if (product.promotions?.length > 0) {
    const promo = product.promotions[0];
    discountPercent = Number(promo.discountPercent);
    itemPrice = itemPrice * (1 - discountPercent / 100);
    hasPromotion = true;
  }

  const totalPrice = itemPrice * item.quantity;
  const originalTotal = originalPrice * item.quantity;

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity === item.quantity || disabled) return;
    
    setIsUpdating(true);
    await onUpdateQuantity(item.id, newQuantity);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    if (disabled) return;
    setIsUpdating(true);
    await onRemoveItem(item.id);
    setIsUpdating(false);
  };

  const goToProduct = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex gap-4">
        {/* Product Image */}
        <div 
          className="w-20 h-20 bg-center bg-cover rounded-lg cursor-pointer flex-shrink-0"
          style={{ 
            backgroundImage: product.galleries?.[0]?.imageUrl 
              ? `url(${product.galleries[0].imageUrl})` 
              : product.imageUrl 
              ? `url(${product.imageUrl})` 
              : undefined,
            backgroundColor: '#f4f2f0'
          }}
          onClick={goToProduct}
        >
          {!product.galleries?.[0]?.imageUrl && !product.imageUrl && (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 
                className="text-[#181411] font-medium text-base cursor-pointer hover:text-[#eb9947] transition-colors truncate"
                onClick={goToProduct}
              >
                {product.name}
              </h3>
              
              {product.category && (
                <p className="text-[#887563] text-sm mt-1">
                  {product.category.name}
                </p>
              )}

              {/* Price */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[#181411] font-bold text-lg">
                  {itemPrice.toLocaleString()} ฿
                </span>
                {hasPromotion && (
                  <>
                    <span className="text-gray-500 text-sm line-through">
                      {originalPrice.toLocaleString()} ฿
                    </span>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Warning */}
              {product.stock < 10 && (
                <p className="text-red-600 text-sm mt-1">
                  เหลือเพียง {product.stock} ชิ้น
                </p>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={disabled || isUpdating}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              aria-label="ลบสินค้า"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/>
              </svg>
            </button>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1 || disabled || isUpdating}
              >
                -
              </button>
              <span className="px-4 py-2 min-w-[50px] text-center border-x border-gray-300">
                {isUpdating ? "..." : item.quantity}
              </span>
              <button
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= product.stock || disabled || isUpdating}
              >
                +
              </button>
            </div>

            {/* Total Price */}
            <div className="text-right">
              <div className="text-[#181411] font-bold text-lg">
                {totalPrice.toLocaleString()} ฿
              </div>
              {hasPromotion && (
                <div className="text-gray-500 text-sm line-through">
                  {originalTotal.toLocaleString()} ฿
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}