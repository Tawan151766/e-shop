// src/module/cart/CartHeader.js
"use client";

export default function CartHeader({ onBack, onClear, itemCount }) {
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

      {/* Title */}
      <div className="flex-1 text-center">
        <h1 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em]">
          Shopping Cart
        </h1>
        {itemCount > 0 && (
          <p className="text-[#887563] text-sm">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Clear Cart Button */}
      <div className="flex w-12 items-center justify-end">
        {onClear && (
          <button
            className="flex items-center justify-center rounded-lg h-10 px-3 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            onClick={onClear}
            aria-label="ล้างตะกร้า"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}