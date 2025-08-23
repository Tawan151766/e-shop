// src/module/customer/order/CustomerOrderManager.js
"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
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
  Steps,
  Image,
  Alert,
  Row,
  Col,
  Typography,
  Empty,
  Spin,
  Timeline,
  Badge,
  Tooltip,
  notification,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  FileImageOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import axios from "axios";

const { Title, Text } = Typography;

export default function CustomerOrderManager() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [orderPayment, setOrderPayment] = useState(null);
  const [orderShipping, setOrderShipping] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  // Shipping Status Configuration
  const SHIPPING_STATUS = {
    PREPARING: { label: "เตรียมสินค้า", color: "orange" },
    SHIPPED: { label: "จัดส่งแล้ว", color: "blue" },
    DELIVERED: { label: "จัดส่งสำเร็จ", color: "green" },
  };

  const fetchOrders = useCallback(async (status = "ALL", showRefreshMessage = false) => {
    if (!session?.user?.id) return;
    
    if (showRefreshMessage) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const params = status === "ALL" ? {} : { status };
      const res = await axios.get("/api/customer/orders", { params });
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
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchOrders(activeTab);
    }
  }, [activeTab, fetchOrders, session?.user?.id]);

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
    setDetailLoading(true);
    setOrderPayment(null);
    setOrderShipping(null);

    try {
      // Fetch payment and shipping details
      const [paymentRes, shippingRes] = await Promise.allSettled([
        axios.get(`/api/customer/payments?orderId=${order.id}`),
        axios.get(`/api/customer/shipping?orderId=${order.id}`)
      ]);

      if (paymentRes.status === 'fulfilled') {
        setOrderPayment(paymentRes.value.data.payments?.[0] || null);
      }

      if (shippingRes.status === 'fulfilled') {
        setOrderShipping(shippingRes.value.data.shippings?.[0] || null);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusConfig = (status) =>
    ORDER_STATUS[status] || ORDER_STATUS.PENDING_PAYMENT;

  const getOrderProgress = (status) => {
    const config = getStatusConfig(status);
    if (config.step === -1) return { current: 0, status: "error" };
    return { current: config.step, status: config.step === 4 ? "finish" : "process" };
  };

  const getPaymentStatus = (order) => {
    if (order.status === "PENDING_PAYMENT") {
      return { status: "pending", text: "รอชำระเงิน", color: "orange" };
    } else if (order.status === "WAITING_CONFIRM") {
      return { status: "waiting", text: "รอตรวจสอบ", color: "blue" };
    } else if (order.status === "PAID") {
      return { status: "verified", text: "ยืนยันแล้ว", color: "green" };
    } else if (order.status === "CANCELLED") {
      return { status: "rejected", text: "ยกเลิก", color: "red" };
    }
    return { status: "unknown", text: "ไม่ทราบสถานะ", color: "default" };
  };

  const getTimelineItems = useCallback((order) => {
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

    // Add payment status if available
    if (orderPayment) {
      items.push({
        color: orderPayment.status === "CONFIRMED" ? "green" : 
               orderPayment.status === "REJECTED" ? "red" : "orange",
        children: (
          <div>
            <div><strong>
              {orderPayment.status === "CONFIRMED" ? "ยืนยันการชำระเงิน" :
               orderPayment.status === "REJECTED" ? "ปฏิเสธการชำระเงิน" : "อัปโหลดหลักฐานการชำระเงิน"}
            </strong></div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {orderPayment.paymentDate 
                ? new Date(orderPayment.paymentDate).toLocaleString("th-TH")
                : new Date(orderPayment.createdAt).toLocaleString("th-TH")
              }
            </div>
          </div>
        ),
      });
    }

    // Add shipping status if available
    if (orderShipping) {
      items.push({
        color: orderShipping.status === "DELIVERED" ? "green" : "blue",
        children: (
          <div>
            <div><strong>
              {orderShipping.status === "PREPARING" ? "เตรียมสินค้า" :
               orderShipping.status === "SHIPPED" ? "จัดส่งสินค้า" : "จัดส่งสำเร็จ"}
            </strong></div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {orderShipping.shippedAt 
                ? new Date(orderShipping.shippedAt).toLocaleString("th-TH")
                : new Date(orderShipping.createdAt).toLocaleString("th-TH")
              }
            </div>
            {orderShipping.trackingNumber && (
              <div style={{ fontSize: 12, color: "#1890ff" }}>
                หมายเลขติดตาม: {orderShipping.trackingNumber}
              </div>
            )}
          </div>
        ),
      });
    }

    // Add current status if different from above
    const hasCurrentStatus = items.some(item => {
      try {
        const titleElement = item.children?.props?.children?.[0]?.props?.children;
        return typeof titleElement === 'string' && titleElement.includes(currentStatus.label);
      } catch (e) {
        return false;
      }
    });

    if (order.status !== "PENDING_PAYMENT" && !hasCurrentStatus) {
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
  }, [getStatusConfig, orderPayment, orderShipping]);

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
        const needsAction = status === "PENDING_PAYMENT";
        return (
          <Badge dot={needsAction} color="orange">
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
      width: 200,
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
          {record.status === "PENDING_PAYMENT" && (
            <Tooltip title="ชำระเงิน">
              <Button
                type="default"
                icon={<CreditCardOutlined />}
                size="small"
                style={{ 
                  borderColor: "#faad14", 
                  color: "#faad14"
                }}
                onClick={() => {
                  // Navigate to payment page
                  window.location.href = `/payment/${record.id}`;
                }}
              >
                ชำระเงิน
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = useMemo(() => [
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
        <Badge 
          count={orders.filter(o => o.status === "PENDING_PAYMENT").length} 
          showZero
          style={{ backgroundColor: '#faad14' }}
        >
          <span>รอชำระเงิน</span>
        </Badge>
      )
    },
    { 
      key: "WAITING_CONFIRM", 
      label: (
        <Badge count={orders.filter(o => o.status === "WAITING_CONFIRM").length} showZero>
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
  ], [orders]);

  if (!session) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Alert
          message="กรุณาเข้าสู่ระบบ"
          description="คุณต้องเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ"
          type="warning"
          showIcon
        />
      </div>
    );
  }

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
              ประวัติการสั่งซื้อ
            </Title>
            <Text type="secondary">
              ดูประวัติและติดตามสถานะคำสั่งซื้อของคุณ
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
                    ? "คุณยังไม่มีประวัติการสั่งซื้อ" 
                    : `ไม่มีคำสั่งซื้อในสถานะนี้`
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
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} จาก ${total} รายการ`,
            }}
            scroll={{ x: 800 }}
            size="middle"
            rowClassName={(record) => 
              record.status === "PENDING_PAYMENT" ? "highlight-row" : ""
            }
          />
        )}
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <ShoppingOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                รายละเอียดคำสั่งซื้อ
              </Title>
              <Text type="secondary">คำสั่งซื้อ #{selectedOrder?.id}</Text>
            </div>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setModalOpen(false)}>
            ปิด
          </Button>,
          selectedOrder?.status === "PENDING_PAYMENT" && (
            <Button
              key="payment"
              type="primary"
              icon={<CreditCardOutlined />}
              onClick={() => {
                window.location.href = `/payment/${selectedOrder.id}`;
              }}
            >
              ชำระเงิน
            </Button>
          ),
        ]}
      >
        {selectedOrder && (
          <Spin spinning={detailLoading} tip="กำลังโหลดรายละเอียด...">
            <div>
              {/* Order Progress */}
              <Card title="สถานะคำสั่งซื้อ" style={{ marginBottom: 16 }}>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <Tag 
                    color={getStatusConfig(selectedOrder.status).color} 
                    style={{ fontSize: 16, padding: "8px 16px" }}
                  >
                    {getStatusConfig(selectedOrder.status).label}
                  </Tag>
                  <div style={{ marginTop: 8, color: "#666" }}>
                    {getStatusConfig(selectedOrder.status).description}
                  </div>
                </div>

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
              </Card>

              {/* Order Timeline */}
              <Card title="ประวัติคำสั่งซื้อ" style={{ marginBottom: 16 }}>
                <Timeline items={getTimelineItems(selectedOrder)} />
              </Card>

              <Row gutter={16}>
                <Col span={12}>
                  {/* Payment Information */}
                  <Card 
                    title={
                      <Space>
                        <CreditCardOutlined />
                        ข้อมูลการชำระเงิน
                      </Space>
                    } 
                    style={{ marginBottom: 16 }}
                    size="small"
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="สถานะการชำระเงิน">
                        <Tag color={getPaymentStatus(selectedOrder).color}>
                          {getPaymentStatus(selectedOrder).text}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="จำนวนเงิน">
                        <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                          ฿{Number(selectedOrder.totalAmount).toLocaleString()}
                        </Text>
                      </Descriptions.Item>
                      {orderPayment && (
                        <>
                          <Descriptions.Item label="วันที่ชำระเงิน">
                            {orderPayment.paymentDate
                              ? new Date(orderPayment.paymentDate).toLocaleString("th-TH")
                              : "ยังไม่ได้ชำระ"}
                          </Descriptions.Item>
                          {orderPayment.slipUrl && (
                            <Descriptions.Item label="หลักฐานการชำระเงิน">
                              <Image
                                src={orderPayment.slipUrl}
                                alt="Payment Slip"
                                style={{ maxWidth: 100, maxHeight: 100 }}
                                preview={{
                                  mask: "ดูรูปเต็ม"
                                }}
                              />
                            </Descriptions.Item>
                          )}
                        </>
                      )}
                    </Descriptions>
                  </Card>
                </Col>

                <Col span={12}>
                  {/* Shipping Information */}
                  <Card 
                    title={
                      <Space>
                        <TruckOutlined />
                        ข้อมูลการจัดส่ง
                      </Space>
                    } 
                    style={{ marginBottom: 16 }}
                    size="small"
                  >
                    {orderShipping ? (
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="สถานะการจัดส่ง">
                          <Tag color={SHIPPING_STATUS[orderShipping.status]?.color}>
                            {SHIPPING_STATUS[orderShipping.status]?.label}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="บริษัทขนส่ง">
                          {orderShipping.courier || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="หมายเลขติดตาม">
                          <Text copyable={!!orderShipping.trackingNumber}>
                            {orderShipping.trackingNumber || "-"}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="วันที่จัดส่ง">
                          {orderShipping.shippedAt
                            ? new Date(orderShipping.shippedAt).toLocaleString("th-TH")
                            : "ยังไม่ได้จัดส่ง"}
                        </Descriptions.Item>
                        <Descriptions.Item label="วันที่ส่งถึง">
                          {orderShipping.deliveredAt
                            ? new Date(orderShipping.deliveredAt).toLocaleString("th-TH")
                            : "ยังไม่ได้ส่งถึง"}
                        </Descriptions.Item>
                      </Descriptions>
                    ) : (
                      <Alert
                        message="ยังไม่มีข้อมูลการจัดส่ง"
                        description="ข้อมูลการจัดส่งจะแสดงเมื่อเริ่มดำเนินการจัดส่ง"
                        type="info"
                        showIcon
                        size="small"
                      />
                    )}
                  </Card>
                </Col>
              </Row>

              {/* Order Information */}
              <Card title="ข้อมูลคำสั่งซื้อ" style={{ marginBottom: 16 }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="หมายเลขคำสั่งซื้อ" span={1}>
                    <Text code>#{selectedOrder.id}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="สถานะ" span={1}>
                    <Tag color={getStatusConfig(selectedOrder.status).color}>
                      {getStatusConfig(selectedOrder.status).label}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="ยอดรวม" span={1}>
                    <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                      ฿{Number(selectedOrder.totalAmount).toLocaleString()}
                    </Text>
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
                        `฿${(
                          Number(record.price) * record.quantity
                        ).toLocaleString()}`,
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
                          <strong style={{ color: "#52c41a", fontSize: 16 }}>
                            ฿{total.toLocaleString()}
                          </strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Card>
            </div>
          </Spin>
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