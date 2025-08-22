// src/module/checkout/ClientCheckoutPage.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutHeader from "@/module/checkout/CheckoutHeader";
import ShippingForm from "@/module/checkout/ShippingForm";
import OrderSummary from "@/module/checkout/OrderSummary";
import CheckoutItems from "@/module/checkout/CheckoutItems";

export default function ClientCheckoutPage({ checkoutData }) {
  const router = useRouter();
  const [shippingInfo, setShippingInfo] = useState({
    name: checkoutData.customer?.name || "",
    phone: checkoutData.customer?.phone || "",
    address: checkoutData.customer?.address || "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!shippingInfo.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อผู้รับ";
    }
    
    if (!shippingInfo.phone.trim()) {
      newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
    } else if (!/^[0-9]{9,10}$/.test(shippingInfo.phone.replace(/[^0-9]/g, ""))) {
      newErrors.phone = "เบอร์โทรศัพท์ไม่ถูกต้อง";
    }
    
    if (!shippingInfo.address.trim()) {
      newErrors.address = "กรุณากรอกที่อยู่จัดส่ง";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingInfo,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Redirect to payment page
        router.push(`/payment/${data.paymentId}?orderId=${data.orderId}`);
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการสั่งซื้อ");
      }
    } catch (error) {
      console.error("Place order error:", error);
      alert("เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutHeader onBack={() => router.back()} />
      
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <ShippingForm
              shippingInfo={shippingInfo}
              setShippingInfo={setShippingInfo}
              errors={errors}
            />

            {/* Order Items */}
            <CheckoutItems items={checkoutData.cart.items} />
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              summary={checkoutData.cart.summary}
              onPlaceOrder={handlePlaceOrder}
              isProcessing={isProcessing}
              disabled={!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address}
            />
          </div>
        </div>
      </div>
    </div>
  );
}