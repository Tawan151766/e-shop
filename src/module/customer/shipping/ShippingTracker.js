"use client";

import { useState } from "react";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Search,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle
} from "lucide-react";

const STATUS_CONFIG = {
  PREPARING: {
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    title: "เตรียมสินค้า",
  },
  SHIPPED: {
    icon: Truck,
    color: "text-blue-600", 
    bgColor: "bg-blue-100",
    title: "จัดส่งแล้ว",
  },
  DELIVERED: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100", 
    title: "จัดส่งสำเร็จ",
  },
};

export default function ShippingTracker() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    try {
      setLoading(true);
      setError("");
      setTrackingInfo(null);

      const response = await fetch(`/api/customer/shipping/track?trackingNumber=${encodeURIComponent(trackingNumber.trim())}`);
      const data = await response.json();

      if (response.ok) {
        setTrackingInfo(data);
      } else {
        setError(data.error || "ไม่พบหมายเลขติดตามนี้");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการติดตาม กรุณาลองใหม่อีกครั้ง");
      console.error("Tracking error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ติดตามพัสดุ
          </h1>
          <p className="text-gray-600">
            ใส่หมายเลขติดตามเพื่อดูสถานะการจัดส่งของคุณ
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleTrack} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="ใส่หมายเลขติดตาม เช่น TH123456789"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !trackingNumber.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังติดตาม...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  ติดตาม
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Tracking Results */}
        {trackingInfo && (
          <div className="space-y-6">
            {/* Tracking Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    หมายเลขติดตาม: {trackingInfo.trackingNumber}
                  </h2>
                  <p className="text-gray-600">
                    บริษัทขนส่ง: {trackingInfo.courier || "ไม่ระบุ"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">คำสั่งซื้อ</div>
                  <div className="text-lg font-semibold text-gray-900">
                    #{trackingInfo.order.id}
                  </div>
                </div>
              </div>

              {trackingInfo.estimatedDelivery && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">
                      คาดว่าจะได้รับ: {formatDate(trackingInfo.estimatedDelivery)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                สถานะการจัดส่ง
              </h3>
              
              <div className="space-y-4">
                {trackingInfo.timeline.map((step, index) => {
                  const config = STATUS_CONFIG[step.status];
                  const Icon = config.icon;
                  const isCompleted = step.completed;
                  const isLast = index === trackingInfo.timeline.length - 1;

                  return (
                    <div key={step.status} className="relative">
                      {/* Timeline line */}
                      {!isLast && (
                        <div className={`absolute left-6 top-12 w-0.5 h-16 ${
                          isCompleted ? "bg-green-300" : "bg-gray-200"
                        }`} />
                      )}
                      
                      {/* Timeline item */}
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? "bg-green-100 text-green-600" 
                            : step.status === trackingInfo.currentStatus
                            ? config.bgColor + " " + config.color
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${
                              isCompleted || step.status === trackingInfo.currentStatus
                                ? "text-gray-900" 
                                : "text-gray-500"
                            }`}>
                              {step.title}
                            </h4>
                            {step.timestamp && (
                              <span className="text-sm text-gray-500">
                                {formatDate(step.timestamp)}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            isCompleted || step.status === trackingInfo.currentStatus
                              ? "text-gray-600" 
                              : "text-gray-400"
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                รายละเอียดคำสั่งซื้อ
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    ข้อมูลผู้รับ
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      {trackingInfo.order.customer.name}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {trackingInfo.order.customer.email}
                    </div>
                    {trackingInfo.order.customer.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {trackingInfo.order.customer.phone}
                      </div>
                    )}
                    {trackingInfo.order.customer.address && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{trackingInfo.order.customer.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    สรุปคำสั่งซื้อ
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">วันที่สั่งซื้อ:</span>
                      <span className="text-gray-900">
                        {formatDate(trackingInfo.order.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">จำนวนสินค้า:</span>
                      <span className="text-gray-900">
                        {trackingInfo.order.items.length} รายการ
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-900">ยอดรวม:</span>
                      <span className="text-gray-900">
                        ฿{Number(trackingInfo.order.totalAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">รายการสินค้า</h4>
                <div className="space-y-2">
                  {trackingInfo.order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <span className="text-gray-900">{item.product.name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="text-gray-900 font-medium">
                        ฿{Number(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-medium text-blue-900 mb-2">
            ต้องการความช่วยเหลือ?
          </h3>
          <p className="text-blue-700 text-sm">
            หากคุณมีปัญหาในการติดตามพัสดุ หรือมีคำถามเกี่ยวกับการจัดส่ง 
            กรุณาติดต่อฝ่ายบริการลูกค้าของเรา
          </p>
        </div>
      </div>
    </div>
  );
}