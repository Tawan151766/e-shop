// src/module/product/ProductGallery.js
"use client";
import { useState } from "react";

export default function ProductGallery({ galleries = [], onImageSelect }) {
  if (!galleries.length) return null;

  // แสดงทุกรูป
  const subImages = galleries.map(g => g.imageUrl);

  return (
    <div className="flex w-full grow bg-white @container p-4">
      <div className="w-full gap-1 overflow-hidden bg-white @[480px]:gap-2 aspect-[2/3] rounded-lg grid grid-cols-[1fr_1fr]" style={{gridAutoRows:'1fr'}}>
        {subImages.map((img, idx) => (
          <div
            key={idx}
            className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none cursor-pointer"
            style={{ backgroundImage: img ? `url('${img}')` : undefined }}
            onClick={() => onImageSelect && img && onImageSelect(img)}
          ></div>
        ))}
        {/* เติม div เปล่าให้ grid สมบูรณ์ถ้าจำนวนรูปไม่ลงตัวกับ 2 คอลัมน์ */}
        {Array.from({ length: (2 - (subImages.length % 2)) % 2 }).map((_, idx) => (
          <div key={`empty-${idx}`}></div>
        ))}
      </div>
    </div>
  );
}