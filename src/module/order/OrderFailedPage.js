// src/module/order/OrderFailedPage.js
"use client";
import { useRouter } from "next/navigation";
import { XCircle, RefreshCw, Home, Phone } from "lucide-react";

export default function OrderFailedPage({ orderData }) {
  const router = useRouter();

  const handleRetryPayment = () => {
    router.push(`/payment/${orderData.payment.id}?orderId=${orderData.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Failed Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            การชำระเงินไม่สำเร็จ
          </h1>
          
          <p className="text-gray-600">
            เกิดปัญหาในการตรวจสอบการชำระเงินของคุณ
          </p>
        </div>

        {/* Order Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ข้อมูลคำสั่งซื้อ
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">หมายเลขคำสั่งซื้อ</span>
              <span className="font-medium">#{orderData.id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">วันที่สั่งซื้อ</span>
              <span className="font-medium">
                {new Date(orderData.createdAt).toLocaleDateString('th-TH')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">สถานะการชำระเงิน</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                ไม่สำเร็จ
              </span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>ยอดรวม</span>
                <span className="text-gray-900">
                  ฿{Number(orderData.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Possible Reasons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            สาเหตุที่อาจเป็นไปได้
          </h3>
          
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>ยอดเงินในสลิปไม่ตรงกับยอดที่ต้องชำระ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>รูปภาพสลิปไม่ชัดเจนหรือไม่สามารถอ่านได้</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>โอนเงินไปยังบัญชีที่ไม่ถูกต้อง</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>สลิปการโอนเงินหมดอายุหรือไม่ถูกต้อง</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={handleRetryPayment}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            ลองชำระเงินอีกครั้ง
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            กลับสู่หน้าหลัก
          </button>
        </div>

        {/* Contact Support */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            ต้องการความช่วยเหลือ?
          </h4>
          
          <div className="text-sm text-yellow-800 space-y-2">
            <p>
              หากคุณแน่ใจว่าได้ชำระเงินถูกต้องแล้ว กรุณาติดต่อเจ้าหน้าที่
            </p>
            
            <div className="space-y-1">
              <p><strong>โทร:</strong> 02-123-4567</p>
              <p><strong>Line:</strong> @shopname</p>
              <p><strong>Email:</strong> support@shop.com</p>
            </div>
            
            <p className="text-xs">
              เวลาทำการ: จันทร์-ศุกร์ 9:00-18:00 น.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}