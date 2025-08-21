"use client";
import { Button } from "antd";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>
        Admin Dashboard
      </h1>
      <Link href="/admin/category" passHref legacyBehavior>
        <Button type="primary" size="large">
          จัดการหมวดหมู่สินค้า
        </Button>
      </Link>
      <Link href="/admin/product" passHref legacyBehavior>
        <Button type="primary" size="large">
          สินค้า
        </Button>
      </Link>{" "}
      <Link href="/admin/promotion" passHref legacyBehavior>
        <Button type="primary" size="large">
          โปรโมชั่น
        </Button>
      </Link>
    </div>
  );
}
