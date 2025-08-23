// src/module/admin/payment/PaymentStatistics.js
"use client";
import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Progress, message } from "antd";
import { 
  DollarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined 
} from "@ant-design/icons";
import axios from "axios";

export default function PaymentStatistics() {
  const [stats, setStats] = useState({
    totalPayments: 0,
    confirmedPayments: 0,
    waitingPayments: 0,
    rejectedPayments: 0,
    totalAmount: 0,
    confirmedAmount: 0,
    todayPayments: 0,
    todayAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/payments/statistics");
      setStats(res.data);
    } catch (e) {
      message.error("โหลดสถิติไม่สำเร็จ");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const confirmationRate = stats.totalPayments > 0 
    ? (stats.confirmedPayments / stats.totalPayments) * 100 
    : 0;

  const rejectionRate = stats.totalPayments > 0 
    ? (stats.rejectedPayments / stats.totalPayments) * 100 
    : 0;

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        {/* Total Payments */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="การชำระเงินทั้งหมด"
              value={stats.totalPayments}
              prefix={<DollarOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Confirmed Payments */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ยืนยันแล้ว"
              value={stats.confirmedPayments}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Waiting Payments */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="รอตรวจสอบ"
              value={stats.waitingPayments}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Rejected Payments */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ปฏิเสธ"
              value={stats.rejectedPayments}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Total Amount */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ยอดรวมทั้งหมด"
              value={stats.totalAmount}
              prefix="฿"
              precision={2}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Confirmed Amount */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ยอดที่ยืนยันแล้ว"
              value={stats.confirmedAmount}
              prefix="฿"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Today Payments */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="การชำระวันนี้"
              value={stats.todayPayments}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Today Amount */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ยอดวันนี้"
              value={stats.todayAmount}
              prefix="฿"
              precision={2}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Confirmation Rate */}
        <Col xs={24} sm={12}>
          <Card title="อัตราการยืนยัน">
            <Progress
              percent={confirmationRate}
              status="active"
              strokeColor="#52c41a"
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              {stats.confirmedPayments} จาก {stats.totalPayments} รายการ
            </div>
          </Card>
        </Col>

        {/* Rejection Rate */}
        <Col xs={24} sm={12}>
          <Card title="อัตราการปฏิเสธ">
            <Progress
              percent={rejectionRate}
              status={rejectionRate > 10 ? "exception" : "normal"}
              strokeColor={rejectionRate > 10 ? "#ff4d4f" : "#1890ff"}
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              {stats.rejectedPayments} จาก {stats.totalPayments} รายการ
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}