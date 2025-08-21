"use client";
import React from "react";

export default function HeroBanner({ products = [] }) {
  if (!products.length) return null;
  // แสดงเฉพาะสินค้าตัวแรกที่มีโปรโมชัน (หรือจะวน loop ก็ได้)
  const product = products[0];
  const discount = product?.promotion?.discountPercent;
  return (
    <div className="p-4 @container">
      <div className="flex flex-col items-stretch justify-start rounded-lg @xl:flex-row @xl:items-start">
        <div
          className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
          style={{
            backgroundImage: `url(${product.imageUrl || "/public/no-image.png"})`,
          }}
        ></div>
        <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 py-4 @xl:px-4">
          <p className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em]">
            {product.name}
          </p>
          <div className="flex items-end gap-3 justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-[#887563] text-base font-normal leading-normal">
                {product.description || "Limited time offer"}
              </p>
              <p className="text-[#887563] text-base font-normal leading-normal">
                {discount ? `${discount}% off` : null}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
