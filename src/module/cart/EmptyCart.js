// src/module/cart/EmptyCart.js
"use client";

export default function EmptyCart({ onContinueShopping }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        {/* Empty Cart Icon */}
        <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="w-full h-full">
            <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z"/>
          </svg>
        </div>

        {/* Empty Message */}
        <h2 className="text-2xl font-bold text-[#181411] mb-3">
          Your Cart is Empty
        </h2>
        
        <p className="text-[#887563] text-base mb-8 leading-relaxed">
          Looks like you haven't added any items to your cart yet. 
          Start shopping to find your favorite products!
        </p>

        {/* Continue Shopping Button */}
        <button
          onClick={onContinueShopping}
          className="bg-[#eb9947] text-[#181411] px-8 py-3 rounded-lg font-bold text-base hover:bg-[#d88a3f] transition-colors inline-flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
            <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/>
          </svg>
          Start Shopping
        </button>

        {/* Additional Actions */}
        <div className="mt-8 space-y-3">
          <div className="text-sm text-[#887563]">
            Need help finding something?
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button className="text-[#eb9947] hover:underline">
              Browse Categories
            </button>
            <button className="text-[#eb9947] hover:underline">
              View Deals
            </button>
            <button className="text-[#eb9947] hover:underline">
              Customer Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}