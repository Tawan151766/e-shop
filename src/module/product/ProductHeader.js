// src/module/product/ProductHeader.js
"use client";
export default function ProductHeader({ onBack, onShare }) {
  return (
    <div className="flex items-center bg-white p-4 pb-2 justify-between">
      <button
        className="text-[#181411] flex size-12 shrink-0 items-center"
        onClick={onBack}
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
          onClick={onShare}
        >
          <div className="text-[#181411]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M229.66,109.66l-48,48a8,8,0,0,1-11.32-11.32L204.69,112H165a88,88,0,0,0-85.23,66,8,8,0,0,1-15.5-4A103.94,103.94,0,0,1,165,96h39.71L170.34,61.66a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,229.66,109.66ZM192,208H40V88a8,8,0,0,0-16,0V208a16,16,0,0,0,16,16H192a8,8,0,0,0,0-16Z"></path>
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
