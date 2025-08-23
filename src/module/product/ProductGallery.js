"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductGallery({ galleries = [], onImageSelect }) {
  if (!galleries.length) return null;

  const [selected, setSelected] = useState(null);
  const subImages = galleries.map((g) => g.imageUrl);

  return (
    <div className="w-full bg-white p-4">
      {/* Mobile = horizontal scroll, Desktop = grid */}
      <motion.div
        layout
        className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-5 sm:gap-3 sm:overflow-visible"
        transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
      >
        <AnimatePresence>
          {subImages.map((img, idx) => (
            <motion.div
              key={img}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`relative flex-shrink-0 w-1/2 sm:w-auto overflow-hidden rounded-xl shadow-sm cursor-pointer group border ${
                selected === img
                  ? "border-blue-500 ring-2 ring-blue-400"
                  : "border-gray-200"
              }`}
              onClick={() => {
                setSelected(img);
                onImageSelect && img && onImageSelect(img);
              }}
            >
              <img
                src={img}
                alt={`Product image ${idx + 1}`}
                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
