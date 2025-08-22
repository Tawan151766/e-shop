// src/module/payment/PaymentHeader.js
"use client";
import { ArrowLeft } from "lucide-react";

export default function PaymentHeader({ orderId, onBack }) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              ชำระเงิน
            </h1>
            <p className="text-sm text-gray-600">
              คำสั่งซื้อ #{orderId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}