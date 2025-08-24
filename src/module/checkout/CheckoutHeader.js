// src/module/checkout/CheckoutHeader.js
"use client";

export default function CheckoutHeader({ onBack }) {
  return (
    <div className="flex items-center bg-white p-4 pb-2 justify-between border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      {/* Back Button */}
      <button
        className="text-[#181411] flex size-12 shrink-0 items-center"
        onClick={onBack}
        aria-label="ย้อนกลับ"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
          <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
        </svg>
      </button>

      {/* Title with Steps */}
      <div className="flex-1 text-center">
        <h1 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em]">
          Checkout
        </h1>
        <div className="flex items-center justify-center mt-2 space-x-2">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-[#eb9947] rounded-full flex items-center justify-center text-white text-xs font-bold">
              1
            </div>
            <span className="ml-2 text-sm text-[#181411] font-medium">Shipping</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">
              2
            </div>
            <span className="ml-2 text-sm text-gray-500">Payment</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">
              3
            </div>
            <span className="ml-2 text-sm text-gray-500">Complete</span>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      {/* <div className="flex items-center">
        <div className="flex items-center text-green-600 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
            <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM128,168a12,12,0,1,1,12-12A12,12,0,0,1,128,168Zm8-36V132a8,8,0,0,1-16,0v0a8,8,0,0,1,8-8,20,20,0,1,0-20-20,8,8,0,0,1-16,0,36,36,0,1,1,44,35.14Z"/>
          </svg>
          <span className="ml-1">Secure</span>
        </div>
      </div> */}
    </div>
  );
}