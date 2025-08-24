// src/module/checkout/OrderSummary.js
"use client";

export default function OrderSummary({
  summary,
  onPlaceOrder,
  isProcessing,
  disabled,
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 sticky top-24">
      <h2 className="text-[#181411] text-xl font-bold mb-6">สรุปคำสั่งซื้อ</h2>

      <div className="space-y-4">
        {/* Items Summary */}
        <div className="flex justify-between text-sm">
          <span className="text-[#887563]">
            สินค้า ({summary.totalItems} รายการ)
          </span>
          <span className="text-[#181411]">
            {summary.originalAmount.toLocaleString()} ฿
          </span>
        </div>

        {/* Discount */}
        {summary.totalDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#887563]">ส่วนลด</span>
            <span className="text-green-600">
              -{summary.totalDiscount.toLocaleString()} ฿
            </span>
          </div>
        )}

        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-[#887563]">ยอดรวมสินค้า</span>
          <span className="text-[#181411]">
            {summary.totalAmount.toLocaleString()} ฿
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-[#887563]">ค่าจัดส่ง</span>
          <span
            className={`${
              summary.shippingFee === 0 ? "text-green-600" : "text-[#181411]"
            }`}
          >
            {summary.shippingFee === 0 ? "ฟรี" : `${summary.shippingFee} ฿`}
          </span>
        </div>

        {/* Free Shipping Notice */}
        {summary.shippingFee > 0 && summary.totalAmount < 1000 && (
          <div className="text-xs text-[#887563] bg-blue-50 p-3 rounded-lg">
            เพิ่มอีก {(1000 - summary.totalAmount).toLocaleString()} ฿
            เพื่อจัดส่งฟรี!
          </div>
        )}

        <hr className="my-4" />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span className="text-[#181411]">ยอดรวมทั้งหมด</span>
          <span className="text-[#181411]">
            {summary.finalTotal.toLocaleString()} ฿
          </span>
        </div>

        {/* Savings */}
        {summary.totalDiscount > 0 && (
          <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded">
            คุณประหยัดได้ {summary.totalDiscount.toLocaleString()} ฿!
          </div>
        )}
      </div>

      {/* Place Order Button */}
      <div className="mt-6">
        <button
          onClick={onPlaceOrder}
          disabled={disabled || isProcessing}
          className="w-full bg-[#eb9947] text-[#181411] py-4 px-4 rounded-lg font-bold text-base hover:bg-[#d88a3f] focus:outline-none focus:ring-2 focus:ring-[#eb9947] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-[#181411] border-t-transparent rounded-full animate-spin mr-2"></div>
              กำลังดำเนินการ...
            </div>
          ) : (
            `สั่งซื้อ • ${summary.finalTotal.toLocaleString()} ฿`
          )}
        </button>

        <p className="text-xs text-[#887563] text-center mt-3">
          การกดสั่งซื้อแสดงว่าคุณยอมรับ
          <button className="text-[#eb9947] hover:underline mx-1">
            เงื่อนไขการใช้งาน
          </button>
          และ
          <button className="text-[#eb9947] hover:underline mx-1">
            นโยบายความเป็นส่วนตัว
          </button>
        </p>
      </div>

      {/* Security Notice */}
      <div className="mt-4 text-xs text-[#887563] text-center flex items-center justify-center gap-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM128,168a12,12,0,1,1,12-12A12,12,0,0,1,128,168Zm8-36V132a8,8,0,0,1-16,0v0a8,8,0,0,1,8-8,20,20,0,1,0-20-20,8,8,0,0,1-16,0,36,36,0,1,1,44,35.14Z" />
        </svg>
        ข้อมูลของคุณได้รับการปกป้องด้วย SSL
      </div>
    </div>
  );
}
