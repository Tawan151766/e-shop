// src/module/admin/order/OrderStatistics.js
"use client";
import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Progress, message } from "antd";
import { 
  ShoppingCartOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  TruckOutlined,
  DollarOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import axios from "axios";

export default function OrderStatistics() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingPayment: 0,
    waitingConfirm: 0,
    paid: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/orders/statistics");
      setStats(res.data);
    } catch (e) {
      message.error("โหลดสถิติไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const completionRate = stats.totalOrders > 0 
    ? (stats.completed / stats.totalOrders) * 100 
    : 0;

  const cancellationRate = stats.totalOrders > 0 
    ? (stats.cancelled / stats.totalOrders) * 100 
    : 0;

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        {/* Total Orders */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="คำสั่งซื้อทั้งหมด"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Pending Payment */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="รอชำระเงิน"
              value={stats.pendingPayment}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Shipping */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="กำลังจัดส่ง"
              value={stats.shipping}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#722ed1' }}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Completed */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="เสร็จสิ้น"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Total Revenue */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ยอดขายรวม"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="฿"
              precision={2}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Today Orders */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="คำสั่งซื้อวันนี้"
              value={stats.todayOrders}
              prefix={<ShoppingCartOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Today Revenue */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ยอดขายวันนี้"
              value={stats.todayRevenue}
              prefix={<DollarOutlined />}
              suffix="฿"
              precision={2}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Cancelled */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ยกเลิก"
              value={stats.cancelled}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Completion Rate */}
        <Col xs={24} sm={12}>
          <Card title="อัตราการเสร็จสิ้น">
            <Progress
              percent={completionRate}
              status="active"
              strokeColor="#52c41a"
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              {stats.completed} จาก {stats.totalOrders} คำสั่งซื้อ
            </div>
          </Card>
        </Col>

        {/* Cancellation Rate */}
        <Col xs={24} sm={12}>
          <Card title="อัตราการยกเลิก">
            <Progress
              percent={cancellationRate}
              status={cancellationRate > 10 ? "exception" : "normal"}
              strokeColor={cancellationRate > 10 ? "#ff4d4f" : "#1890ff"}
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              {stats.cancelled} จาก {stats.totalOrders} คำสั่งซื้อ
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}