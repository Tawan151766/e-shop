// src/app/profile/page.js
import CustomerProfile from "@/module/customer/profile/CustomerProfile";

export default function ProfilePage() {
  return (
    <div style={{ minHeight: "80vh", backgroundColor: "#f5f5f5" }}>
      <CustomerProfile />
    </div>
  );
}