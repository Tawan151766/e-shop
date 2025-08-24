"use client";
import { Layout, Menu, Spin, Button } from "antd";
import {
  AppstoreOutlined,
  TagsOutlined,
  ShoppingOutlined,
  PercentageOutlined,
  CreditCardOutlined,
  TruckOutlined,
  LogoutOutlined,
  FileImageOutlined,
  StockOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const { Sider, Content, Header } = Layout;

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
    key: "/admin/product-galleries",
    icon: <FileImageOutlined />,
    label: <Link href="/admin/product-galleries">แกลเลอรีสินค้า</Link>,
  },
  {
    key: "/admin/stock",
    icon: <StockOutlined />,
    label: <Link href="/admin/stock">จัดการสต็อก</Link>,
  },
  {
    key: "/admin/promotion",
    icon: <PercentageOutlined />,
    label: <Link href="/admin/promotion">โปรโมชั่น</Link>,
  },
  {
    key: "/admin/order",
    icon: <ShoppingOutlined />,
    label: <Link href="/admin/order">คำสั่งซื้อ</Link>,
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // โหลดสถานะ collapsed จาก localStorage
    const savedCollapsed = localStorage.getItem("adminSidebarCollapsed");
    if (savedCollapsed !== null) {
      setCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

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
    document.cookie =
      "adminSessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  };

  const toggleCollapsed = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    // บันทึกสถานะลง localStorage
    localStorage.setItem("adminSidebarCollapsed", JSON.stringify(newCollapsed));
  };

  // Update logout menu item to have onClick handler
  const adminMenuWithLogout = adminMenu.map((item) => {
    if (item.key === "logout") {
      return {
        ...item,
        label: (
          <span onClick={handleLogout} style={{ cursor: "pointer" }}>
            {collapsed ? "" : "ออกจากระบบ"}
          </span>
        ),
      };
    }
    return item;
  });

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={220}
        collapsedWidth={80}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ 
          background: "#fff",
          boxShadow: "2px 0 8px 0 rgba(29,35,41,.05)",
        }}
        breakpoint="lg"
        collapsible={false} // ปิดการ auto collapse บน breakpoint
      >
        <div
          style={{
            height: 64,
            margin: collapsed ? "16px 8px" : 16,
            fontWeight: 700,
            fontSize: collapsed ? 14 : 22,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s",
          }}
        >
          {collapsed ? "AP" : "Admin Panel"}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={adminMenuWithLogout}
          style={{ borderRight: 0 }}
          inlineCollapsed={collapsed}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{ 
            margin: 0, 
            background: "#f0f2f5", 
            minHeight: "calc(100vh - 64px)",
            transition: "all 0.3s",
          }}
        >
          <div style={{ padding: 24 }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}