"use client";
import { Layout, Menu } from "antd";
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
import { usePathname } from "next/navigation";

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
          items={adminMenu}
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
