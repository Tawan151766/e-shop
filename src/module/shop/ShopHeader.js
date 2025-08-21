"use client";
import React from "react";

export default function ShopHeader() {
  return (
    <div className="flex items-center bg-white p-4 pb-2 justify-between">
      <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">Shop</h2>
      <div className="flex w-12 items-center justify-end">
        <button
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-[#181411] gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0"
        >
          <div className="text-[#181411]">
            {/* Shopping Bag Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
