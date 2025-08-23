// src/module/product/ProductDetailsBox.js
"use client";
export default function ProductDetailsBox({ product }) {
  if (!product) return null;
  return (
    <>
      <h1 class="text-[#181411] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
        {product.name || "-"}
      </h1>
      <h1 class="text-[#181411] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
        {Number(product.price).toLocaleString()} ฿
      </h1>
      <p class="text-[#181411] text-base font-normal leading-normal pb-3 pt-1 px-4">
        {product.description || "-"}
      </p>
      <h3 class="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Details
      </h3>
      <div class="p-4 grid grid-cols-[20%_1fr] gap-x-6">
        <div class="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5e0dc] py-5">
          <p class="text-[#887563] text-sm font-normal leading-normal">Name</p>
          <p class="text-[#181411] text-sm font-normal leading-normal">
            {product.name || "-"}
          </p>
        </div>
      </div>
      <h3 class="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Product Information
      </h3>
      <div class="p-4 grid grid-cols-[20%_1fr] gap-x-6">
        <div class="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5e0dc] py-5">
          <p class="text-[#887563] text-sm font-normal leading-normal">
            Category
          </p>
          <p class="text-[#181411] text-sm font-normal leading-normal">
            {product.category?.name || "-"}
          </p>
        </div>
        <div class="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5e0dc] py-5">
          <p class="text-[#887563] text-sm font-normal leading-normal">Stock</p>
          <p class="text-[#181411] text-sm font-normal leading-normal">
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </p>
        </div>
        <div class="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5e0dc] py-5">
          <p class="text-[#887563] text-sm font-normal leading-normal">
            Promotion
          </p>
          <p class="text-[#181411] text-sm font-normal leading-normal">
            {product.promotions?.length > 0
              ? product.promotions
                  .map(
                    (promo) =>
                      `${promo.discountPercent}% off until ${promo.endDate}`
                  )
                  .join(", ")
              : "No Promotion"}
          </p>
        </div>
      </div>
    </>
  );
}
