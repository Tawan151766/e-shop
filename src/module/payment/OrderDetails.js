// src/module/payment/OrderDetails.js
"use client";
import { Package, User, MapPin, Clock } from "lucide-react";

export default function OrderDetails({ order, payment }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "WAITING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "WAITING":
        return "รอการตรวจสอบ";
      case "CONFIRMED":
        return "ชำระเงินแล้ว";
      case "REJECTED":
        return "การชำระเงินถูกปฏิเสธ";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          สถานะการชำระเงิน
        </h3>
        
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${getStatusColor(payment.status)}
            `}>
              {getStatusText(payment.status)}
            </span>
            <p className="text-sm text-gray-600 mt-1">
              อัปเดตล่าสุด: {new Date(payment.updatedAt).toLocaleString('th-TH')}
            </p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          รายละเอียดคำสั่งซื้อ
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">หมายเลขคำสั่งซื้อ</span>
            <span className="font-medium">#{order.id}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">วันที่สั่งซื้อ</span>
            <span className="font-medium">
              {new Date(order.createdAt).toLocaleDateString('th-TH')}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>ยอดรวม</span>
            <span className="text-blue-600">
              ฿{Number(order.totalAmount).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          ข้อมูลผู้รับ
        </h3>
        
        <div className="space-y-3">
          <div>
            <p className="font-medium text-gray-900">{order.customer.name}</p>
            <p className="text-gray-600">{order.customer.phone}</p>
          </div>
          
          <div className="flex gap-2">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-600">{order.customer.address}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          รายการสินค้า
        </h3>
        
        <div className="space-y-4">
          {order.orderItems.map((item) => (
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
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {item.product.name}
                </h4>
                <p className="text-sm text-gray-600">
                  จำนวน: {item.quantity} ชิ้น
                </p>
                <p className="text-sm font-medium text-gray-900">
                  ฿{Number(item.price).toLocaleString()} / ชิ้น
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
    </div>
  );
}