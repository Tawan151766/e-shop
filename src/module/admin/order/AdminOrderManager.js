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
  Form,
  Input,
  Badge,
  Spin,
  Empty,
  Typography,
  Popconfirm,
  notification,
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
  CarOutlined,
  SendOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import OrderStatistics from "./OrderStatistics";

const { Option } = Select;
const { Title, Text } = Typography;

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
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [orderShipping, setOrderShipping] = useState(null);
  const [shippingForm] = Form.useForm();
  const [refreshing, setRefreshing] = useState(false);

  // Order Status Configuration
  const ORDER_STATUS = {
    PENDING_PAYMENT: { label: "รอชำระเงิน", color: "orange", step: 0 },
    WAITING_CONFIRM: { label: "รอยืนยัน", color: "blue", step: 1 },
    PAID: { label: "ชำระแล้ว", color: "green", step: 2 },
    SHIPPING: { label: "กำลังจัดส่ง", color: "purple", step: 3 },
    COMPLETED: { label: "เสร็จสิ้น", color: "success", step: 4 },
    CANCELLED: { label: "ยกเลิก", color: "red", step: -1 },
  };

  // Shipping Status Configuration
  const SHIPPING_STATUS = {
    PREPARING: { label: "เตรียมสินค้า", color: "orange" },
    SHIPPED: { label: "จัดส่งแล้ว", color: "blue" },
    DELIVERED: { label: "จัดส่งสำเร็จ", color: "green" },
  };

  // Courier Options
  const COURIERS = [
    "Thailand Post",
    "Kerry Express",
    "J&T Express",
    "Flash Express",
    "Ninja Van",
    "DHL",
    "FedEx",
    "UPS",
  ];

  const fetchOrders = async (status = "ALL", showRefreshMessage = false) => {
    if (showRefreshMessage) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const params = status === "ALL" ? {} : { status };
      const res = await axios.get("/api/admin/orders", { params });
      setOrders(res.data.orders || []);
      
      if (showRefreshMessage) {
        message.success("รีเฟรชข้อมูลสำเร็จ");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

      notification.success({
        message: "อัปเดตสถานะสำเร็จ",
        description: `เปลี่ยนสถานะคำสั่งซื้อ #${orderId} เป็น ${getStatusConfig(newStatus).label}`,
        placement: "topRight",
      });
      
      setModalOpen(false);
      fetchOrders(activeTab);
    } catch (error) {
      console.error("Status update error:", error);
      notification.error({
        message: "อัปเดตสถานะไม่สำเร็จ",
        description: "กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง",
        placement: "topRight",
      });
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
      width: 140,
      render: (id) => (
        <Text strong style={{ color: "#1890ff" }}>
          #{id}
        </Text>
      ),
    },
    {
      title: "ข้อมูลลูกค้า",
      key: "customer",
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <UserOutlined style={{ marginRight: 6, color: "#666" }} />
            <Text strong>{record.customer.name}</Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            <MailOutlined style={{ marginRight: 6, color: "#666", fontSize: 12 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.customer.email}
            </Text>
          </div>
          {record.customer.phone && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <PhoneOutlined style={{ marginRight: 6, color: "#666", fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.customer.phone}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "ยอดรวม",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (amount) => (
        <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
          ฿{Number(amount).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => {
        const config = getStatusConfig(status);
        const needsAttention = status === "WAITING_CONFIRM";
        return (
          <Badge dot={needsAttention} color="red">
            <Tag color={config.color} style={{ fontWeight: 500 }}>
              {config.label}
            </Tag>
          </Badge>
        );
      },
    },
    {
      title: "วันที่สั่งซื้อ",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date) => (
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <CalendarOutlined style={{ marginRight: 6, color: "#666" }} />
            <Text>{new Date(date).toLocaleDateString("th-TH")}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {new Date(date).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </div>
      ),
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      width: 280,
      render: (_, record) => (
        <Space wrap>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewOrder(record)}
          >
            ดูรายละเอียด
          </Button>
          {record.status === "WAITING_CONFIRM" && (
            <Tooltip title="ตรวจสอบการชำระเงิน - ต้องดำเนินการ">
              <Button
                type="default"
                icon={<CreditCardOutlined />}
                size="small"
                style={{ 
                  borderColor: "#faad14", 
                  color: "#faad14",
                  animation: "pulse 2s infinite"
                }}
                onClick={async () => {
                  setSelectedOrder(record);
                  setPaymentModalOpen(true);
                  
                  // Show loading in modal while fetching payment data
                  setOrderPayment(null);
                  
                  try {
                    const paymentRes = await axios.get(
                      `/api/admin/payments?orderId=${record.id}`
                    );
                    setOrderPayment(paymentRes.data.payments?.[0] || null);
                  } catch (error) {
                    console.error("Error fetching payment:", error);
                    setOrderPayment(null);
                    message.error("ไม่สามารถโหลดข้อมูลการชำระเงินได้");
                  }
                }}
              >
                ตรวจสอบ
              </Button>
            </Tooltip>
          )}
          {(record.status === "PAID" || record.status === "SHIPPING") && (
            <Tooltip title="จัดการการจัดส่ง">
              <Button
                type="default"
                icon={<TruckOutlined />}
                size="small"
                loading={shippingLoading}
                onClick={() => handleCreateShipping(record.id)}
              >
                จัดส่ง
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const getTabCount = (status) => {
    if (status === "ALL") return orders.length;
    return orders.filter(order => order.status === status).length;
  };

  const tabItems = [
    { 
      key: "ALL", 
      label: (
        <Badge count={orders.length} showZero>
          <span>ทั้งหมด</span>
        </Badge>
      )
    },
    { 
      key: "PENDING_PAYMENT", 
      label: (
        <Badge count={orders.filter(o => o.status === "PENDING_PAYMENT").length} showZero>
          <span>รอชำระเงิน</span>
        </Badge>
      )
    },
    { 
      key: "WAITING_CONFIRM", 
      label: (
        <Badge 
          count={orders.filter(o => o.status === "WAITING_CONFIRM").length} 
          showZero
          style={{ backgroundColor: '#faad14' }}
        >
          <span>รอยืนยัน</span>
        </Badge>
      )
    },
    { 
      key: "PAID", 
      label: (
        <Badge count={orders.filter(o => o.status === "PAID").length} showZero>
          <span>ชำระแล้ว</span>
        </Badge>
      )
    },
    { 
      key: "SHIPPING", 
      label: (
        <Badge count={orders.filter(o => o.status === "SHIPPING").length} showZero>
          <span>กำลังจัดส่ง</span>
        </Badge>
      )
    },
    { 
      key: "COMPLETED", 
      label: (
        <Badge count={orders.filter(o => o.status === "COMPLETED").length} showZero>
          <span>เสร็จสิ้น</span>
        </Badge>
      )
    },
    { 
      key: "CANCELLED", 
      label: (
        <Badge count={orders.filter(o => o.status === "CANCELLED").length} showZero>
          <span>ยกเลิก</span>
        </Badge>
      )
    },
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
        notification.error({
          message: "ไม่พบข้อมูลการชำระเงิน",
          description: "กรุณาตรวจสอบว่าลูกค้าได้อัปโหลดหลักฐานการชำระเงินแล้ว",
          placement: "topRight",
        });
        return;
      }

      // Update payment status using existing payment API
      const action = verified ? "confirm" : "reject";
      await axios.post(`/api/admin/payments/${payment.id}/confirm`, {
        action,
      });

      notification.success({
        message: verified ? "ยืนยันการชำระเงินสำเร็จ" : "ปฏิเสธการชำระเงินสำเร็จ",
        description: verified 
          ? `คำสั่งซื้อ #${orderId} ได้รับการยืนยันการชำระเงินแล้ว สถานะเปลี่ยนเป็น "ชำระแล้ว"`
          : `คำสั่งซื้อ #${orderId} ถูกปฏิเสธการชำระเงิน สถานะเปลี่ยนเป็น "ยกเลิก"`,
        placement: "topRight",
        duration: 5,
      });
      
      setPaymentModalOpen(false);
      setModalOpen(false);
      fetchOrders(activeTab);
    } catch (error) {
      console.error("Payment verification error:", error);
      notification.error({
        message: "ไม่สามารถดำเนินการได้",
        description: error.response?.data?.error || "เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง",
        placement: "topRight",
      });
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

  const handleCreateShipping = async (orderId) => {
    setShippingLoading(true);
    try {
      // Fetch shipping data for this order
      const shippingRes = await axios.get(
        `/api/admin/shipping?orderId=${orderId}`
      );
      setOrderShipping(shippingRes.data.shippings?.[0] || null);

      // Reset form
      shippingForm.resetFields();
      if (shippingRes.data.shippings?.[0]) {
        shippingForm.setFieldsValue({
          courier: shippingRes.data.shippings[0].courier,
          trackingNumber: shippingRes.data.shippings[0].trackingNumber,
          status: shippingRes.data.shippings[0].status,
        });
      }

      setSelectedOrder(orders.find((o) => o.id === orderId));
      setShippingModalOpen(true);
    } catch (error) {
      console.error("Error fetching shipping:", error);
      setOrderShipping(null);
      setSelectedOrder(orders.find((o) => o.id === orderId));
      setShippingModalOpen(true);
    } finally {
      setShippingLoading(false);
    }
  };

  const handleSaveShipping = async (values) => {
    setShippingLoading(true);
    try {
      if (orderShipping) {
        // Update existing shipping
        await axios.put(`/api/admin/shipping/${orderShipping.id}`, values);
        message.success("อัปเดตข้อมูลการจัดส่งสำเร็จ");
      } else {
        // Create new shipping
        await axios.post("/api/admin/shipping", {
          ...values,
          orderId: selectedOrder.id,
        });
        message.success("สร้างข้อมูลการจัดส่งสำเร็จ");
      }

      setShippingModalOpen(false);
      fetchOrders(activeTab);
    } catch (error) {
      console.error("Shipping save error:", error);
      message.error("บันทึกข้อมูลการจัดส่งไม่สำเร็จ");
    } finally {
      setShippingLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Card 
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: "16px 24px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              <ShoppingOutlined style={{ marginRight: 12 }} />
              จัดการคำสั่งซื้อ
            </Title>
            <Text type="secondary">
              ระบบจัดการคำสั่งซื้อ การตรวจสอบการชำระเงิน และการจัดส่ง
            </Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={() => fetchOrders(activeTab, true)}
              loading={refreshing}
              type="default"
            >
              รีเฟรช
            </Button>
          </Space>
        </div>
      </Card>

      <OrderStatistics />

      <Card style={{ marginBottom: 24 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          style={{ marginBottom: 0 }}
        />
      </Card>

      <Card>
        {orders.length === 0 && !loading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text type="secondary">ไม่พบคำสั่งซื้อ</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {activeTab === "ALL" 
                    ? "ยังไม่มีคำสั่งซื้อในระบบ" 
                    : `ไม่มีคำสั่งซื้อในสถานะ "${tabItems.find(t => t.key === activeTab)?.label}"`
                  }
                </Text>
              </div>
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} จาก ${total} รายการ`,
            }}
            scroll={{ x: 1200 }}
            size="middle"
            rowClassName={(record) => 
              record.status === "WAITING_CONFIRM" ? "highlight-row" : ""
            }
          />
        )}
      </Card>

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
            <Card 
              title={
                <Space>
                  <UserOutlined />
                  ข้อมูลลูกค้า
                </Space>
              } 
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item 
                      label={
                        <Space>
                          <UserOutlined />
                          ชื่อ
                        </Space>
                      }
                    >
                      <Text strong>{selectedOrder.customer.name}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item 
                      label={
                        <Space>
                          <MailOutlined />
                          อีเมล
                        </Space>
                      }
                    >
                      <Text copyable>{selectedOrder.customer.email}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item 
                      label={
                        <Space>
                          <PhoneOutlined />
                          เบอร์โทร
                        </Space>
                      }
                    >
                      <Text copyable={!!selectedOrder.customer.phone}>
                        {selectedOrder.customer.phone || "-"}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item 
                      label={
                        <Space>
                          <HomeOutlined />
                          ที่อยู่
                        </Space>
                      }
                    >
                      <Text>{selectedOrder.customer.address || "ไม่ได้ระบุ"}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <CreditCardOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                ตรวจสอบการชำระเงิน
              </Title>
              <Text type="secondary">คำสั่งซื้อ #{selectedOrder?.id}</Text>
            </div>
          </div>
        }
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setPaymentModalOpen(false)}>
            ปิด
          </Button>,
          <Popconfirm
            key="reject"
            title="ปฏิเสธการชำระเงิน"
            description="คุณแน่ใจหรือไม่ที่จะปฏิเสธการชำระเงินนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้"
            onConfirm={() => handleVerifyPayment(selectedOrder?.id, false)}
            okText="ยืนยันปฏิเสธ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              loading={paymentVerifying}
              icon={<ExclamationCircleOutlined />}
            >
              ปฏิเสธการชำระเงิน
            </Button>
          </Popconfirm>,
          <Popconfirm
            key="approve"
            title="ยืนยันการชำระเงิน"
            description="คุณแน่ใจหรือไม่ที่จะยืนยันการชำระเงินนี้?"
            onConfirm={() => handleVerifyPayment(selectedOrder?.id, true)}
            okText="ยืนยัน"
            cancelText="ยกเลิก"
            okButtonProps={{ type: "primary" }}
          >
            <Button
              type="primary"
              loading={paymentVerifying}
              icon={<CheckCircleOutlined />}
            >
              ยืนยันการชำระเงิน
            </Button>
          </Popconfirm>,
        ]}
      >
        {selectedOrder && (
          <Spin spinning={orderPayment === null && paymentModalOpen} tip="กำลังโหลดข้อมูลการชำระเงิน...">
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
            <Card 
              title={
                <Space>
                  <FileImageOutlined />
                  หลักฐานการชำระเงิน
                </Space>
              } 
              style={{ marginBottom: 16 }}
            >
              {!orderPayment && (
                <Alert
                  message="ไม่พบข้อมูลการชำระเงิน"
                  description="ลูกค้ายังไม่ได้อัปโหลดหลักฐานการชำระเงิน กรุณาติดต่อลูกค้าเพื่อขอหลักฐานการชำระเงิน"
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginBottom: 16 }}
                />
              )}

              <Row gutter={16}>
                <Col span={12}>
                  <Card 
                    size="small" 
                    title={
                      <Space>
                        <FileImageOutlined />
                        สลิปการโอนเงิน
                      </Space>
                    }
                    style={{ height: 300 }}
                  >
                    {orderPayment?.slipUrl ? (
                      <div style={{ textAlign: "center" }}>
                        <Image
                          src={orderPayment.slipUrl}
                          alt="Payment Slip"
                          style={{ 
                            maxWidth: "100%", 
                            maxHeight: 220,
                            borderRadius: 4,
                            border: "1px solid #d9d9d9"
                          }}
                          preview={{
                            mask: (
                              <div style={{ color: "white" }}>
                                <EyeOutlined style={{ marginRight: 4 }} />
                                ดูรูปเต็ม
                              </div>
                            )
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          height: 220,
                          border: "2px dashed #d9d9d9",
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                          color: "#999",
                          backgroundColor: "#fafafa"
                        }}
                      >
                        <FileImageOutlined
                          style={{ fontSize: 48, marginBottom: 8, color: "#d9d9d9" }}
                        />
                        <Text type="secondary">ไม่มีรูปภาพ</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          รอลูกค้าอัปโหลดสลิป
                        </Text>
                      </div>
                    )}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card 
                    size="small" 
                    title={
                      <Space>
                        <InfoCircleOutlined />
                        ข้อมูลการชำระเงิน
                      </Space>
                    }
                    style={{ height: 300 }}
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="หมายเลขการชำระ">
                        <Text code>{orderPayment?.id || "-"}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="จำนวนเงิน">
                        <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                          ฿{orderPayment
                            ? Number(orderPayment.amount).toLocaleString()
                            : "-"}
                        </Text>
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
                            style={{ fontWeight: 500 }}
                          >
                            {orderPayment.status === "WAITING"
                              ? "รอตรวจสอบ"
                              : orderPayment.status === "CONFIRMED"
                              ? "ยืนยันแล้ว"
                              : "ปฏิเสธ"}
                          </Tag>
                        ) : (
                          <Text type="secondary">-</Text>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="วันที่อัปโหลด">
                        <Space>
                          <CalendarOutlined />
                          <Text>
                            {orderPayment?.paymentDate
                              ? new Date(orderPayment.paymentDate).toLocaleString("th-TH")
                              : "-"}
                          </Text>
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="วันที่ยืนยัน">
                        <Space>
                          <CalendarOutlined />
                          <Text>
                            {orderPayment?.confirmedAt
                              ? new Date(orderPayment.confirmedAt).toLocaleString("th-TH")
                              : "ยังไม่ได้ยืนยัน"}
                          </Text>
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* Verification Actions */}
            <Card 
              title={
                <Space>
                  <CheckCircleOutlined />
                  การดำเนินการ
                </Space>
              }
            >
              <Alert
                message="คำแนะนำในการตรวจสอบการชำระเงิน"
                description={
                  <div>
                    <Text strong style={{ color: "#1890ff" }}>
                      กรุณาตรวจสอบข้อมูลต่อไปนี้ก่อนยืนยัน:
                    </Text>
                    <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                      <li>
                        <Text>จำนวนเงินให้ตรงกับยอดคำสั่งซื้อ </Text>
                        <Text strong style={{ color: "#52c41a" }}>
                          (฿{Number(selectedOrder?.totalAmount || 0).toLocaleString()})
                        </Text>
                      </li>
                      <li>ตรวจสอบวันที่และเวลาการโอนเงิน</li>
                      <li>ตรวจสอบเลขที่บัญชีปลายทาง</li>
                      <li>ตรวจสอบชื่อผู้โอนเงินให้ตรงกับชื่อลูกค้า</li>
                      <li>ตรวจสอบความชัดเจนของสลิปการโอนเงิน</li>
                    </ul>
                  </div>
                }
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{ marginBottom: 16 }}
              />

              {orderPayment?.slipUrl ? (
                <Alert
                  message="พร้อมสำหรับการตรวจสอบ"
                  description="ลูกค้าได้อัปโหลดหลักฐานการชำระเงินแล้ว กรุณาตรวจสอบและดำเนินการ"
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              ) : (
                <Alert
                  message="รอหลักฐานการชำระเงิน"
                  description="ลูกค้ายังไม่ได้อัปโหลดหลักฐานการชำระเงิน กรุณาติดต่อลูกค้าหรือรอการอัปโหลด"
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <div style={{ textAlign: "center", marginTop: 24 }}>
                <Space size="large">
                  <Text type="secondary">
                    การดำเนินการนี้จะส่งผลต่อสถานะคำสั่งซื้อและไม่สามารถยกเลิกได้
                  </Text>
                </Space>
              </div>
            </Card>
            </div>
          </Spin>
        )}
      </Modal>

      {/* Shipping Management Modal */}
      <Modal
        title={
          <Space>
            <TruckOutlined />
            จัดการการจัดส่ง - คำสั่งซื้อ #{selectedOrder?.id}
          </Space>
        }
        open={shippingModalOpen}
        onCancel={() => setShippingModalOpen(false)}
        width={600}
        footer={null}
      >
        {selectedOrder && (
          <div>
            {/* Order Summary */}
            <Card title="ข้อมูลคำสั่งซื้อ" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="หมายเลขคำสั่งซื้อ">
                  #{selectedOrder.id}
                </Descriptions.Item>
                <Descriptions.Item label="ลูกค้า">
                  {selectedOrder.customer.name}
                </Descriptions.Item>
                <Descriptions.Item label="อีเมล">
                  {selectedOrder.customer.email}
                </Descriptions.Item>
                <Descriptions.Item label="ยอดรวม">
                  ฿{Number(selectedOrder.totalAmount).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="ที่อยู่จัดส่ง" span={2}>
                  {selectedOrder.customer.address || "ไม่ได้ระบุ"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Shipping Form */}
            <Card
              title={
                orderShipping ? "แก้ไขข้อมูลการจัดส่ง" : "สร้างข้อมูลการจัดส่ง"
              }
            >
              <Form
                form={shippingForm}
                layout="vertical"
                onFinish={handleSaveShipping}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="บริษัทขนส่ง"
                      name="courier"
                      rules={[
                        { required: true, message: "กรุณาเลือกบริษัทขนส่ง" },
                      ]}
                    >
                      <Select placeholder="เลือกบริษัทขนส่ง">
                        {COURIERS.map((courier) => (
                          <Select.Option key={courier} value={courier}>
                            {courier}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="หมายเลขติดตาม" name="trackingNumber">
                      <Input placeholder="ใส่หมายเลขติดตาม" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="สถานะการจัดส่ง"
                  name="status"
                  initialValue="PREPARING"
                  rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
                >
                  <Select>
                    <Select.Option value="PREPARING">
                      <Space>
                        <ClockCircleOutlined />
                        เตรียมสินค้า
                      </Space>
                    </Select.Option>
                    <Select.Option value="SHIPPED">
                      <Space>
                        <SendOutlined />
                        จัดส่งแล้ว
                      </Space>
                    </Select.Option>
                    <Select.Option value="DELIVERED">
                      <Space>
                        <CheckCircleOutlined />
                        จัดส่งสำเร็จ
                      </Space>
                    </Select.Option>
                  </Select>
                </Form.Item>

                {/* Current Shipping Info */}
                {orderShipping && (
                  <Alert
                    message="ข้อมูลการจัดส่งปัจจุบัน"
                    description={
                      <div>
                        <p>
                          <strong>บริษัทขนส่ง:</strong>{" "}
                          {orderShipping.courier || "-"}
                        </p>
                        <p>
                          <strong>หมายเลขติดตาม:</strong>{" "}
                          {orderShipping.trackingNumber || "-"}
                        </p>
                        <p>
                          <strong>สถานะ:</strong>
                          <Tag
                            color={SHIPPING_STATUS[orderShipping.status]?.color}
                            style={{ marginLeft: 8 }}
                          >
                            {SHIPPING_STATUS[orderShipping.status]?.label}
                          </Tag>
                        </p>
                        <p>
                          <strong>สร้างเมื่อ:</strong>{" "}
                          {new Date(orderShipping.createdAt).toLocaleString(
                            "th-TH"
                          )}
                        </p>
                      </div>
                    }
                    type="info"
                    style={{ marginBottom: 16 }}
                  />
                )}

                <div style={{ textAlign: "right" }}>
                  <Space>
                    <Button onClick={() => setShippingModalOpen(false)}>
                      ยกเลิก
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={shippingLoading}
                      icon={<TruckOutlined />}
                    >
                      {orderShipping ? "อัปเดต" : "สร้าง"}การจัดส่ง
                    </Button>
                  </Space>
                </div>
              </Form>
            </Card>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .highlight-row {
          background-color: #fff7e6 !important;
          border-left: 4px solid #faad14;
        }
        
        .highlight-row:hover {
          background-color: #fff1b8 !important;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(250, 173, 20, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(250, 173, 20, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(250, 173, 20, 0);
          }
        }
        
        .ant-table-tbody > tr.highlight-row > td {
          border-bottom: 1px solid #ffe58f;
        }
        
        .ant-badge-count {
          font-size: 10px;
          min-width: 16px;
          height: 16px;
          line-height: 16px;
        }
        
        .ant-tabs-tab {
          padding: 8px 16px !important;
        }
        
        .ant-card {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border-radius: 8px;
        }
        
        .ant-modal-header {
          border-radius: 8px 8px 0 0;
        }
        
        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
