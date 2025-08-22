// src/module/checkout/CheckoutItems.js
"use client";

export default function CheckoutItems({ items }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h2 className="text-[#181411] text-xl font-bold mb-6">
        รายการสินค้า ({items.length} รายการ)
      </h2>
      
      <div className="space-y-4">
        {items.map((item) => {
          const product = item.product;
          
          // Calculate price with promotion
          let itemPrice = product.price;
          let originalPrice = itemPrice;
          let hasPromotion = false;
          let discountPercent = 0;

          if (product.promotions?.length > 0) {
            const promo = product.promotions[0];
            discountPercent = promo.discountPercent;
            itemPrice = itemPrice * (1 - discountPercent / 100);
            hasPromotion = true;
          }

          const totalPrice = itemPrice * item.quantity;
          const originalTotal = originalPrice * item.quantity;

          return (
            <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Product Image */}
              <div 
                className="w-16 h-16 bg-center bg-cover rounded-lg flex-shrink-0"
                style={{ 
                  backgroundImage: product.galleries?.[0]?.imageUrl 
                    ? `url(${product.galleries[0].imageUrl})` 
                    : product.imageUrl 
                    ? `url(${product.imageUrl})` 
                    : undefined,
                  backgroundColor: '#f4f2f0'
                }}
              >
                {!product.galleries?.[0]?.imageUrl && !product.imageUrl && (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[#181411] truncate">
                  {product.name}
                </h3>
                
                {product.category && (
                  <p className="text-sm text-[#887563] mt-1">
                    {product.category.name}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#181411] font-medium">
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
                  
                  <span className="text-sm text-[#887563]">
                    จำนวน {item.quantity}
                  </span>
                </div>
              </div>

              {/* Total Price */}
              <div className="text-right">
                <div className="text-[#181411] font-bold">
                  {totalPrice.toLocaleString()} ฿
                </div>
                {hasPromotion && (
                  <div className="text-gray-500 text-sm line-through">
                    {originalTotal.toLocaleString()} ฿
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Cart Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => window.history.back()}
          className="text-[#eb9947] hover:underline text-sm font-medium"
        >
          แก้ไขรายการสินค้า
        </button>
      </div>
    </div>
  );
}