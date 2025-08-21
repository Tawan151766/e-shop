
"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function ProductGrid({ products }) {
  const router = useRouter();
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
      {products.length === 0 && (
        <div className="col-span-full text-center text-[#b8a99a] py-8">ไม่พบสินค้าในหมวดนี้</div>
      )}
      {products.map((p) => (
        <div
          key={p.id}
          className="flex flex-col gap-3 pb-3 cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push(`/product/${p.id}`)}
        >
          <div
            className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-lg flex items-center justify-center overflow-hidden"
            style={{ backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : undefined, backgroundColor: '#f4f2f0' }}
          >
            {!p.imageUrl && (
              <span className="text-[#b8a99a] text-xs md:text-sm font-medium select-none">No Image</span>
            )}
          </div>
          <div>
            <p className="text-[#181411] text-base font-medium leading-normal">{p.name}</p>
            <p className="text-[#887563] text-sm font-normal leading-normal">{Number(p.price).toLocaleString()} ฿</p>
          </div>
        </div>
      ))}
    </div>
  );
}
