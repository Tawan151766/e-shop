// src/module/product/ProductDetailsBox.js
"use client";
export default function ProductDetailsBox({ product }) {
  if (!product) return null;
  return (
    <>
      <h3 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Details</h3>
      <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5e0dc] py-5">
          <p className="text-[#887563] text-sm font-normal leading-normal">หมวดหมู่</p>
          <p className="text-[#181411] text-sm font-normal leading-normal">{product.category?.name || '-'}</p>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5e0dc] py-5">
          <p className="text-[#887563] text-sm font-normal leading-normal">ราคา</p>
          <p className="text-[#181411] text-sm font-normal leading-normal">{Number(product.price).toLocaleString()} ฿</p>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5e0dc] py-5">
          <p className="text-[#887563] text-sm font-normal leading-normal">สต็อก</p>
          <p className="text-[#181411] text-sm font-normal leading-normal">{product.stock}</p>
        </div>
        {product.promotions?.length > 0 && (
          <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5e0dc] py-5">
            <p className="text-[#887563] text-sm font-normal leading-normal">โปรโมชั่น</p>
            <p className="text-[#181411] text-sm font-normal leading-normal">
              {product.promotions.map((promo) => `${promo.discountPercent}% ถึง ${promo.endDate}`).join(", ")}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
