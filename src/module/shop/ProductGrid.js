"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "antd";

export default function ProductGrid({ products }) {
  const router = useRouter();
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
      {products.length === 0 && (
        <div className="col-span-full text-center text-[#b8a99a] py-8">
          ไม่พบสินค้าในหมวดนี้
        </div>
      )}
      {products.map((p) => {
        const discount = p.promotions[0]?.discountPercent;
        const productCard = (
          <div
            className="bg-cover bg-center flex flex-col gap-3 rounded-lg justify-end p-4 aspect-square"
            style={{
              backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : undefined,
              backgroundColor: "#f4f2f0",
            }}
          >
            <p className="text-white text-base font-bold leading-tight w-4/5 line-clamp-2">
              {p.name}
            </p>
            <p className="text-white text-base leading-tight w-4/5 line-clamp-2">
              {Number(p.price).toLocaleString()} ฿
            </p>
          </div>
        );
        return discount ? (
          <Badge.Ribbon
            text={<span>{discount}% off</span>}
            key={p.id}
            color="red"
          >
            {productCard}
          </Badge.Ribbon>
        ) : (
          <React.Fragment key={p.id}>{productCard}</React.Fragment>
        );
      })}
    </div>
  );
}
