"use client";
import MainModule from "@/module/shop/MainModule";

export default function HomePage() {
  return (
    <div
      className="relative flex min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: "Work Sans, Noto Sans, sans-serif" }}
    >
      <MainModule />
    </div>
  );
}
