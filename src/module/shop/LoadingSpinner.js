"use client";
import React from "react";
import { motion } from "framer-motion";

export default function LoadingSpinner({
  count = 4,
  categories = [],
  selectedCategory,
  setSelectedCategory,
}) {
  // count = จำนวน card loading ที่ต้องการแสดง
  return (
    <>
      {/* Category Bar Loading Skeleton */}
      <div className="flex gap-3 p-3 overflow-x-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex h-8 w-20 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#e0dbd6] animate-pulse"
          >
            <div className="w-12 h-4 bg-[#e0dbd6] rounded" />
          </div>
        ))}
      </div>
      <div className="px-4 pb-3 pt-5">
        <div className="w-32 h-7 bg-[#e0dbd6] rounded animate-pulse" />
      </div>
      {/* Card Loading Skeleton */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#f4f2f0] rounded-lg aspect-square flex flex-col gap-3 justify-end p-4 relative overflow-hidden"
          >
            <div className="w-4/5 h-6 bg-[#e0dbd6] rounded mb-2 animate-pulse" />
            <div className="w-3/5 h-5 bg-[#e0dbd6] rounded animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#e0dbd6]/60 to-transparent pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </>
  );
}
