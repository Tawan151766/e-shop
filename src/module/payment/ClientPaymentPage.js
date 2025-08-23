// src/module/payment/ClientPaymentPage.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PaymentHeader from "@/module/payment/PaymentHeader";
import PaymentMethods from "@/module/payment/PaymentMethods";
import OrderDetails from "@/module/payment/OrderDetails";
import BankTransferInfo from "@/module/payment/BankTransferInfo";
import SlipUpload from "@/module/payment/SlipUpload";
import { message } from "antd";

export default function ClientPaymentPage({ paymentData }) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("bank_transfer");
  const [paymentStatus, setPaymentStatus] = useState(paymentData.status);
  const [isUploading, setIsUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  // Poll payment status every 30 seconds
  useEffect(() => {
    if (paymentStatus === "WAITING") {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/payment/${paymentData.id}/status`);
          const data = await response.json();

          if (data.status !== "WAITING") {
            setPaymentStatus(data.status);
            clearInterval(interval);

            if (data.status === "CONFIRMED") {
              router.push(`/order/success/${paymentData.order.id}`);
            } else if (data.status === "REJECTED") {
              router.push(`/order/failed/${paymentData.order.id}`);
            }
          }
        } catch (error) {
          console.error("Status check error:", error);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [paymentStatus, paymentData.id, paymentData.order.id, router]);

  const handleSlipUpload = async (file) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("slip", file);
      formData.append("paymentId", paymentData.id);

      const response = await fetch("/api/payment/upload-slip", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        messageApi.open({
          type: "success",
          content: "อัปโหลดสลิปสำเร็จ! รอการตรวจสอบจากเจ้าหน้าที่",
        });
        window.location.reload();
      } else {
        messageApi.open({
          type: "error",
          content: data.error || "เกิดข้อผิดพลาดในการอัปโหลดสลิป",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการอัปโหลดสลิป",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {contextHolder}
      <PaymentHeader
        orderId={paymentData.order.id}
        onBack={() => router.back()}
      />

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Payment Methods */}
          <div className="space-y-6">
            <PaymentMethods
              selectedMethod={selectedMethod}
              onMethodChange={setSelectedMethod}
              amount={paymentData.amount}
            />

            <BankTransferInfo
              amount={paymentData.amount}
              orderId={paymentData.order.id}
            />

            <SlipUpload
              onUpload={handleSlipUpload}
              isUploading={isUploading}
              hasSlip={!!paymentData.slipUrl}
              slipUrl={paymentData.slipUrl}
            />
          </div>

          {/* Right Column - Order Details */}
          <div>
            <OrderDetails order={paymentData.order} payment={paymentData} />
          </div>
        </div>
      </div>
    </div>
  );
}
