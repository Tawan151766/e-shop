// src/app/order/history/page.js
import CustomerOrderManager from "@/module/customer/order/CustomerOrderManager";

export default function OrderHistoryPage() {
  return (
    <div style={{ minHeight: "80vh", backgroundColor: "#f5f5f5" }}>
      <CustomerOrderManager />
    </div>
  );
}