"use client";
import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="w-10 h-10 border-4 border-[#e0dbd6] border-t-[#b8a99a] rounded-full animate-spin"></div>
    </div>
  );
}
