// src/module/product/ProductDetailLoading.js
"use client";
import { motion } from "framer-motion";

export default function ProductDetailLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Header skeleton */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <div className="w-8 h-8 bg-[#e0dbd6] rounded-full animate-pulse" />
          <div className="w-24 h-6 bg-[#e0dbd6] rounded animate-pulse" />
          <div className="flex-1" />
          <div className="w-8 h-8 bg-[#e0dbd6] rounded-full animate-pulse" />
        </div>
        {/* Main image skeleton */}
        <div className="flex w-full grow bg-white p-4 justify-center">
          <div className="w-full max-w-2xl gap-1 overflow-hidden bg-white sm:gap-2 aspect-[2/3] rounded-lg flex">
            <div className="w-full h-full bg-[#e0dbd6] rounded-lg animate-pulse" />
          </div>
        </div>
        {/* Gallery skeleton */}
        <div className="flex gap-2 px-4 pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-16 h-16 bg-[#e0dbd6] rounded-lg animate-pulse" />
          ))}
        </div>
        {/* Details skeleton */}
        <div className="px-4 py-2">
          <div className="w-2/3 h-6 bg-[#e0dbd6] rounded mb-2 animate-pulse" />
          <div className="w-1/2 h-5 bg-[#e0dbd6] rounded mb-2 animate-pulse" />
          <div className="w-full h-4 bg-[#e0dbd6] rounded mb-2 animate-pulse" />
          <div className="w-3/4 h-4 bg-[#e0dbd6] rounded animate-pulse" />
        </div>
        {/* Add to cart button skeleton */}
        <div className="sticky bottom-0 bg-white w-full flex justify-center">
          <div className="px-4 py-3 w-full max-w-2xl">
            <div className="h-14 w-full bg-[#e0dbd6] rounded-lg animate-pulse" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
