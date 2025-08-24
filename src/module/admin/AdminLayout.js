"use client";
import { Layout, Menu, Spin } from "antd";
import {
  AppstoreOutlined,
  TagsOutlined,
  ShoppingOutlined,
  PercentageOutlined,
  CreditCardOutlined,
  TruckOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const { Sider, Content } = Layout;

const adminMenu = [
  {
    key: "/admin/dashboard",
    icon: <AppstoreOutlined />,
    label: <Link href="/admin/dashboard">Dashboard</Link>,
  },
  {
    key: "/admin/category",
    icon: <TagsOutlined />,
    label: <Link href="/admin/category">หมวดหมู่สินค้า</Link>,
  },
  {
    key: "/admin/product",
    icon: <ShoppingOutlined />,
    label: <Link href="/admin/product">สินค้า</Link>,
  },
  {
    key: "/admin/promotion",
    icon: <PercentageOutlined />,
    label: <Link href="/admin/promotion">โปรโมชั่น</Link>,
  },
  {
    key: "/admin/payment",
    icon: <CreditCardOutlined />,
    label: <Link href="/admin/payment">การชำระเงิน</Link>,
  },
  {
    key: "/admin/order",
    icon: <ShoppingOutlined />,
    label: <Link href="/admin/order">คำสั่งซื้อ</Link>,
  },
  {
    key: "/admin/shipping",
    icon: <TruckOutlined />,
    label: <Link href="/admin/shipping">การจัดส่ง</Link>,
  },
  {
    key: "logout",
    icon: <LogoutOutlined />,
    label: <span>ออกจากระบบ</span>,
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ถ้าเป็นหน้า login ไม่ต้องตรวจสอบ authentication
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    const checkAuth = () => {
      const sessionId = localStorage.getItem("adminSessionId");
      if (!sessionId) {
        router.push("/admin/login");
        return;
      }
      setIsAuthenticated(true);
      setLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  // ถ้าเป็นหน้า login ให้แสดง children โดยตรงไม่ต้องมี sidebar
  if (pathname === "/admin/login") {
    return children;
  }

  const handleLogout = () => {
    // ลบ session จาก localStorage และ cookie
    localStorage.removeItem("adminSessionId");
    document.cookie = "adminSessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  };

  // Update logout menu item to have onClick handler
  const adminMenuWithLogout = adminMenu.map(item => {
    if (item.key === "logout") {
      return {
        ...item,
        label: <span onClick={handleLogout} style={{ cursor: "pointer" }}>ออกจากระบบ</span>
      };
    }
    return item;
  });

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220} style={{ background: "#fff" }} breakpoint="lg">
        <div
          style={{
            height: 64,
            margin: 16,
            fontWeight: 700,
            fontSize: 22,
            textAlign: "center",
          }}
        >
          Admin Panel
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={adminMenuWithLogout}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Content
          style={{ margin: 0, background: "#f0f2f5", minHeight: "100vh" }}
        >
          <div style={{ padding: 24 }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
