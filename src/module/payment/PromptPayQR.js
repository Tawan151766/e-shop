// src/module/payment/PromptPayQR.js
"use client";
import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

export default function PromptPayQR({ amount, orderId }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // PromptPay phone number (example)
  const promptPayNumber = "0812345678";

  useEffect(() => {
    generateQRCode();
  }, [amount, orderId]);

  const generateQRCode = async () => {
    try {
      const response = await fetch("/api/payment/generate-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          orderId: orderId,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl);
      } else {
        console.error("QR generation failed:", data.error);
      }
    } catch (error) {
      console.error("QR generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(promptPayNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        ชำระเงินผ่าน PromptPay
      </h3>

      <div className="text-center space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : qrCodeUrl ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={qrCodeUrl}
                alt="PromptPay QR Code"
                className="w-64 h-64 border border-gray-200 rounded-lg"
              />
            </div>
            
            <p className="text-sm text-gray-600">
              สแกน QR Code ด้วยแอปธนาคารของคุณ
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">ไม่สามารถสร้าง QR Code ได้</p>
          </div>
        )}

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">
            หรือโอนเงินไปที่เบอร์ PromptPay
          </p>
          
          <div className="flex items-center justify-center gap-2 bg-gray-50 p-3 rounded-lg">
            <span className="font-mono text-lg font-semibold">
              {promptPayNumber}
            </span>
            
            <button
              onClick={copyToClipboard}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="คัดลอกเบอร์"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
          <h4 className="font-semibold text-yellow-800 mb-2">
            ขั้นตอนการชำระเงิน:
          </h4>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>สแกน QR Code หรือโอนเงินไปที่เบอร์ PromptPay</li>
            <li>ตรวจสอบยอดเงินให้ถูกต้อง</li>
            <li>ทำการโอนเงิน</li>
            <li>อัปโหลดสลิปการโอนเงินด้านล่าง</li>
          </ol>
        </div>
      </div>
    </div>
  );
}