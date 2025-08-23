// src/module/customer/order/OrderTracking.js
"use client";
import { useEffect, useState } from "react";
import {
  Card,
  Steps,
  Tag,
  Descriptions,
  Table,
  message,
  Spin,
  Timeline,
  Empty,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";

export default function OrderTracking({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Order Status Configuration
  const ORDER_STATUS = {
    PENDING_PAYMENT: { 
      label: "รอชำระเงิน", 
      color: "orange", 
      step: 0,
      description: "กรุณาชำระเงินเพื่อดำเนินการต่อ"
    },
    WAITING_CONFIRM: { 
      label: "รอยืนยันการชำระ", 
      color: "blue", 
      step: 1,
      description: "เรากำลังตรวจสอบการชำระเงินของคุณ"
    },
    PAID: { 
      label: "ชำระเงินแล้ว", 
      color: "green", 
      step: 2,
      description: "การชำระเงินสำเร็จ กำลังเตรียมสินค้า"
    },
    SHIPPING: { 
      label: "กำลังจัดส่ง", 
      color: "purple", 
      step: 3,
      description: "สินค้าอยู่ระหว่างการจัดส่ง"
    },
    COMPLETED: { 
      label: "จัดส่งสำเร็จ", 
      color: "success", 
      step: 4,
      description: "สินค้าถึงมือคุณแล้ว"
    },
    CANCELLED: { 
      label: "ยกเลิกแล้ว", 
      color: "red", 
      step: -1,
      description: "คำสั่งซื้อถูกยกเลิก"
    },
  };

  const fetchOrder = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`/api/customer/orders/${orderId}`);
      setOrder(res.data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
      message.error("ไม่พบข้อมูลคำสั่งซื้อ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const getStatusConfig = (status) => ORDER_STATUS[status] || ORDER_STATUS.PENDING_PAYMENT;

  const getOrderProgress = (status) => {
    const config = getStatusConfig(status);
    if (config.step === -1) return { current: 0, status: "error" };
    return { current: config.step, status: config.step === 4 ? "finish" : "process" };
  };

  const getTimelineItems = (order) => {
    const items = [];
    const currentStatus = getStatusConfig(order.status);

    // Add creation
    items.push({
      color: "blue",
      children: (
        <div>
          <div><strong>สร้างคำสั่งซื้อ</strong></div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {new Date(order.createdAt).toLocaleString("th-TH")}
          </div>
        </div>
      ),
    });

    // Add current status if not pending payment
    if (order.status !== "PENDING_PAYMENT") {
      items.push({
        color: currentStatus.step === -1 ? "red" : "green",
        children: (
          <div>
            <div><strong>{currentStatus.label}</strong></div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {order.updatedAt 
                ? new Date(order.updatedAt).toLocaleString("th-TH")
                : new Date(order.createdAt).toLocaleString("th-TH")
              }
            </div>
          </div>
        ),
      });
    }

    return items;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <Empty 
        description="ไม่พบข้อมูลคำสั่งซื้อ"
        style={{ padding: 50 }}
      />
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <Card title={`ติดตามคำสั่งซื้อ #${order.id}`} style={{ marginBottom: 24 }}>
        {/* Current Status */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Tag color={statusConfig.color} style={{ fontSize: 16, padding: "8px 16px" }}>
            {statusConfig.label}
          </Tag>
          <div style={{ marginTop: 8, color: "#666" }}>
            {statusConfig.description}
          </div>
        </div>

        {/* Progress Steps */}
        <Steps
          {...getOrderProgress(order.status)}
          items={[
            {
              title: "รอชำระเงิน",
              icon: <ClockCircleOutlined />,
            },
            {
              title: "รอยืนยัน",
              icon: <CheckCircleOutlined />,
            },
            {
              title: "ชำระแล้ว",
              icon: <CheckCircleOutlined />,
            },
            {
              title: "กำลังจัดส่ง",
              icon: <TruckOutlined />,
            },
            {
              title: "จัดส่งสำเร็จ",
              icon: <CheckCircleOutlined />,
            },
          ]}
        />
      </Card>

      {/* Order Timeline */}
      <Card title="ประวัติคำสั่งซื้อ" style={{ marginBottom: 24 }}>
        <Timeline items={getTimelineItems(order)} />
      </Card>

      {/* Order Details */}
      <Card title="รายละเอียดคำสั่งซื้อ" style={{ marginBottom: 24 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="หมายเลขคำสั่งซื้อ" span={1}>
            #{order.id}
          </Descriptions.Item>
          <Descriptions.Item label="สถานะ" span={1}>
            <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="ยอดรวม" span={1}>
            ฿{Number(order.totalAmount).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="วันที่สั่งซื้อ" span={1}>
            {new Date(order.createdAt).toLocaleString("th-TH")}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Order Items */}
      <Card title="รายการสินค้า">
        <Table
          dataSource={order.orderItems}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            {
              title: "สินค้า",
              dataIndex: ["product", "name"],
              key: "productName",
            },
            {
              title: "จำนวน",
              dataIndex: "quantity",
              key: "quantity",
              width: 80,
              align: "center",
            },
            {
              title: "ราคา/หน่วย",
              dataIndex: "price",
              key: "price",
              width: 120,
              align: "right",
              render: (price) => `฿${Number(price).toLocaleString()}`,
            },
            {
              title: "รวม",
              key: "total",
              width: 120,
              align: "right",
              render: (_, record) => 
                `฿${(Number(record.price) * record.quantity).toLocaleString()}`,
            },
          ]}
          summary={(pageData) => {
            const total = pageData.reduce(
              (sum, record) => sum + Number(record.price) * record.quantity,
              0
            );
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={3}>
                  <strong>รวมทั้งสิ้น</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell align="right">
                  <strong>฿{total.toLocaleString()}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
}