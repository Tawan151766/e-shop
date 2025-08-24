"use client";
import { useEffect, useState } from "react";
import {
  Modal,
  message,
  Space,
  Tag,
  Descriptions,
  Card,
  Tabs,
  Select,
  Steps,
  Image,
  Alert,
  Row,
  Col,
  Form,
  Input,
  Badge,
  Spin,
  Typography,
  Popconfirm,
  notification,
  Button,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  ExclamationCircleOutlined,
  FileImageOutlined,
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
  const [searchTerm, setSearchTerm] = useState("");

  // Order Status Configuration
  const ORDER_STATUS = {
    PENDING_PAYMENT: {
      label: "Pending Payment",
      color: "bg-orange-100 text-orange-800",
      step: 0,
    },
    WAITING_CONFIRM: {
      label: "Awaiting Confirmation",
      color: "bg-blue-100 text-blue-800",
      step: 1,
    },
    PAID: { label: "Paid", color: "bg-green-100 text-green-800", step: 2 },
    SHIPPING: {
      label: "Shipping",
      color: "bg-purple-100 text-purple-800",
      step: 3,
    },
    COMPLETED: {
      label: "Completed",
      color: "bg-gray-100 text-gray-800",
      step: 4,
    },
    CANCELLED: {
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
      step: -1,
    },
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
        description: `เปลี่ยนสถานะคำสั่งซื้อ #${orderId} เป็น ${
          getStatusConfig(newStatus).label
        }`,
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

  const handleVerifyPayment = async (orderId, verified = true) => {
    setPaymentVerifying(true);
    try {
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

      const action = verified ? "confirm" : "reject";
      await axios.post(`/api/admin/payments/${payment.id}/confirm`, {
        action,
      });

      notification.success({
        message: verified
          ? "ยืนยันการชำระเงินสำเร็จ"
          : "ปฏิเสธการชำระเงินสำเร็จ",
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
        description:
          error.response?.data?.error ||
          "เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง",
        placement: "topRight",
      });
    } finally {
      setPaymentVerifying(false);
    }
  };

  const getPaymentMethod = (payment) => {
    return "โอนเงินผ่านธนาคาร";
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
      const shippingRes = await axios.get(
        `/api/admin/shipping?orderId=${orderId}`
      );
      setOrderShipping(shippingRes.data.shippings?.[0] || null);

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
        await axios.put(`/api/admin/shipping/${orderShipping.id}`, values);
        message.success("อัปเดตข้อมูลการจัดส่งสำเร็จ");
      } else {
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

  // Filter orders based on search term
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toString().includes(searchTerm) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="px-40 flex flex-1 justify-center py-5 bg-gray-50 min-h-screen">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <ShoppingOutlined className="text-blue-600 text-3xl" />
            <h1 className="text-[#0d131c] tracking-light text-[32px] font-bold leading-tight min-w-72">
              Orders
            </h1>
          </div>
          <button
            className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              refreshing ? "opacity-75" : ""
            }`}
            onClick={() => fetchOrders(activeTab, true)}
            disabled={refreshing}
          >
            <ReloadOutlined className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#476d9e] flex border-none bg-[#e6ecf4] items-center justify-center pl-4 rounded-l-lg border-r-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24px"
                  height="24px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>
              <input
                placeholder="Search orders"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d131c] focus:outline-0 focus:ring-0 border-none bg-[#e6ecf4] focus:border-none h-full placeholder:text-[#476d9e] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </label>
        </div>

        {/* Status Tabs */}
        <div className="px-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: "ALL", label: "All" },
              { key: "PENDING_PAYMENT", label: "Pending Payment" },
              { key: "WAITING_CONFIRM", label: "Awaiting Confirmation" },
              { key: "PAID", label: "Paid" },
              { key: "SHIPPING", label: "Shipping" },
              { key: "COMPLETED", label: "Completed" },
              { key: "CANCELLED", label: "Cancelled" },
            ].map((tab) => {
              const count =
                tab.key === "ALL"
                  ? filteredOrders.length
                  : filteredOrders.filter((o) => o.status === tab.key).length;

              return (
                <button
                  key={tab.key}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        activeTab === tab.key
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Table */}
        <div className="px-4 py-3">
          <div className="flex overflow-hidden rounded-lg border border-[#ced9e9] bg-slate-50">
            <div className="flex-1 overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-[#0d131c] text-sm font-medium leading-normal">
                      Order Number
                    </th>
                    <th className="px-4 py-3 text-left text-[#0d131c] text-sm font-medium leading-normal">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-[#0d131c] text-sm font-medium leading-normal">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-[#0d131c] text-sm font-medium leading-normal">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-[#0d131c] text-sm font-medium leading-normal">
                      Order Date
                    </th>
                    <th className="px-4 py-3 text-left text-[#476d9e] text-sm font-medium leading-normal">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-gray-600">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        {searchTerm
                          ? "No orders found matching your search."
                          : "No orders available."}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      const needsAttention = order.status === "WAITING_CONFIRM";

                      return (
                        <tr
                          key={order.id}
                          className={`border-t border-t-[#ced9e9] hover:bg-gray-50 ${
                            needsAttention
                              ? "bg-orange-50 border-l-4 border-l-orange-400"
                              : ""
                          }`}
                        >
                          <td className="h-[72px] px-4 py-2 text-[#0d131c] text-sm font-medium leading-normal">
                            #{order.id}
                          </td>
                          <td className="h-[72px] px-4 py-2">
                            <div>
                              <div className="text-[#0d131c] text-sm font-medium">
                                {order.customer.name}
                              </div>
                              <div className="text-[#476d9e] text-xs">
                                {order.customer.email}
                              </div>
                              {order.customer.phone && (
                                <div className="text-[#476d9e] text-xs">
                                  {order.customer.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#0d131c] text-sm font-semibold leading-normal">
                            ฿{Number(order.totalAmount).toLocaleString()}
                          </td>
                          <td className="h-[72px] px-4 py-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                            >
                              {needsAttention && (
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                              )}
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#476d9e] text-sm font-normal leading-normal">
                            <div>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs">
                              {new Date(order.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </td>
                          <td className="h-[72px] px-4 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                onClick={() => handleViewOrder(order)}
                              >
                                View
                              </button>
                              {order.status === "WAITING_CONFIRM" && (
                                <button
                                  className="px-3 py-1 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors animate-pulse"
                                  onClick={async () => {
                                    setSelectedOrder(order);
                                    setPaymentModalOpen(true);
                                    setOrderPayment(null);

                                    try {
                                      const paymentRes = await axios.get(
                                        `/api/admin/payments?orderId=${order.id}`
                                      );
                                      setOrderPayment(
                                        paymentRes.data.payments?.[0] || null
                                      );
                                    } catch (error) {
                                      console.error(
                                        "Error fetching payment:",
                                        error
                                      );
                                      setOrderPayment(null);
                                      message.error(
                                        "ไม่สามารถโหลดข้อมูลการชำระเงินได้"
                                      );
                                    }
                                  }}
                                >
                                  Verify
                                </button>
                              )}
                              {(order.status === "PAID" ||
                                order.status === "SHIPPING") && (
                                <button
                                  className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                                  onClick={() => handleCreateShipping(order.id)}
                                  disabled={shippingLoading}
                                >
                                  Ship
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
                              ? new Date(
                                  orderPayment.confirmedAt
                                ).toLocaleString("th-TH")
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
                      ? new Date(selectedOrder.updatedAt).toLocaleString(
                          "th-TH"
                        )
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
                        <Text>
                          {selectedOrder.customer.address || "ไม่ได้ระบุ"}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
              </Card>

              {/* Order Items */}
              <Card title="รายการสินค้า">
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                          สินค้า
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-20">
                          จำนวน
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-32">
                          ราคา/หน่วย
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-32">
                          รวม
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.orderItems?.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.product?.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ฿{Number(item.price).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            ฿
                            {(
                              Number(item.price) * item.quantity
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </Modal>

        {/* Payment Verification Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <CreditCardOutlined
                style={{ marginRight: 8, color: "#1890ff" }}
              />
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
            <Spin
              spinning={orderPayment === null && paymentModalOpen}
              tip="กำลังโหลดข้อมูลการชำระเงิน..."
            >
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
                            ฿
                            {Number(selectedOrder.totalAmount).toLocaleString()}
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
                                border: "1px solid #d9d9d9",
                              }}
                              preview={{
                                mask: (
                                  <div style={{ color: "white" }}>
                                    <EyeOutlined style={{ marginRight: 4 }} />
                                    ดูรูปเต็ม
                                  </div>
                                ),
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
                              backgroundColor: "#fafafa",
                            }}
                          >
                            <FileImageOutlined
                              style={{
                                fontSize: 48,
                                marginBottom: 8,
                                color: "#d9d9d9",
                              }}
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
                            <Text
                              strong
                              style={{ color: "#52c41a", fontSize: 16 }}
                            >
                              ฿
                              {orderPayment
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
                                  ? new Date(
                                      orderPayment.paymentDate
                                    ).toLocaleString("th-TH")
                                  : "-"}
                              </Text>
                            </Space>
                          </Descriptions.Item>
                          <Descriptions.Item label="วันที่ยืนยัน">
                            <Space>
                              <CalendarOutlined />
                              <Text>
                                {orderPayment?.confirmedAt
                                  ? new Date(
                                      orderPayment.confirmedAt
                                    ).toLocaleString("th-TH")
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
                              (฿
                              {Number(
                                selectedOrder?.totalAmount || 0
                              ).toLocaleString()}
                              )
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
                  orderShipping
                    ? "แก้ไขข้อมูลการจัดส่ง"
                    : "สร้างข้อมูลการจัดส่ง"
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
                              color={
                                SHIPPING_STATUS[orderShipping.status]?.color
                              }
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
      </div>
    </div>
  );
}
