// src/app/order/track/page.js
"use client";
import { useState } from "react";
import { Card, Input, Button, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function OrderTrackPage() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTrackOrder = async () => {
    if (!orderId.trim()) {
      message.warning("กรุณากรอกหมายเลขคำสั่งซื้อ");
      return;
    }

    setLoading(true);
    try {
      // Check if order exists
      const response = await fetch(`/api/customer/orders/${orderId}`);
      if (response.ok) {
        router.push(`/order/track/${orderId}`);
      } else {
        message.error("ไม่พบคำสั่งซื้อที่ระบุ");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "60vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: 24 
    }}>
      <Card 
        title="ติดตามคำสั่งซื้อ" 
        style={{ width: "100%", maxWidth: 400 }}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8 }}>
            หมายเลขคำสั่งซื้อ:
          </label>
          <Input
            placeholder="กรอกหมายเลขคำสั่งซื้อ เช่น 12345"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onPressEnter={handleTrackOrder}
            size="large"
          />
        </div>
        
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleTrackOrder}
          loading={loading}
          size="large"
          block
        >
          ติดตามคำสั่งซื้อ
        </Button>
        
        <div style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
          <p>💡 คุณสามารถค้นหาหมายเลขคำสั่งซื้อได้จาก:</p>
          <ul style={{ paddingLeft: 16 }}>
            <li>อีเมลยืนยันการสั่งซื้อ</li>
            <li>หน้าสำเร็จหลังจากสั่งซื้อ</li>
            <li>ประวัติการสั่งซื้อในบัญชีของคุณ</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}