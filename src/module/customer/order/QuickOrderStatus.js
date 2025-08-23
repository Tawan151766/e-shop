// src/module/customer/order/QuickOrderStatus.js
"use client";
import { useState } from "react";
import { Card, Input, Button, Tag, message } from "antd";
import { SearchOutlined, ClockCircleOutlined } from "@ant-design/icons";

export default function QuickOrderStatus() {
  const [orderId, setOrderId] = useState("");
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const ORDER_STATUS = {
    PENDING_PAYMENT: { label: "รอชำระเงิน", color: "orange" },
    WAITING_CONFIRM: { label: "รอยืนยัน", color: "blue" },
    PAID: { label: "ชำระแล้ว", color: "green" },
    SHIPPING: { label: "กำลังจัดส่ง", color: "purple" },
    COMPLETED: { label: "เสร็จสิ้น", color: "success" },
    CANCELLED: { label: "ยกเลิก", color: "red" },
  };

  const handleCheckStatus = async () => {
    if (!orderId.trim()) {
      message.warning("กรุณากรอกหมายเลขคำสั่งซื้อ");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/customer/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderStatus(data.order);
      } else {
        message.error("ไม่พบคำสั่งซื้อที่ระบุ");
        setOrderStatus(null);
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setOrderStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => ORDER_STATUS[status] || ORDER_STATUS.PENDING_PAYMENT;

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <ClockCircleOutlined />
          <span>ตรวจสอบสถานะคำสั่งซื้อ</span>
        </div>
      }
      size="small"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="หมายเลขคำสั่งซื้อ"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onPressEnter={handleCheckStatus}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleCheckStatus}
            loading={loading}
          >
            ตรวจสอบ
          </Button>
        </div>

        {orderStatus && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">คำสั่งซื้อ #{orderStatus.id}</span>
              <Tag color={getStatusConfig(orderStatus.status).color}>
                {getStatusConfig(orderStatus.status).label}
              </Tag>
            </div>
            <div className="text-sm text-gray-600">
              <div>ยอดรวม: ฿{Number(orderStatus.totalAmount).toLocaleString()}</div>
              <div>วันที่สั่งซื้อ: {new Date(orderStatus.createdAt).toLocaleDateString('th-TH')}</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}