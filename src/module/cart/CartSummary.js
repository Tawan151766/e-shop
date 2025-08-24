// src/module/cart/CartSummary.js
"use client";

export default function CartSummary({ summary, onCheckout, onContinueShopping }) {
  if (!summary) return null;

  const hasDiscount = summary.totalDiscount > 0;
  const shippingFee = summary.totalAmount >= 1000 ? 0 : 50; // Free shipping over 1000฿
  const finalTotal = summary.totalAmount + shippingFee;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 sticky top-20">
      <h2 className="text-[#181411] text-xl font-bold mb-4">Order Summary</h2>
      
      <div className="space-y-3">
        {/* Items Count */}
        <div className="flex justify-between text-sm">
          <span className="text-[#887563]">
            Items ({summary.totalItems})
          </span>
          <span className="text-[#181411]">
            {summary.originalAmount.toLocaleString()} ฿
          </span>
        </div>

        {/* Discount */}
        {hasDiscount && (
          <div className="flex justify-between text-sm">
            <span className="text-[#887563]">Discount</span>
            <span className="text-green-600">
              -{summary.totalDiscount.toLocaleString()} ฿
            </span>
          </div>
        )}

        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-[#887563]">Subtotal</span>
          <span className="text-[#181411]">
            {summary.totalAmount.toLocaleString()} ฿
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-[#887563]">Shipping</span>
          <span className={`${shippingFee === 0 ? 'text-green-600' : 'text-[#181411]'}`}>
            {shippingFee === 0 ? 'Free' : `${shippingFee} ฿`}
          </span>
        </div>

        {/* Free Shipping Notice */}
        {shippingFee > 0 && (
          <div className="text-xs text-[#887563] bg-blue-50 p-2 rounded">
            Add {(1000 - summary.totalAmount).toLocaleString()} ฿ more for free shipping!
          </div>
        )}

        <hr className="my-4" />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span className="text-[#181411]">Total</span>
          <span className="text-[#181411]">
            {finalTotal.toLocaleString()} ฿
          </span>
        </div>

        {/* Savings Summary */}
        {hasDiscount && (
          <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded">
            You saved {summary.totalDiscount.toLocaleString()} ฿!
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <button
          onClick={onCheckout}
          className="w-full bg-[#eb9947] text-[#181411] py-3 px-4 rounded-lg font-bold text-base hover:bg-[#d88a3f] transition-colors"
        >
          ดำเนินการชำระเงิน
        </button>
        
        <button
          onClick={onContinueShopping}
          className="w-full bg-gray-100 text-[#181411] py-3 px-4 rounded-lg font-medium text-base hover:bg-gray-200 transition-colors"
        >
          เลือกซื้อสินค้าเพิ่ม
        </button>
      </div>

      {/* Security Notice */}
      <div className="mt-4 text-xs text-[#887563] text-center flex items-center justify-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256">
          <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM128,168a12,12,0,1,1,12-12A12,12,0,0,1,128,168Zm8-36V132a8,8,0,0,1-16,0v0a8,8,0,0,1,8-8,20,20,0,1,0-20-20,8,8,0,0,1-16,0,36,36,0,1,1,44,35.14Z"/>
        </svg>
        Secure checkout protected by SSL
      </div>
    </div>
  );
}