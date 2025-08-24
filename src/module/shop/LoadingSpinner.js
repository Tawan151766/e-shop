"use client";
import React from "react";
import { motion } from "framer-motion";

export default function LoadingSpinner({ count = 6 }) {
  // count = จำนวน card loading ที่ต้องการแสดง
  return (
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
  );
}
