// src/module/order/OrderSuccessPage.js
"use client";
import { useRouter } from "next/navigation";
import { CheckCircle, Package, Truck, Home, ShoppingBag } from "lucide-react";

export default function OrderSuccessPage({ orderData }) {
  const router = useRouter();

  const getShippingStatusText = (status) => {
    switch (status) {
      case "PREPARING":
        return "กำลังเตรียมสินค้า";
      case "SHIPPED":
        return "จัดส่งแล้ว";
      case "DELIVERED":
        return "ส่งถึงแล้ว";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ชำระเงินสำเร็จ!
          </h1>
          
          <p className="text-gray-600">
            ขอบคุณสำหรับการสั่งซื้อ เราจะดำเนินการจัดส่งสินค้าให้คุณเร็วที่สุด
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
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ชำระเงินแล้ว
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">สถานะการจัดส่ง</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {getShippingStatusText(orderData.shipping?.status)}
              </span>
            </div>
            
            {orderData.shipping?.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">หมายเลขติดตาม</span>
                <span className="font-medium font-mono">
                  {orderData.shipping.trackingNumber}
                </span>
              </div>
            )}
            
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>ยอดรวม</span>
                <span className="text-green-600">
                  ฿{Number(orderData.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ข้อมูลการจัดส่ง
          </h3>
          
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{orderData.customer.name}</p>
            <p className="text-gray-600">{orderData.customer.phone}</p>
            <p className="text-gray-600">{orderData.customer.address}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            รายการสินค้า
          </h3>
          
          <div className="space-y-4">
            {orderData.orderItems.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {item.product.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    จำนวน: {item.quantity} ชิ้น × ฿{Number(item.price).toLocaleString()}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ฿{(Number(item.price) * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            กลับสู่หน้าหลัก
          </button>
          
          <button
            onClick={() => router.push(`/order/track/${orderData.id}`)}
            className="w-full bg-green-100 text-green-700 py-3 px-4 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
          >
            <Truck className="w-5 h-5" />
            ติดตามคำสั่งซื้อ
          </button>
          
          <button
            onClick={() => router.push("/order/history")}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            ดูประวัติการสั่งซื้อ
          </button>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3">ขั้นตอนต่อไป</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>เราจะเตรียมสินค้าของคุณภายใน 1-2 วันทำการ</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>จัดส่งภายใน 3-5 วันทำการ</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>คุณจะได้รับการแจ้งเตือนเมื่อสินค้าถึงมือ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}