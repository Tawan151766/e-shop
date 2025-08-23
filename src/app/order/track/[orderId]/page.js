// src/app/order/track/[orderId]/page.js
import OrderTracking from "@/module/customer/order/OrderTracking";

export default function OrderTrackingPage({ params }) {
  const { orderId } = params;

  return (
    <div style={{ minHeight: "80vh", backgroundColor: "#f5f5f5", padding: "24px 0" }}>
      <OrderTracking orderId={orderId} />
    </div>
  );
}