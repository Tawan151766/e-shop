// src/module/customer/order/OrderHistory.js
"use client";
import { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Image,
  Descriptions,
  Modal,
  Empty,
  Tabs,
} from "antd";
import {
  EyeOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function OrderHistory({ orders }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const router = useRouter();

  // Order Status Configuration
  const ORDER_STATUS = {
    PENDING_PAYMENT: { label: "รอชำระเงิน", color: "orange" },
    WAITING_CONFIRM: { label: "รอยืนยัน", color: "blue" },
    PAID: { label: "ชำระแล้ว", color: "green" },
    SHIPPING: { label: "กำลังจัดส่ง", color: "purple" },
    COMPLETED: { label: "เสร็จสิ้น", color: "success" },
    CANCELLED: { label: "ยกเลิก", color: "red" },
  };

  const getStatusConfig = (status) => ORDER_STATUS[status] || ORDER_STATUS.PENDING_PAYMENT;

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleTrackOrder = (orderId) => {
    router.push(`/order/track/${orderId}`);
  };

  // Filter orders by status
  const filteredOrders = activeTab === "ALL" 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const columns = [
    {
      title: "คำสั่งซื้อ",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id) => `#${id}`,
    },
    {
      title: "วันที่สั่งซื้อ",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('th-TH'),
    },
    {
      title: "จำนวนสินค้า",
      dataIndex: "orderItems",
      key: "itemCount",
      width: 120,
      render: (items) => `${items.length} รายการ`,
    },
    {
      title: "ยอดรวม",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (amount) => `฿${Number(amount).toLocaleString()}`,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewOrder(record)}
          >
            ดูรายละเอียด
          </Button>
          <Button
            icon={<ClockCircleOutlined />}
            size="small"
            onClick={() => handleTrackOrder(record.id)}
          >
            ติดตาม
          </Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: "ALL", label: "ทั้งหมด" },
    { key: "PENDING_PAYMENT", label: "รอชำระเงิน" },
    { key: "WAITING_CONFIRM", label: "รอยืนยัน" },
    { key: "PAID", label: "ชำระแล้ว" },
    { key: "SHIPPING", label: "กำลังจัดส่ง" },
    { key: "COMPLETED", label: "เสร็จสิ้น" },
    { key: "CANCELLED", label: "ยกเลิก" },
  ];

  if (!orders || orders.length === 0) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        <Card>
          <Empty 
            image={<ShoppingCartOutlined style={{ fontSize: 64, color: "#ccc" }} />}
            description="คุณยังไม่มีประวัติการสั่งซื้อ"
          >
            <Button 
              type="primary" 
              onClick={() => router.push("/")}
            >
              เริ่มช้อปปิ้ง
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <Card title="ประวัติการสั่งซื้อ">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`รายละเอียดคำสั่งซื้อ #${selectedOrder?.id}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setModalOpen(false)}>
            ปิด
          </Button>,
          <Button 
            key="track" 
            type="primary"
            onClick={() => {
              setModalOpen(false);
              handleTrackOrder(selectedOrder.id);
            }}
          >
            ติดตามคำสั่งซื้อ
          </Button>,
        ]}
      >
        {selectedOrder && (
          <div>
            {/* Order Information */}
            <Card title="ข้อมูลคำสั่งซื้อ" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="หมายเลขคำสั่งซื้อ">
                  #{selectedOrder.id}
                </Descriptions.Item>
                <Descriptions.Item label="สถานะ">
                  <Tag color={getStatusConfig(selectedOrder.status).color}>
                    {getStatusConfig(selectedOrder.status).label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="วันที่สั่งซื้อ">
                  {new Date(selectedOrder.createdAt).toLocaleString("th-TH")}
                </Descriptions.Item>
                <Descriptions.Item label="ยอดรวม">
                  ฿{Number(selectedOrder.totalAmount).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Order Items */}
            <Card title="รายการสินค้า" size="small">
              <Table
                dataSource={selectedOrder.orderItems}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "สินค้า",
                    key: "product",
                    render: (_, record) => (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Image
                          src={record.product.imageUrl}
                          alt={record.product.name}
                          width={50}
                          height={50}
                          style={{ marginRight: 12, objectFit: "cover" }}
                          fallback="/placeholder-image.png"
                        />
                        <span>{record.product.name}</span>
                      </div>
                    ),
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
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}