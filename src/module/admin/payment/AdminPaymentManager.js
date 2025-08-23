// src/module/admin/payment/AdminPaymentManager.js
"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  message,
  Space,
  Tag,
  Image,
  Descriptions,
  Card,
  Tabs,
} from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import PaymentStatistics from "./PaymentStatistics";

export default function AdminPaymentManager() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("WAITING");

  const fetchPayments = async (status = "WAITING") => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/payments", {
        params: { status, page: 1, pageSize: 50 }
      });
      setPayments(res.data.payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      message.error("โหลดข้อมูลไม่สำเร็จ");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(activeTab);
  }, [activeTab]);

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setModalOpen(true);
  };

  const handleConfirmPayment = async (paymentId, action) => {
    setConfirmLoading(true);
    try {
      await axios.post(`/api/admin/payments/${paymentId}/confirm`, {
        action
      });
      
      message.success(
        action === "confirm" 
          ? "ยืนยันการชำระเงินสำเร็จ" 
          : "ปฏิเสธการชำระเงินสำเร็จ"
      );
      
      setModalOpen(false);
      fetchPayments(activeTab);
    } catch (error) {
      message.error("ดำเนินการไม่สำเร็จ");
    } finally {
      setConfirmLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "WAITING": return "orange";
      case "CONFIRMED": return "green";
      case "REJECTED": return "red";
      default: return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "WAITING": return "รอตรวจสอบ";
      case "CONFIRMED": return "ยืนยันแล้ว";
      case "REJECTED": return "ปฏิเสธ";
      default: return status;
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "คำสั่งซื้อ",
      dataIndex: ["order", "id"],
      key: "orderId",
      width: 100,
      render: (_, record) => `#${record.order.id}`,
    },
    {
      title: "ลูกค้า",
      dataIndex: ["order", "customer", "name"],
      key: "customerName",
      width: 150,
    },
    {
      title: "ยอดเงิน",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount) => `฿${Number(amount).toLocaleString()}`,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "วันที่",
      dataIndex: "paymentDate",
      key: "paymentDate",
      width: 150,
      render: (date) => date ? new Date(date).toLocaleDateString('th-TH') : "-",
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewPayment(record)}
        >
          ดู
        </Button>
      ),
    },
  ];

  const tabItems = [
    { key: "WAITING", label: "รอตรวจสอบ" },
    { key: "CONFIRMED", label: "ยืนยันแล้ว" },
    { key: "REJECTED", label: "ปฏิเสธ" },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 16 
      }}>
        <h2>จัดการการชำระเงิน</h2>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={() => fetchPayments(activeTab)}
          loading={loading}
        >
          รีเฟรช
        </Button>
      </div>

      <PaymentStatistics />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginBottom: 16 }}
      />

      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 800 }}
      />

      {/* Payment Detail Modal */}
      <Modal
        title={`รายละเอียดการชำระเงิน #${selectedPayment?.id}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={800}
        footer={
          selectedPayment?.status === "WAITING" ? [
            <Button key="cancel" onClick={() => setModalOpen(false)}>
              ปิด
            </Button>,
            <Button
              key="reject"
              danger
              icon={<CloseOutlined />}
              loading={confirmLoading}
              onClick={() => handleConfirmPayment(selectedPayment.id, "reject")}
            >
              ปฏิเสธ
            </Button>,
            <Button
              key="confirm"
              type="primary"
              icon={<CheckOutlined />}
              loading={confirmLoading}
              onClick={() => handleConfirmPayment(selectedPayment.id, "confirm")}
            >
              ยืนยัน
            </Button>,
          ] : [
            <Button key="close" onClick={() => setModalOpen(false)}>
              ปิด
            </Button>,
          ]
        }
      >
        {selectedPayment && (
          <div>
            {/* Payment Information */}
            <Card title="ข้อมูลการชำระเงิน" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="หมายเลขการชำระ" span={1}>
                  {selectedPayment.id}
                </Descriptions.Item>
                <Descriptions.Item label="หมายเลขคำสั่งซื้อ" span={1}>
                  #{selectedPayment.order.id}
                </Descriptions.Item>
                <Descriptions.Item label="ยอดเงิน" span={1}>
                  ฿{Number(selectedPayment.amount).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="สถานะ" span={1}>
                  <Tag color={getStatusColor(selectedPayment.status)}>
                    {getStatusText(selectedPayment.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="วันที่อัปโหลด" span={1}>
                  {selectedPayment.paymentDate
                    ? new Date(selectedPayment.paymentDate).toLocaleString("th-TH")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="วันที่ยืนยัน" span={1}>
                  {selectedPayment.confirmedAt
                    ? new Date(selectedPayment.confirmedAt).toLocaleString("th-TH")
                    : "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Customer Information */}
            <Card title="ข้อมูลลูกค้า" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="ชื่อ" span={1}>
                  {selectedPayment.order.customer.name}
                </Descriptions.Item>
                <Descriptions.Item label="อีเมล" span={1}>
                  {selectedPayment.order.customer.email}
                </Descriptions.Item>
                <Descriptions.Item label="เบอร์โทร" span={1}>
                  {selectedPayment.order.customer.phone || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="ที่อยู่" span={1}>
                  {selectedPayment.order.customer.address || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Payment Slip */}
            {selectedPayment.slipUrl && (
              <Card title="สลิปการโอนเงิน">
                <div style={{ textAlign: "center" }}>
                  <Image
                    src={selectedPayment.slipUrl}
                    alt="Payment Slip"
                    style={{ maxWidth: "100%", maxHeight: 400 }}
                  />
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}