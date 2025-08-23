// src/module/admin/order/AdminOrderManager.js
"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  message,
  Space,
  Tag,
  Descriptions,
  Card,
  Tabs,
  Select,
  Timeline,
  Steps,
  Image,
  Alert,
  Divider,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import axios from "axios";
import OrderStatistics from "./OrderStatistics";

const { Option } = Select;

export default function AdminOrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [orderPayment, setOrderPayment] = useState(null);

  // Order Status Configuration
  const ORDER_STATUS = {
    PENDING_PAYMENT: { label: "รอชำระเงิน", color: "orange", step: 0 },
    WAITING_CONFIRM: { label: "รอยืนยัน", color: "blue", step: 1 },
    PAID: { label: "ชำระแล้ว", color: "green", step: 2 },
    SHIPPING: { label: "กำลังจัดส่ง", color: "purple", step: 3 },
    COMPLETED: { label: "เสร็จสิ้น", color: "success", step: 4 },
    CANCELLED: { label: "ยกเลิก", color: "red", step: -1 },
  };

  const fetchOrders = async (status = "ALL") => {
    setLoading(true);
    try {
      const params = status === "ALL" ? {} : { status };
      const res = await axios.get("/api/admin/orders", { params });
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("โหลดข้อมูลไม่สำเร็จ");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdateLoading(true);
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, {
        status: newStatus,
      });

      message.success("อัปเดตสถานะสำเร็จ");
      setModalOpen(false);
      fetchOrders(activeTab);
    } catch (error) {
      message.error("อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusConfig = (status) =>
    ORDER_STATUS[status] || ORDER_STATUS.PENDING_PAYMENT;

  const columns = [
    {
      title: "หมายเลขคำสั่งซื้อ",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id) => `#${id}`,
    },
    {
      title: "ลูกค้า",
      dataIndex: ["customer", "name"],
      key: "customerName",
      width: 150,
    },
    {
      title: "อีเมล",
      dataIndex: ["customer", "email"],
      key: "customerEmail",
      width: 200,
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
      title: "วันที่สั่งซื้อ",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
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
          {record.status === "WAITING_CONFIRM" && (
            <Tooltip title="ตรวจสอบการชำระเงิน">
              <Button
                type="default"
                icon={<CreditCardOutlined />}
                size="small"
                onClick={async () => {
                  setSelectedOrder(record);
                  // Fetch payment data for this order
                  try {
                    const paymentRes = await axios.get(
                      `/api/admin/payments?orderId=${record.id}`
                    );
                    setOrderPayment(paymentRes.data.payments?.[0] || null);
                  } catch (error) {
                    console.error("Error fetching payment:", error);
                    setOrderPayment(null);
                  }
                  setPaymentModalOpen(true);
                }}
              >
                ตรวจสอบ
              </Button>
            </Tooltip>
          )}
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

  const getOrderProgress = (status) => {
    const config = getStatusConfig(status);
    if (config.step === -1) return { current: 0, status: "error" };
    return { current: config.step, status: "process" };
  };

  const getNextStatusOptions = (currentStatus) => {
    const transitions = {
      PENDING_PAYMENT: ["WAITING_CONFIRM", "CANCELLED"],
      WAITING_CONFIRM: ["PAID", "CANCELLED"],
      PAID: ["SHIPPING", "CANCELLED"],
      SHIPPING: ["COMPLETED"],
      COMPLETED: [],
      CANCELLED: [],
    };
    return transitions[currentStatus] || [];
  };

  const handleVerifyPayment = async (orderId, verified = true) => {
    setPaymentVerifying(true);
    try {
      // Find payment record for this order
      const paymentRes = await axios.get(
        `/api/admin/payments?orderId=${orderId}`
      );
      const payment = paymentRes.data.payments?.[0];

      if (!payment) {
        message.error("ไม่พบข้อมูลการชำระเงิน");
        return;
      }

      // Update payment status using existing payment API
      const action = verified ? "confirm" : "reject";
      await axios.post(`/api/admin/payments/${payment.id}/confirm`, {
        action,
      });

      message.success(
        verified ? "ยืนยันการชำระเงินสำเร็จ" : "ปฏิเสธการชำระเงินสำเร็จ"
      );
      setPaymentModalOpen(false);
      setModalOpen(false);
      fetchOrders(activeTab);
    } catch (error) {
      console.error("Payment verification error:", error);
      message.error("ไม่สามารถดำเนินการได้");
    } finally {
      setPaymentVerifying(false);
    }
  };

  const getPaymentMethod = (payment) => {
    // In real app, payment method would be stored in payment record
    return "โอนเงินผ่านธนาคาร"; // Default for now
  };

  const getPaymentStatus = (order) => {
    if (order.status === "PENDING_PAYMENT") {
      return { status: "pending", text: "รอชำระเงิน", color: "orange" };
    } else if (order.status === "WAITING_CONFIRM") {
      return { status: "waiting", text: "รอตรวจสอบ", color: "blue" };
    } else if (order.status === "PAID") {
      return { status: "verified", text: "ยืนยันแล้ว", color: "green" };
    } else if (order.status === "CANCELLED") {
      return { status: "rejected", text: "ปฏิเสธ", color: "red" };
    }
    return { status: "unknown", text: "ไม่ทราบสถานะ", color: "default" };
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>จัดการคำสั่งซื้อ</h2>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchOrders(activeTab)}
          loading={loading}
        >
          รีเฟรช
        </Button>
      </div>

      <OrderStatistics />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginBottom: 16 }}
      />

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1000 }}
      />

      {/* Order Detail Modal */}
      <Modal
        title={`รายละเอียดคำสั่งซื้อ #${selectedOrder?.id}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setModalOpen(false)}>
            ปิด
          </Button>,
        ]}
      >
        {selectedOrder && (
          <div>
            {/* Order Progress */}
            <Card title="สถานะคำสั่งซื้อ" style={{ marginBottom: 16 }}>
              <Steps
                {...getOrderProgress(selectedOrder.status)}
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
                    title: "เสร็จสิ้น",
                    icon: <CheckCircleOutlined />,
                  },
                ]}
              />

              {/* Status Update */}
              <div style={{ marginTop: 16 }}>
                <Space>
                  <span>อัปเดตสถานะ:</span>
                  <Select
                    value={selectedOrder.status}
                    style={{ width: 200 }}
                    onChange={(value) =>
                      handleUpdateStatus(selectedOrder.id, value)
                    }
                    loading={updateLoading}
                  >
                    <Option value={selectedOrder.status} disabled>
                      {getStatusConfig(selectedOrder.status).label} (ปัจจุบัน)
                    </Option>
                    {getNextStatusOptions(selectedOrder.status).map(
                      (status) => (
                        <Option key={status} value={status}>
                          {getStatusConfig(status).label}
                        </Option>
                      )
                    )}
                  </Select>
                </Space>
              </div>
            </Card>

            {/* Payment Information */}
            {(selectedOrder.status === "WAITING_CONFIRM" ||
              selectedOrder.status === "PAID") && (
              <Card
                title={
                  <Space>
                    <CreditCardOutlined />
                    ข้อมูลการชำระเงิน
                  </Space>
                }
                style={{ marginBottom: 16 }}
                extra={
                  selectedOrder.status === "WAITING_CONFIRM" && (
                    <Button
                      type="primary"
                      icon={<CreditCardOutlined />}
                      onClick={async () => {
                        // Fetch payment data for this order
                        try {
                          const paymentRes = await axios.get(
                            `/api/admin/payments?orderId=${selectedOrder.id}`
                          );
                          setOrderPayment(
                            paymentRes.data.payments?.[0] || null
                          );
                        } catch (error) {
                          console.error("Error fetching payment:", error);
                          setOrderPayment(null);
                        }
                        setPaymentModalOpen(true);
                      }}
                    >
                      ตรวจสอบการชำระเงิน
                    </Button>
                  )
                }
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="สถานะการชำระเงิน">
                        <Tag color={getPaymentStatus(selectedOrder).color}>
                          {getPaymentStatus(selectedOrder).text}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="วิธีการชำระเงิน">
                        {orderPayment
                          ? getPaymentMethod(orderPayment)
                          : "ไม่ระบุ"}
                      </Descriptions.Item>
                      <Descriptions.Item label="จำนวนเงิน">
                        ฿{Number(selectedOrder.totalAmount).toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="วันที่ชำระเงิน">
                        {orderPayment?.paymentDate
                          ? new Date(orderPayment.paymentDate).toLocaleString(
                              "th-TH"
                            )
                          : "รอการชำระเงิน"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col span={12}>
                    {selectedOrder.status === "WAITING_CONFIRM" && (
                      <Alert
                        message="รอการตรวจสอบ"
                        description="ลูกค้าได้ทำการชำระเงินแล้ว กรุณาตรวจสอบการชำระเงินและยืนยัน"
                        type="warning"
                        showIcon
                        icon={<ExclamationCircleOutlined />}
                      />
                    )}
                    {selectedOrder.status === "PAID" && (
                      <Alert
                        message="ยืนยันการชำระเงินแล้ว"
                        description={`ยืนยันเมื่อ: ${
                          orderPayment?.confirmedAt
                            ? new Date(orderPayment.confirmedAt).toLocaleString(
                                "th-TH"
                              )
                            : "ไม่ทราบวันที่"
                        }`}
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                      />
                    )}
                  </Col>
                </Row>
              </Card>
            )}

            {/* Order Information */}
            <Card title="ข้อมูลคำสั่งซื้อ" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="หมายเลขคำสั่งซื้อ" span={1}>
                  #{selectedOrder.id}
                </Descriptions.Item>
                <Descriptions.Item label="สถานะ" span={1}>
                  <Tag color={getStatusConfig(selectedOrder.status).color}>
                    {getStatusConfig(selectedOrder.status).label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="ยอดรวม" span={1}>
                  ฿{Number(selectedOrder.totalAmount).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="วันที่สั่งซื้อ" span={1}>
                  {new Date(selectedOrder.createdAt).toLocaleString("th-TH")}
                </Descriptions.Item>
                <Descriptions.Item label="วันที่อัปเดต" span={1}>
                  {selectedOrder.updatedAt
                    ? new Date(selectedOrder.updatedAt).toLocaleString("th-TH")
                    : "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Customer Information */}
            <Card title="ข้อมูลลูกค้า" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="ชื่อ" span={1}>
                  {selectedOrder.customer.name}
                </Descriptions.Item>
                <Descriptions.Item label="อีเมล" span={1}>
                  {selectedOrder.customer.email}
                </Descriptions.Item>
                <Descriptions.Item label="เบอร์โทร" span={1}>
                  {selectedOrder.customer.phone || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="ที่อยู่" span={1}>
                  {selectedOrder.customer.address || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Order Items */}
            <Card title="รายการสินค้า">
              <Table
                dataSource={selectedOrder.orderItems}
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
                  },
                  {
                    title: "ราคา/หน่วย",
                    dataIndex: "price",
                    key: "price",
                    width: 120,
                    render: (price) => `฿${Number(price).toLocaleString()}`,
                  },
                  {
                    title: "รวม",
                    key: "total",
                    width: 120,
                    render: (_, record) =>
                      `฿${(
                        Number(record.price) * record.quantity
                      ).toLocaleString()}`,
                  },
                ]}
              />
            </Card>
          </div>
        )}
      </Modal>

      {/* Payment Verification Modal */}
      <Modal
        title={
          <Space>
            <CreditCardOutlined />
            ตรวจสอบการชำระเงิน - คำสั่งซื้อ #{selectedOrder?.id}
          </Space>
        }
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setPaymentModalOpen(false)}>
            ปิด
          </Button>,
          <Button
            key="reject"
            danger
            loading={paymentVerifying}
            onClick={() => handleVerifyPayment(selectedOrder?.id, false)}
          >
            ปฏิเสธการชำระเงิน
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={paymentVerifying}
            onClick={() => handleVerifyPayment(selectedOrder?.id, true)}
          >
            ยืนยันการชำระเงิน
          </Button>,
        ]}
      >
        {selectedOrder && (
          <div>
            {/* Payment Summary */}
            <Card title="สรุปการชำระเงิน" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="หมายเลขคำสั่งซื้อ">
                      #{selectedOrder.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="ลูกค้า">
                      {selectedOrder.customer.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="อีเมล">
                      {selectedOrder.customer.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="เบอร์โทร">
                      {selectedOrder.customer.phone || "-"}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="จำนวนเงินที่ต้องชำระ">
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#1890ff",
                        }}
                      >
                        ฿{Number(selectedOrder.totalAmount).toLocaleString()}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="วิธีการชำระเงิน">
                      {orderPayment
                        ? getPaymentMethod(orderPayment)
                        : "ไม่ระบุ"}
                    </Descriptions.Item>
                    <Descriptions.Item label="วันที่สั่งซื้อ">
                      {new Date(selectedOrder.createdAt).toLocaleString(
                        "th-TH"
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="สถานะปัจจุบัน">
                      <Tag color={getPaymentStatus(selectedOrder).color}>
                        {getPaymentStatus(selectedOrder).text}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            {/* Payment Evidence */}
            <Card title="หลักฐานการชำระเงิน" style={{ marginBottom: 16 }}>
              {!orderPayment && (
                <Alert
                  message="ไม่พบข้อมูลการชำระเงิน"
                  description="ลูกค้ายังไม่ได้อัปโหลดหลักฐานการชำระเงิน"
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" title="สลิปการโอนเงิน">
                    {orderPayment?.slipUrl ? (
                      <div style={{ textAlign: "center" }}>
                        <Image
                          src={orderPayment.slipUrl}
                          alt="Payment Slip"
                          style={{ maxWidth: "100%", maxHeight: 200 }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          height: 200,
                          border: "2px dashed #d9d9d9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                          color: "#999",
                        }}
                      >
                        <FileImageOutlined
                          style={{ fontSize: 48, marginBottom: 8 }}
                        />
                        <span>ไม่มีรูปภาพ</span>
                        <small>(รอลูกค้าอัปโหลดสลิป)</small>
                      </div>
                    )}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="ข้อมูลการชำระเงิน">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="หมายเลขการชำระ">
                        {orderPayment?.id || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="จำนวนเงิน">
                        ฿
                        {orderPayment
                          ? Number(orderPayment.amount).toLocaleString()
                          : "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="สถานะ">
                        {orderPayment ? (
                          <Tag
                            color={
                              orderPayment.status === "WAITING"
                                ? "orange"
                                : orderPayment.status === "CONFIRMED"
                                ? "green"
                                : "red"
                            }
                          >
                            {orderPayment.status === "WAITING"
                              ? "รอตรวจสอบ"
                              : orderPayment.status === "CONFIRMED"
                              ? "ยืนยันแล้ว"
                              : "ปฏิเสธ"}
                          </Tag>
                        ) : (
                          "-"
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="วันที่อัปโหลด">
                        {orderPayment?.paymentDate
                          ? new Date(orderPayment.paymentDate).toLocaleString(
                              "th-TH"
                            )
                          : "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="วันที่ยืนยัน">
                        {orderPayment?.confirmedAt
                          ? new Date(orderPayment.confirmedAt).toLocaleString(
                              "th-TH"
                            )
                          : "-"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* Verification Actions */}
            <Card title="การดำเนินการ">
              <Alert
                message="คำแนะนำในการตรวจสอบ"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>ตรวจสอบจำนวนเงินให้ตรงกับยอดคำสั่งซื้อ</li>
                    <li>ตรวจสอบวันที่และเวลาการโอนเงิน</li>
                    <li>ตรวจสอบเลขที่บัญชีปลายทาง</li>
                    <li>ตรวจสอบชื่อผู้โอนเงินให้ตรงกับชื่อลูกค้า</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  loading={paymentVerifying}
                  disabled={!orderPayment || orderPayment.status !== "WAITING"}
                  onClick={() => handleVerifyPayment(selectedOrder.id, true)}
                >
                  ยืนยันการชำระเงิน
                </Button>
                <Button
                  danger
                  size="large"
                  icon={<ExclamationCircleOutlined />}
                  loading={paymentVerifying}
                  disabled={!orderPayment || orderPayment.status !== "WAITING"}
                  onClick={() => handleVerifyPayment(selectedOrder.id, false)}
                >
                  ปฏิเสธการชำระเงิน
                </Button>
              </Space>

              {!orderPayment && (
                <Alert
                  message="ไม่สามารถดำเนินการได้"
                  description="ลูกค้ายังไม่ได้อัปโหลดหลักฐานการชำระเงิน"
                  type="warning"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}

              {orderPayment && orderPayment.status !== "WAITING" && (
                <Alert
                  message="ดำเนินการแล้ว"
                  description={`การชำระเงินนี้ได้รับการ${
                    orderPayment.status === "CONFIRMED" ? "ยืนยัน" : "ปฏิเสธ"
                  }แล้ว`}
                  type={
                    orderPayment.status === "CONFIRMED" ? "success" : "error"
                  }
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
