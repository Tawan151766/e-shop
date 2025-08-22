// src/module/product/ProductDetail.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductGallery from "@/module/product/ProductGallery";
import ProductDetailsBox from "@/module/product/ProductDetailsBox";
import AddToCartButton from "@/module/product/AddToCartButton";
import ProductImage from "@/module/product/ProductImage";
import ProductHeader from "./ProductHeader";

export default function ProductDetail({ product }) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <div className="text-red-600 font-medium">ไม่พบสินค้า</div>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ย้อนกลับ
          </button>
        </div>
      </div>
    );
  }

  const mainImageUrl = selectedImage || 
                      product.galleries?.[0]?.imageUrl || 
                      product.imageUrl || 
                      "/public/no-image.png";

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description || "ดูสินค้านี้ใน E-Shop",
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("คัดลอก URL สินค้าเรียบร้อยแล้ว");
      }
    } catch (error) {
      console.error("Share error:", error);
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("คัดลอก URL สินค้าเรียบร้อยแล้ว");
      } catch (clipboardError) {
        console.error("Clipboard error:", clipboardError);
        alert("ไม่สามารถแชร์ได้ กรุณาลองใหม่");
      }
    }
  };

  // Calculate discounted price if promotion exists
  const getDiscountedPrice = () => {
    if (!product.promotions?.length) return null;
    
    const activePromo = product.promotions.find(promo => {
      const now = new Date();
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      return promo.isActive && now >= startDate && now <= endDate;
    });

    if (!activePromo) return null;

    const discount = Number(activePromo.discountPercent);
    const originalPrice = Number(product.price);
    const discountedPrice = originalPrice * (1 - discount / 100);
    
    return {
      original: originalPrice,
      discounted: discountedPrice,
      percent: discount
    };
  };

  const priceInfo = getDiscountedPrice();

  return (
    <div
      className="relative flex min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: "Work Sans, Noto Sans, sans-serif" }}
    >
      <div>
        <ProductHeader
          onBack={() => router.back()}
          onShare={handleShare}
        />
        
        {/* Main Product Image */}
        <div className="flex w-full grow bg-white @container p-4">
          <div className="w-full gap-1 overflow-hidden bg-white @[480px]:gap-2 aspect-[2/3] rounded-lg flex">
            <ProductImage
              src={mainImageUrl}
              alt={product.name}
            />
          </div>
        </div>
        
        {/* Product Title and Price */}
        <div className="px-4">
          <h1 className="text-[#181411] text-[22px] font-bold leading-tight tracking-[-0.015em] text-left pb-2 pt-5">
            {product.name}
          </h1>
          
          {/* Price Display */}
          <div className="flex items-center gap-3 mb-3">
            {priceInfo ? (
              <>
                <span className="text-[#eb9947] text-xl font-bold">
                  {priceInfo.discounted.toLocaleString()} ฿
                </span>
                <span className="text-gray-500 text-lg line-through">
                  {priceInfo.original.toLocaleString()} ฿
                </span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                  -{priceInfo.percent}%
                </span>
              </>
            ) : (
              <span className="text-[#181411] text-xl font-bold">
                {Number(product.price).toLocaleString()} ฿
              </span>
            )}
          </div>
          
          <p className="text-[#181411] text-base font-normal leading-normal pb-3">
            {product.description}
          </p>
        </div>

        <ProductGallery 
          galleries={product.galleries} 
          onImageSelect={setSelectedImage}
        />
        <ProductDetailsBox product={product} />
      </div>

      {/* Bottom Action Area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="px-4 py-3">
          <AddToCartButton 
            product={product}
            onClick={() => {
              // Optional: Refresh cart count or show success message
            }}
          />
        </div>
      </div>
    </div>
  );
}