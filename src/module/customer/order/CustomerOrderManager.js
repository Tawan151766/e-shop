"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

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
  const [message, setMessage] = useState({ type: "", content: "" });

  // Quick order status check
  const [orderId, setOrderId] = useState("");
  const [orderStatus, setOrderStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Order Status Configuration
  const ORDER_STATUS = {
    PENDING_PAYMENT: {
      label: "รอชำระเงิน",
      color: "#faad14",
      step: 0,
      description: "กรุณาชำระเงินเพื่อดำเนินการต่อ",
    },
    WAITING_CONFIRM: {
      label: "รอยืนยันการชำระ",
      color: "#1890ff",
      step: 1,
      description: "เรากำลังตรวจสอบการชำระเงินของคุณ",
    },
    PAID: {
      label: "ชำระเงินแล้ว",
      color: "#52c41a",
      step: 2,
      description: "การชำระเงินสำเร็จ กำลังเตรียมสินค้า",
    },
    SHIPPING: {
      label: "กำลังจัดส่ง",
      color: "#722ed1",
      step: 3,
      description: "สินค้าอยู่ระหว่างการจัดส่ง",
    },
    COMPLETED: {
      label: "จัดส่งสำเร็จ",
      color: "#52c41a",
      step: 4,
      description: "สินค้าถึงมือคุณแล้ว",
    },
    CANCELLED: {
      label: "ยกเลิกแล้ว",
      color: "#f5222d",
      step: -1,
      description: "คำสั่งซื้อถูกยกเลิก",
    },
  };

  const SHIPPING_STATUS = {
    PREPARING: { label: "เตรียมสินค้า", color: "#faad14" },
    SHIPPED: { label: "จัดส่งแล้ว", color: "#1890ff" },
    DELIVERED: { label: "จัดส่งสำเร็จ", color: "#52c41a" },
  };

  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: "", content: "" }), 5000);
  };

  const fetchOrders = useCallback(
    async (status = "ALL", showRefreshMessage = false) => {
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
          showMessage("success", "รีเฟรชข้อมูลสำเร็จ");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        showMessage("error", "โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        setOrders([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session?.user?.id]
  );

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
      const [paymentRes, shippingRes] = await Promise.allSettled([
        axios.get(`/api/customer/payments?orderId=${order.id}`),
        axios.get(`/api/customer/shipping?orderId=${order.id}`),
      ]);

      if (paymentRes.status === "fulfilled") {
        setOrderPayment(paymentRes.value.data.payments?.[0] || null);
      }

      if (shippingRes.status === "fulfilled") {
        setOrderShipping(shippingRes.value.data.shippings?.[0] || null);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!orderId.trim()) {
      showMessage("error", "กรุณากรอกหมายเลขคำสั่งซื้อ");
      return;
    }

    setStatusLoading(true);
    try {
      const response = await axios.get(`/api/customer/orders/${orderId}`);
      setOrderStatus(response.data.order);
    } catch (error) {
      showMessage("error", "ไม่พบคำสั่งซื้อที่ระบุ");
      setOrderStatus(null);
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusConfig = (status) =>
    ORDER_STATUS[status] || ORDER_STATUS.PENDING_PAYMENT;

  const getOrderProgress = (status) => {
    const config = getStatusConfig(status);
    if (config.step === -1) return { current: 0, status: "error" };
    return {
      current: config.step,
      status: config.step === 4 ? "finish" : "process",
    };
  };

  const getPaymentStatus = (order) => {
    if (order.status === "PENDING_PAYMENT") {
      return { status: "pending", text: "รอชำระเงิน", color: "#faad14" };
    } else if (order.status === "WAITING_CONFIRM") {
      return { status: "waiting", text: "รอตรวจสอบ", color: "#1890ff" };
    } else if (order.status === "PAID") {
      return { status: "verified", text: "ยืนยันแล้ว", color: "#52c41a" };
    } else if (order.status === "CANCELLED") {
      return { status: "rejected", text: "ยกเลิก", color: "#f5222d" };
    }
    return { status: "unknown", text: "ไม่ทราบสถานะ", color: "#d9d9d9" };
  };

  const getTimelineItems = useCallback(
    (order) => {
      const items = [];

      // Add creation
      items.push({
        color: "#1890ff",
        time: new Date(order.createdAt).toLocaleString("th-TH"),
        title: "สร้างคำสั่งซื้อ",
        description: "คำสั่งซื้อถูกสร้างเรียบร้อยแล้ว",
      });

      // Add payment status if available
      if (orderPayment) {
        items.push({
          color:
            orderPayment.status === "CONFIRMED"
              ? "#52c41a"
              : orderPayment.status === "REJECTED"
              ? "#f5222d"
              : "#faad14",
          time: orderPayment.paymentDate
            ? new Date(orderPayment.paymentDate).toLocaleString("th-TH")
            : new Date(orderPayment.createdAt).toLocaleString("th-TH"),
          title:
            orderPayment.status === "CONFIRMED"
              ? "ยืนยันการชำระเงิน"
              : orderPayment.status === "REJECTED"
              ? "ปฏิเสธการชำระเงิน"
              : "อัปโหลดหลักฐานการชำระเงิน",
          description:
            orderPayment.status === "CONFIRMED"
              ? "การชำระเงินได้รับการยืนยันแล้ว"
              : orderPayment.status === "REJECTED"
              ? "การชำระเงินถูกปฏิเสธ"
              : "หลักฐานการชำระเงินถูกอัปโหลดแล้ว",
        });
      }

      // Add shipping status if available
      if (orderShipping) {
        const shippingConfig =
          SHIPPING_STATUS[orderShipping.status] || SHIPPING_STATUS.PREPARING;
        items.push({
          color: shippingConfig.color,
          time: orderShipping.shippedAt
            ? new Date(orderShipping.shippedAt).toLocaleString("th-TH")
            : new Date(orderShipping.createdAt).toLocaleString("th-TH"),
          title: shippingConfig.label,
          description: orderShipping.trackingNumber
            ? `หมายเลขติดตาม: ${orderShipping.trackingNumber}`
            : "ข้อมูลการจัดส่ง",
        });
      }

      return items.reverse(); // Show latest first
    },
    [orderPayment, orderShipping]
  );

  const filteredOrders =
    activeTab === "ALL"
      ? orders
      : orders.filter((order) => order.status === activeTab);

  const getStatusCount = (status) => {
    if (status === "ALL") return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  if (!session) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#f4f2f0",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            maxWidth: "400px",
            width: "100%",
            margin: "0 1rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "bold",
                color: "#181411",
                marginBottom: "0.5rem",
              }}
            >
              กรุณาเข้าสู่ระบบ
            </h3>
            <p style={{ color: "#887563" }}>
              คุณต้องเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f2f0" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "white",
          padding: "1rem",
          paddingBottom: "0.5rem",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            color: "#181411",
            fontSize: "1.125rem",
            fontWeight: "bold",
            flex: 1,
            textAlign: "center",
            paddingLeft: "3rem",
            margin: 0,
          }}
        >
          ประวัติการสั่งซื้อ
        </h2>
        <div
          style={{
            display: "flex",
            width: "3rem",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => fetchOrders(activeTab, true)}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "3rem",
              backgroundColor: "transparent",
              color: "#181411",
              border: "none",
              cursor: refreshing ? "not-allowed" : "pointer",
              opacity: refreshing ? 0.5 : 1,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              height="24px"
              fill="currentColor"
              viewBox="0 0 256 256"
              style={{
                transform: refreshing ? "rotate(360deg)" : "none",
                transition: "transform 0.6s ease",
              }}
            >
              <path d="M197.67,186.37a8,8,0,0,1,0,11.29C196.58,198.73,170.82,224,128,224c-37.39,0-64.53-22.4-80-39.85V208a8,8,0,0,1-16,0V160a8,8,0,0,1,8-8H88a8,8,0,0,1,0,16H55.44C67.76,183.35,93,208,128,208c36.72,0,58.4-21.15,58.38-21.13A8,8,0,0,1,197.67,186.37ZM216,40a8,8,0,0,0-8,8V71.85C192.53,54.4,165.39,32,128,32,85.18,32,59.42,57.27,58.33,58.34a8,8,0,0,0,11.3,11.32C69.6,69.68,91.28,48,128,48c35,0,60.24,24.65,72.56,40H168a8,8,0,0,0,0,16h48a8,8,0,0,0,8-8V48A8,8,0,0,0,216,40Z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message.content && (
        <div
          style={{
            margin: "1rem",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: message.type === "success" ? "#f0f9ff" : "#fef2f2",
            border: `1px solid ${
              message.type === "success" ? "#bfdbfe" : "#fecaca"
            }`,
            color: message.type === "success" ? "#1e40af" : "#dc2626",
          }}
        >
          {message.content}
        </div>
      )}

      {/* Tabs */}
      <div style={{ padding: "0 1rem", marginTop: 8 }}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              gap: "0.5rem",
              padding: 5,
            }}
          >
            {[
              { key: "ALL", label: "ทั้งหมด" },
              { key: "PENDING_PAYMENT", label: "รอชำระเงิน" },
              { key: "WAITING_CONFIRM", label: "รอยืนยัน" },
              { key: "PAID", label: "ชำระแล้ว" },
              { key: "SHIPPING", label: "กำลังจัดส่ง" },
              { key: "COMPLETED", label: "เสร็จสิ้น" },
              { key: "CANCELLED", label: "ยกเลิก" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor:
                    activeTab === tab.key ? "#181411" : "transparent",
                  color: activeTab === tab.key ? "white" : "#6b7280",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontSize: "0.875rem",
                  position: "relative",
                  fontWeight: activeTab === tab.key ? "500" : "400",
                }}
              >
                {tab.label}
                {getStatusCount(tab.key) > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-0.25rem",
                      right: "-0.25rem",
                      backgroundColor: "#f5222d",
                      color: "white",
                      borderRadius: "50%",
                      width: "1.25rem",
                      height: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    {getStatusCount(tab.key)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div style={{ padding: "0 1rem", paddingBottom: "2rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div
              style={{
                display: "inline-block",
                width: "2rem",
                height: "2rem",
                border: "2px solid #f3f3f3",
                borderTop: "2px solid #181411",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p style={{ marginTop: "1rem", color: "#6b7280" }}>
              กำลังโหลดข้อมูล...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "3rem",
              textAlign: "center",
            }}
          >
            <svg
              style={{
                width: "4rem",
                height: "4rem",
                color: "#d1d5db",
                marginBottom: "1rem",
              }}
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M184,24H72A16,16,0,0,0,56,40V216a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V40A16,16,0,0,0,184,24Zm0,192H72V40H184ZM112,176a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H120A8,8,0,0,1,112,176Zm0-32a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H120A8,8,0,0,1,112,144Zm0-32a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H120A8,8,0,0,1,112,112Z"></path>
            </svg>
            <h3 style={{ color: "#6b7280", marginBottom: "0.5rem" }}>
              ไม่พบคำสั่งซื้อ
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
              {activeTab === "ALL"
                ? "คุณยังไม่มีประวัติการสั่งซื้อ"
                : `ไม่มีคำสั่งซื้อในสถานะนี้`}
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const needsAction = order.status === "PENDING_PAYMENT";

              return (
                <div key={order.id} style={{ padding: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "stretch",
                      justifyContent: "space-between",
                      gap: "1rem",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      padding: "1rem",
                      borderLeft: needsAction ? "4px solid #faad14" : "none",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flex: "2 2 0px",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.25rem",
                        }}
                      >
                        <p
                          style={{
                            color: "#181411",
                            fontSize: "1rem",
                            fontWeight: "bold",
                            lineHeight: "tight",
                            margin: 0,
                          }}
                        >
                          Order #{order.id}
                        </p>
                        <p
                          style={{
                            color: "#887563",
                            fontSize: "0.875rem",
                            fontWeight: "normal",
                            lineHeight: "normal",
                            margin: 0,
                          }}
                        >
                          Total: ฿{Number(order.totalAmount).toLocaleString()} |{" "}
                          {statusConfig.label} |{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "th-TH"
                          )}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() => handleViewOrder(order)}
                          style={{
                            display: "flex",
                            minWidth: "84px",
                            maxWidth: "480px",
                            cursor: "pointer",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            borderRadius: "8px",
                            height: "2rem",
                            paddingLeft: "1rem",
                            paddingRight: "1rem",
                            backgroundColor: "#f4f2f0",
                            color: "#181411",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            lineHeight: "normal",
                            width: "fit-content",
                            border: "none",
                          }}
                        >
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            View
                          </span>
                        </button>
                        {needsAction && (
                          <button
                            onClick={() =>
                              (window.location.href = `/payment/${order.id}`)
                            }
                            style={{
                              display: "flex",
                              minWidth: "84px",
                              maxWidth: "480px",
                              cursor: "pointer",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              borderRadius: "8px",
                              height: "2rem",
                              paddingLeft: "1rem",
                              paddingRight: "1rem",
                              backgroundColor: "#faad14",
                              color: "white",
                              fontSize: "0.875rem",
                              fontWeight: "500",
                              lineHeight: "normal",
                              width: "fit-content",
                              border: "none",
                            }}
                          >
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Pay
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        aspectRatio: "video",
                        backgroundSize: "cover",
                        borderRadius: "8px",
                        flex: "1",
                        backgroundImage: order.orderItems?.[0]?.product
                          ?.imageUrl
                          ? `url("${order.orderItems[0].product.imageUrl}")`
                          : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDXpGIGpUN6jwNSjtdIpF1zsvA3SENMNRbdcZpKIK9A_sE2BzFT2y5rfgmAXgNScP5R_slkn_O6WFs3gAZD0mkssO40yKyZNVPiyDhevtfgjMydM5uAxhuI0i4_41jjFFbc57z-lw72JvNGAZ3V5b6v79MJI4UBp9CXBcVF0fNiSeTEH0sjZ037xBFtrwnED-qsbKsEVR5tdX9vzXNa4ywoeMxILtboPl03eydPkYD9VaSy1qpFewBlyaEp2gNPN19oxN3R7Uf5GJY")',
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {modalOpen && selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              maxWidth: "90vw",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ padding: "1.5rem" }}>
              {/* Modal Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "#181411",
                      margin: "0 0 0.25rem 0",
                    }}
                  >
                    รายละเอียดคำสั่งซื้อ
                  </h3>
                  <p style={{ color: "#887563", margin: 0 }}>
                    คำสั่งซื้อ #{selectedOrder.id}
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{
                    color: "#887563",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.25rem",
                  }}
                >
                  <svg
                    style={{ width: "1.5rem", height: "1.5rem" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {detailLoading ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div
                    style={{
                      display: "inline-block",
                      width: "2rem",
                      height: "2rem",
                      border: "2px solid #f3f3f3",
                      borderTop: "2px solid #181411",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                  <p style={{ marginTop: "1rem", color: "#6b7280" }}>
                    กำลังโหลดรายละเอียด...
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {/* Order Status */}
                  <div
                    style={{
                      backgroundColor: "#f9fafb",
                      padding: "1rem",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: getStatusConfig(selectedOrder.status)
                          .color,
                        color: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "16px",
                        fontSize: "1rem",
                        fontWeight: "500",
                        display: "inline-block",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {getStatusConfig(selectedOrder.status).label}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                      {getStatusConfig(selectedOrder.status).description}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div
                    style={{
                      backgroundColor: "#f9fafb",
                      padding: "1rem",
                      borderRadius: "8px",
                    }}
                  >
                    <h4 style={{ marginBottom: "1rem", color: "#181411" }}>
                      ประวัติคำสั่งซื้อ
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {getTimelineItems(selectedOrder).map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            gap: "1rem",
                            padding: "0.75rem",
                            backgroundColor: "white",
                            borderRadius: "6px",
                          }}
                        >
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              backgroundColor: item.color,
                              marginTop: "0.25rem",
                              flexShrink: 0,
                            }}
                          ></div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: "500",
                                color: "#181411",
                                marginBottom: "0.25rem",
                              }}
                            >
                              {item.title}
                            </div>
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "#6b7280",
                                marginBottom: "0.25rem",
                              }}
                            >
                              {item.description}
                            </div>
                            <div
                              style={{ fontSize: "0.75rem", color: "#9ca3af" }}
                            >
                              {item.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Shipping Info */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {/* Payment Information */}
                    <div
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: "1rem",
                        borderRadius: "8px",
                      }}
                    >
                      <h4 style={{ marginBottom: "0.75rem", color: "#181411" }}>
                        ข้อมูลการชำระเงิน
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ color: "#6b7280" }}>
                            สถานะการชำระเงิน:
                          </span>
                          <span
                            style={{
                              backgroundColor:
                                getPaymentStatus(selectedOrder).color,
                              color: "white",
                              padding: "0.125rem 0.5rem",
                              borderRadius: "8px",
                              fontSize: "0.75rem",
                            }}
                          >
                            {getPaymentStatus(selectedOrder).text}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ color: "#6b7280" }}>จำนวนเงิน:</span>
                          <span
                            style={{ color: "#52c41a", fontWeight: "bold" }}
                          >
                            ฿
                            {Number(selectedOrder.totalAmount).toLocaleString()}
                          </span>
                        </div>
                        {orderPayment && (
                          <>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span style={{ color: "#6b7280" }}>
                                วันที่ชำระเงิน:
                              </span>
                              <span>
                                {orderPayment.paymentDate
                                  ? new Date(
                                      orderPayment.paymentDate
                                    ).toLocaleDateString("th-TH")
                                  : "ยังไม่ได้ชำระ"}
                              </span>
                            </div>
                            {orderPayment.slipUrl && (
                              <div style={{ marginTop: "0.5rem" }}>
                                <span
                                  style={{
                                    color: "#6b7280",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  หลักฐานการชำระเงิน:
                                </span>
                                <div style={{ marginTop: "0.25rem" }}>
                                  <img
                                    src={orderPayment.slipUrl}
                                    alt="Payment Slip"
                                    style={{
                                      maxWidth: "100px",
                                      maxHeight: "100px",
                                      objectFit: "cover",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      window.open(
                                        orderPayment.slipUrl,
                                        "_blank"
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: "1rem",
                        borderRadius: "8px",
                      }}
                    >
                      <h4 style={{ marginBottom: "0.75rem", color: "#181411" }}>
                        ข้อมูลการจัดส่ง
                      </h4>
                      {orderShipping ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            fontSize: "0.875rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ color: "#6b7280" }}>
                              สถานะการจัดส่ง:
                            </span>
                            <span
                              style={{
                                backgroundColor:
                                  SHIPPING_STATUS[orderShipping.status]
                                    ?.color || "#d1d5db",
                                color: "white",
                                padding: "0.125rem 0.5rem",
                                borderRadius: "8px",
                                fontSize: "0.75rem",
                              }}
                            >
                              {SHIPPING_STATUS[orderShipping.status]?.label ||
                                "ไม่ทราบสถานะ"}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ color: "#6b7280" }}>
                              บริษัทขนส่ง:
                            </span>
                            <span>{orderShipping.courier || "-"}</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ color: "#6b7280" }}>
                              หมายเลขติดตาม:
                            </span>
                            <span
                              style={{
                                fontFamily: "monospace",
                                backgroundColor: orderShipping.trackingNumber
                                  ? "#f5f5f5"
                                  : "transparent",
                                padding: orderShipping.trackingNumber
                                  ? "2px 6px"
                                  : "0",
                                borderRadius: "4px",
                                fontSize: "0.8rem",
                              }}
                            >
                              {orderShipping.trackingNumber || "-"}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ color: "#6b7280" }}>
                              วันที่จัดส่ง:
                            </span>
                            <span>
                              {orderShipping.shippedAt
                                ? new Date(
                                    orderShipping.shippedAt
                                  ).toLocaleDateString("th-TH")
                                : "ยังไม่ได้จัดส่ง"}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ color: "#6b7280" }}>
                              วันที่ส่งถึง:
                            </span>
                            <span>
                              {orderShipping.deliveredAt
                                ? new Date(
                                    orderShipping.deliveredAt
                                  ).toLocaleDateString("th-TH")
                                : "ยังไม่ได้ส่งถึง"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#9ca3af",
                            padding: "1rem",
                            backgroundColor: "white",
                            borderRadius: "6px",
                          }}
                        >
                          <div style={{ fontSize: "0.875rem" }}>
                            ยังไม่มีข้อมูลการจัดส่ง
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              marginTop: "0.25rem",
                            }}
                          >
                            ข้อมูลการจัดส่งจะแสดงเมื่อเริ่มดำเนินการจัดส่ง
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Information */}
                  <div
                    style={{
                      backgroundColor: "#f9fafb",
                      padding: "1rem",
                      borderRadius: "8px",
                    }}
                  >
                    <h4 style={{ marginBottom: "0.75rem", color: "#181411" }}>
                      ข้อมูลคำสั่งซื้อ
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      <div>
                        <span style={{ color: "#6b7280" }}>
                          หมายเลขคำสั่งซื้อ:{" "}
                        </span>
                        <span
                          style={{
                            fontFamily: "monospace",
                            backgroundColor: "#f5f5f5",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          #{selectedOrder.id}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#6b7280" }}>ยอดรวม: </span>
                        <span
                          style={{
                            color: "#52c41a",
                            fontWeight: "bold",
                            fontSize: "1rem",
                          }}
                        >
                          ฿{Number(selectedOrder.totalAmount).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#6b7280" }}>
                          วันที่สั่งซื้อ:{" "}
                        </span>
                        <span>
                          {new Date(selectedOrder.createdAt).toLocaleString(
                            "th-TH"
                          )}
                        </span>
                      </div>
                      {selectedOrder.updatedAt && (
                        <div>
                          <span style={{ color: "#6b7280" }}>
                            วันที่อัปเดต:{" "}
                          </span>
                          <span>
                            {new Date(selectedOrder.updatedAt).toLocaleString(
                              "th-TH"
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div
                    style={{
                      backgroundColor: "#f9fafb",
                      padding: "1rem",
                      borderRadius: "8px",
                    }}
                  >
                    <h4 style={{ marginBottom: "0.75rem", color: "#181411" }}>
                      รายการสินค้า
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      {selectedOrder.orderItems?.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.75rem",
                            backgroundColor: "white",
                            borderRadius: "6px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              flex: 1,
                            }}
                          >
                            {item.product?.imageUrl && (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: "500",
                                  color: "#181411",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                {item.product?.name || "ไม่ระบุชื่อสินค้า"}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#6b7280",
                                }}
                              >
                                จำนวน: {item.quantity} × ฿
                                {Number(item.price).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              fontWeight: "bold",
                              color: "#52c41a",
                              fontSize: "1rem",
                              textAlign: "right",
                            }}
                          >
                            ฿
                            {(
                              Number(item.price) * item.quantity
                            ).toLocaleString()}
                          </div>
                        </div>
                      ))}

                      {/* Total */}
                      <div
                        style={{
                          borderTop: "2px solid #e5e7eb",
                          paddingTop: "0.75rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          backgroundColor: "white",
                          padding: "0.75rem",
                          borderRadius: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: "1.125rem",
                            color: "#181411",
                          }}
                        >
                          รวมทั้งสิ้น
                        </span>
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: "1.25rem",
                            color: "#52c41a",
                          }}
                        >
                          ฿{Number(selectedOrder.totalAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid #e5e7eb",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={() => setModalOpen(false)}
                      style={{
                        backgroundColor: "#e5e7eb",
                        color: "#374151",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                      }}
                    >
                      ปิด
                    </button>
                    {selectedOrder.status === "PENDING_PAYMENT" && (
                      <button
                        onClick={() => {
                          setModalOpen(false);
                          window.location.href = `/payment/${selectedOrder.id}`;
                        }}
                        style={{
                          backgroundColor: "#1890ff",
                          color: "white",
                          padding: "0.75rem 1.5rem",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                      >
                        ชำระเงิน
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        button:not(:disabled):hover {
          opacity: 0.9;
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }

        input:focus {
          outline: none;
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
