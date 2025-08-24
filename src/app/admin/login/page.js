"use client";
import AdminLoginForm from "@/module/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
      }}
    >
      <AdminLoginForm />
    </div>
  );
}
