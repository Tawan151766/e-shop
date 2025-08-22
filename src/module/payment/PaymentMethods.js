// src/module/payment/PaymentMethods.js
"use client";
import { CreditCard } from "lucide-react";

export default function PaymentMethods({ selectedMethod, onMethodChange, amount }) {
  const methods = [
    {
      id: "bank_transfer",
      name: "โอนเงินผ่านธนาคาร",
      description: "โอนเงินแล้วอัปโหลดสลิป",
      icon: <CreditCard className="w-6 h-6" />,
      available: true,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        เลือกวิธีการชำระเงิน
      </h2>
      
      <div className="space-y-3">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`
              border rounded-lg p-4 cursor-pointer transition-all
              ${selectedMethod === method.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
              }
              ${!method.available ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={() => method.available && onMethodChange(method.id)}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${selectedMethod === method.id
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300"
                }
              `}>
                {selectedMethod === method.id && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              
              <div className="text-blue-600">
                {method.icon}
              </div>
              
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {method.name}
                </div>
                <div className="text-sm text-gray-600">
                  {method.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">
            ยอดที่ต้องชำระ
          </span>
          <span className="text-2xl font-bold text-blue-600">
            ฿{Number(amount).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}