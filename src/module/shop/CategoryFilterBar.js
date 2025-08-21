"use client";
import React from "react";

export default function CategoryFilterBar({ categories, selectedCategory, setSelectedCategory }) {
  return (
    <div className="flex gap-3 p-3 overflow-x-hidden">
      <div
        key="all"
        className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-4 pr-4 cursor-pointer ${selectedCategory === 'all' ? 'bg-[#e0dbd6]' : 'bg-[#f4f2f0]'}`}
        onClick={() => setSelectedCategory('all')}
      >
        <p className="text-[#181411] text-sm font-medium leading-normal">All</p>
      </div>
      {categories.map((cat) => (
        <div
          key={cat.id}
          className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-4 pr-4 cursor-pointer ${String(selectedCategory) === String(cat.id) ? 'bg-[#e0dbd6]' : 'bg-[#f4f2f0]'}`}
          onClick={() => setSelectedCategory(cat.id)}
        >
          <p className="text-[#181411] text-sm font-medium leading-normal">{cat.name}</p>
        </div>
      ))}
    </div>
  );
}
