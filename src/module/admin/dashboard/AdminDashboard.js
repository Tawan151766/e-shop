"use client";
import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin, Button } from "antd";
import {
  AppstoreOutlined,
  TagsOutlined,
  ShoppingOutlined,
  UserOutlined,
  PercentageOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import axios from "axios";

const statList = [
  { key: "productCount", title: "จำนวนสินค้า", icon: <ShoppingOutlined /> },
  { key: "categoryCount", title: "หมวดหมู่", icon: <TagsOutlined /> },
  { key: "orderCount", title: "ออเดอร์", icon: <AppstoreOutlined /> },
  { key: "customerCount", title: "ลูกค้า", icon: <UserOutlined /> },
  { key: "promotionCount", title: "โปรโมชั่น", icon: <PercentageOutlined /> },
  { key: "totalSales", title: "ยอดขายรวม", icon: <DollarOutlined /> },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/admin/dashboard").then((res) => {
      setStats(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        Admin Dashboard
      </h1>
      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "60px auto" }} />
      ) : (
        <Row gutter={[24, 24]} justify="center">
          {statList.map((s) => (
            <Col xs={24} sm={12} md={8} lg={8} xl={4} key={s.key}>
              <Card>
                <Statistic
                  title={
                    <span>
                      {s.icon} {s.title}
                    </span>
                  }
                  value={
                    s.key === "totalSales"
                      ? Number(stats[s.key]).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })
                      : stats[s.key]
                  }
                  suffix={s.key === "totalSales" ? "฿" : undefined}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
