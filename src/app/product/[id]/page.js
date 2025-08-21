"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import LoadingSpinner from "@/module/shop/LoadingSpinner";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data.product))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="p-6 text-red-600">ไม่พบสินค้า</div>;

  // ฟอนต์ google fonts (Work Sans, Noto Sans) จะถูกโหลดใน layout/app แล้ว
  return (
    <div
      className="relative flex min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Work Sans, Noto Sans, sans-serif' }}
    >
      <div>
        <div className="flex items-center bg-white p-4 pb-2 justify-between">
          <button
            className="text-[#181411] flex size-12 shrink-0 items-center"
            onClick={() => router.back()}
            aria-label="ย้อนกลับ"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </button>
          <div className="flex w-12 items-center justify-end">
            <button
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-[#181411] gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0"
              aria-label="แชร์"
            >
              <div className="text-[#181411]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M229.66,109.66l-48,48a8,8,0,0,1-11.32-11.32L204.69,112H165a88,88,0,0,0-85.23,66,8,8,0,0,1-15.5-4A103.94,103.94,0,0,1,165,96h39.71L170.34,61.66a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,229.66,109.66ZM192,208H40V88a8,8,0,0,0-16,0V208a16,16,0,0,0,16,16H192a8,8,0,0,0,0-16Z"></path>
                </svg>
              </div>
            </button>
          </div>
        </div>
        <div className="flex w-full grow bg-white @container p-4">
          <div className="w-full gap-1 overflow-hidden bg-white @[480px]:gap-2 aspect-[2/3] rounded-lg flex">
            {/* แสดงรูปหลักหรือ gallery */}
            <div
              className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1"
              style={{ backgroundImage: `url('${product.galleries?.[0]?.imageUrl || product.imageUrl || '/public/no-image.png'}')` }}
            ></div>
          </div>
        </div>
        <h1 className="text-[#181411] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
          {product.name}
        </h1>
        <p className="text-[#181411] text-base font-normal leading-normal pb-3 pt-1 px-4">
          {product.description}
        </p>
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
      </div>
      <div>
        <div className="flex px-4 py-3">
          <button
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-[#eb9947] text-[#181411] text-base font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Add to Cart</span>
          </button>
        </div>
        <div className="h-5 bg-white"></div>
      </div>
    </div>
  );
}
