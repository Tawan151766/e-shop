"use client";
import { useEffect, useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Spin, 
  Button, 
  Alert, 
  List, 
  Avatar, 
  Badge, 
  Progress, 
  Divider,
  Space,
  Typography,
  Tooltip
} from "antd";
import {
  AppstoreOutlined,
  TagsOutlined,
  ShoppingOutlined,
  UserOutlined,
  PercentageOutlined,
  DollarOutlined,
  StockOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  FireOutlined,
  CalendarOutlined,
  RiseOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  RightOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined
} from "@ant-design/icons";
import Link from "next/link";
import axios from "axios";

const { Title, Text } = Typography;

const statList = [
  { 
    key: "productCount", 
    title: "จำนวนสินค้า", 
    icon: <ShoppingOutlined />, 
    link: "/admin/product",
    description: "สินค้าทั้งหมดในระบบ"
  },
  { 
    key: "totalSales", 
    title: "ยอดขายรวม", 
    icon: <DollarOutlined />, 
    color: "#52c41a",
    description: "ยอดขายที่ชำระแล้ว"
  },
  { 
    key: "orderCount", 
    title: "ออเดอร์ทั้งหมด", 
    icon: <AppstoreOutlined />, 
    link: "/admin/order",
    description: "คำสั่งซื้อทั้งหมด"
  },
  { 
    key: "todayOrders", 
    title: "ออเดอร์วันนี้", 
    icon: <CalendarOutlined />, 
    color: "#1890ff",
    link: "/admin/order",
    description: "ออเดอร์ที่เข้ามาวันนี้"
  },
  { 
    key: "totalStock", 
    title: "สต็อกรวม", 
    icon: <StockOutlined />, 
    link: "/admin/stock",
    description: "สต็อกสินค้าทั้งหมด"
  },
  { 
    key: "lowStockProducts", 
    title: "สต็อกต่ำ", 
    icon: <WarningOutlined />, 
    color: "#fa8c16", 
    link: "/admin/stock",
    description: "สินค้าที่สต็อกต่ำกว่า 10"
  },
  { 
    key: "outOfStockProducts", 
    title: "สินค้าหมด", 
    icon: <ExclamationCircleOutlined />, 
    color: "#f5222d", 
    link: "/admin/stock",
    description: "สินค้าที่หมดสต็อก"
  },
  { 
    key: "activePromotions", 
    title: "โปรโมชั่นใช้งาน", 
    icon: <FireOutlined />, 
    color: "#52c41a", 
    link: "/admin/promotion",
    description: "โปรโมชั่นที่ใช้งานอยู่"
  },
  { 
    key: "pendingOrders", 
    title: "รอชำระเงิน", 
    icon: <ClockCircleOutlined />, 
    color: "#1890ff", 
    link: "/admin/order",
    description: "ออเดอร์รอชำระเงิน"
  },
  // { 
  //   key: "waitingPayments", 
  //   title: "รอตรวจสอบ", 
  //   icon: <CreditCardOutlined />, 
  //   color: "#f5222d", 
  //   link: "/admin/payment",
  //   description: "การชำระเงินรอตรวจสอบ"
  // },
  { 
    key: "customerCount", 
    title: "ลูกค้าทั้งหมด", 
    icon: <UserOutlined />,
    description: "ลูกค้าที่ลงทะเบียน"
  },
  { 
    key: "recentCustomers", 
    title: "ลูกค้าใหม่ 30 วัน", 
    icon: <UserOutlined />, 
    color: "#722ed1",
    description: "ลูกค้าใหม่ในช่วง 30 วันที่ผ่านมา"
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/dashboard").then((res) => {
      setStats(res.data);
      
      // สร้าง alerts จากข้อมูล
      const newAlerts = [];
      if (res.data.lowStockProducts > 0) {
        newAlerts.push({
          type: 'warning',
          message: `มีสินค้า ${res.data.lowStockProducts} รายการที่สต็อกต่ำ`,
          action: 'ดูรายละเอียด',
          link: '/admin/stock'
        });
      }
      if (res.data.pendingOrders > 0) {
        newAlerts.push({
          type: 'info',
          message: `มีออเดอร์ ${res.data.pendingOrders} รายการรอชำระเงิน`,
          action: 'จัดการออเดอร์',
          link: '/admin/order'
        });
      }
      // if (res.data.waitingPayments > 0) {
      //   newAlerts.push({
      //     type: 'error',
      //     message: `มีการชำระเงิน ${res.data.waitingPayments} รายการรอตรวจสอบ`,
      //     action: 'ตรวจสอบการชำระ',
      //     link: '/admin/payment'
      //   });
      // }
      
      setAlerts(newAlerts);
      setLoading(false);
    });
  }, []);

  const quickActions = [
    { title: 'เพิ่มสินค้าใหม่', icon: <PlusOutlined />, link: '/admin/product', color: '#52c41a' },
    { title: 'จัดการสต็อก', icon: <StockOutlined />, link: '/admin/stock', color: '#1890ff' },
    { title: 'สร้างโปรโมชั่น', icon: <FireOutlined />, link: '/admin/promotion', color: '#f5222d' },
    { title: 'ดูรายงาน', icon: <BarChartOutlined />, link: '/admin/reports', color: '#722ed1' },
  ];

  const getStatColor = (key, value) => {
    if (key === 'lowStockProducts' && value > 0) return '#fa8c16';
    if (key === 'pendingOrders' && value > 0) return '#1890ff';
    if (key === 'waitingPayments' && value > 0) return '#f5222d';
    if (key === 'activePromotions' && value > 0) return '#52c41a';
    if (key === 'totalSales') return '#52c41a';
    return undefined;
  };

  const getProgressPercent = (key, value) => {
    if (key === 'lowStockProducts') {
      const total = stats?.productCount || 1;
      return Math.min((value / total) * 100, 100);
    }
    if (key === 'activePromotions') {
      const total = stats?.promotionCount || 1;
      return Math.min((value / total) * 100, 100);
    }
    return null;
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: '0 16px' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={1} style={{ textAlign: "center", marginBottom: 8 }}>
          <BarChartOutlined /> Admin Dashboard
        </Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
          ภาพรวมการจัดการระบบร้านค้า
        </Text>
      </div>

      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "60px auto" }} />
      ) : (
        <>
          {/* Alerts Section */}
          {alerts.length > 0 && (
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Title level={4}>
                  <ExclamationCircleOutlined /> การแจ้งเตือน
                </Title>
                {alerts.map((alert, index) => (
                  <Alert
                    key={index}
                    message={alert.message}
                    type={alert.type}
                    showIcon
                    action={
                      <Link href={alert.link}>
                        <Button size="small" type="link">
                          {alert.action} <RightOutlined />
                        </Button>
                      </Link>
                    }
                    style={{ marginBottom: 8 }}
                  />
                ))}
              </Col>
            </Row>
          )}

          {/* Quick Actions */}
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            <Col span={24}>
              <Title level={4}>
                <RiseOutlined /> การดำเนินการด่วน
              </Title>
              <Row gutter={[16, 16]}>
                {quickActions.map((action, index) => (
                  <Col xs={12} sm={6} key={index}>
                    <Link href={action.link}>
                      <Card 
                        hoverable 
                        style={{ 
                          textAlign: 'center',
                          borderColor: action.color,
                          transition: 'all 0.3s'
                        }}
                        bodyStyle={{ padding: '16px 12px' }}
                      >
                        <div style={{ color: action.color, fontSize: 24, marginBottom: 8 }}>
                          {action.icon}
                        </div>
                        <Text strong style={{ fontSize: 12 }}>{action.title}</Text>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            <Col span={24}>
              <Title level={4}>
                <PieChartOutlined /> สถิติภาพรวม
              </Title>
            </Col>
            {statList.map((s) => {
              const value = stats[s.key];
              const color = getStatColor(s.key, value);
              const progressPercent = getProgressPercent(s.key, value);
              
              return (
                <Col xs={24} sm={12} md={8} lg={6} xl={4} key={s.key}>
                  <Badge.Ribbon 
                    text={value > 0 && (s.key === 'lowStockProducts' || s.key === 'pendingOrders' || s.key === 'waitingPayments') ? 'ต้องดำเนินการ' : null}
                    color={s.key === 'lowStockProducts' ? 'orange' : s.key === 'waitingPayments' ? 'red' : 'blue'}
                  >
                    <Card 
                      hoverable={!!s.link}
                      style={{ 
                        height: '100%',
                        borderColor: color ? color : undefined,
                        borderWidth: color ? 2 : 1
                      }}
                    >
                      <Statistic
                        title={
                          <Space>
                            <span style={{ color }}>{s.icon}</span>
                            <span>{s.title}</span>
                            {s.link && (
                              <Tooltip title="ดูรายละเอียด">
                                <Link href={s.link}>
                                  <EyeOutlined style={{ fontSize: 12, color: '#1890ff' }} />
                                </Link>
                              </Tooltip>
                            )}
                          </Space>
                        }
                        value={
                          s.key === "totalSales"
                            ? Number(value).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })
                            : value
                        }
                        suffix={s.key === "totalSales" ? "฿" : undefined}
                        valueStyle={{ 
                          color,
                          fontSize: value > 999999 ? '18px' : '24px'
                        }}
                      />
                      {progressPercent !== null && (
                        <Progress 
                          percent={progressPercent} 
                          size="small" 
                          strokeColor={color}
                          showInfo={false}
                          style={{ marginTop: 8 }}
                        />
                      )}
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                        {s.description}
                      </Text>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              );
            })}
          </Row>

          {/* Performance Insights */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={8}>
              <Card title={<><RiseOutlined /> ประสิทธิภาพการขาย</>}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>การเติบโตยอดขาย (30 วัน)</Text>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: stats.salesGrowthPercentage >= 0 ? '#52c41a' : '#f5222d' }}>
                    {stats.salesGrowthPercentage >= 0 ? '+' : ''}{stats.salesGrowthPercentage}%
                  </div>
                </div>
                <Divider />
                <div style={{ marginBottom: 8 }}>
                  <Text>ยอดขายเฉลี่ยต่อออเดอร์</Text>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                    {Number(stats.averageOrderValue || 0).toLocaleString()} ฿
                  </div>
                </div>
                <div>
                  <Text>อัตราการหมุนเวียนสต็อก</Text>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                    {stats.stockTurnoverRate}%
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card title={<><CheckCircleOutlined /> สถานะระบบ</>}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text>สถานะสต็อก</Text>
                    <Badge 
                      status={stats.systemHealth?.stockStatus === 'good' ? 'success' : stats.systemHealth?.stockStatus === 'warning' ? 'warning' : 'error'} 
                      text={stats.systemHealth?.stockStatus === 'good' ? 'ปกติ' : stats.systemHealth?.stockStatus === 'warning' ? 'ต้องติดตาม' : 'ต้องดำเนินการ'} 
                      style={{ display: 'block' }}
                    />
                  </div>
                  <div>
                    <Text>สถานะออเดอร์</Text>
                    <Badge 
                      status={stats.systemHealth?.orderStatus === 'good' ? 'success' : stats.systemHealth?.orderStatus === 'warning' ? 'warning' : 'error'} 
                      text={stats.systemHealth?.orderStatus === 'good' ? 'ปกติ' : stats.systemHealth?.orderStatus === 'warning' ? 'ต้องติดตาม' : 'ต้องดำเนินการ'} 
                      style={{ display: 'block' }}
                    />
                  </div>
                  <div>
                    <Text>สถานะการชำระเงิน</Text>
                    <Badge 
                      status={stats.systemHealth?.paymentStatus === 'good' ? 'success' : stats.systemHealth?.paymentStatus === 'warning' ? 'warning' : 'error'} 
                      text={stats.systemHealth?.paymentStatus === 'good' ? 'ปกติ' : stats.systemHealth?.paymentStatus === 'warning' ? 'ต้องติดตาม' : 'ต้องดำเนินการ'} 
                      style={{ display: 'block' }}
                    />
                  </div>
                  <div>
                    <Text>สถานะโปรโมชั่น</Text>
                    <Badge 
                      status={stats.systemHealth?.promotionStatus === 'good' ? 'success' : 'warning'} 
                      text={stats.systemHealth?.promotionStatus === 'good' ? 'มีโปรโมชั่นใช้งาน' : 'ไม่มีโปรโมชั่นใช้งาน'} 
                      style={{ display: 'block' }}
                    />
                  </div>
                </Space>
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card title={<><LineChartOutlined /> สรุปรายวัน/เดือน</>}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>ออเดอร์วันนี้</Text>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                    {stats.todayOrders}
                  </div>
                </div>
                <Divider />
                <div style={{ marginBottom: 8 }}>
                  <Text>ออเดอร์เดือนนี้</Text>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                    {stats.monthlyOrders}
                  </div>
                </div>
                <div>
                  <Text>ลูกค้าใหม่ (30 วัน)</Text>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                    {stats.recentCustomers}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* System Navigation */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<><AppstoreOutlined /> จัดการสินค้าและคลัง</>}>
                <List size="small">
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<ShoppingOutlined />} />}
                      title={<Link href="/admin/product">จัดการสินค้า</Link>}
                      description={`${stats.productCount} รายการ | สต็อกรวม ${stats.totalStock?.toLocaleString()} ชิ้น`}
                    />
                    <Link href="/admin/product">
                      <Button type="link" icon={<RightOutlined />} />
                    </Link>
                  </List.Item>
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<StockOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                      title={<Link href="/admin/stock">จัดการสต็อก</Link>}
                      description={`สต็อกต่ำ ${stats.lowStockProducts} รายการ | หมดสต็อก ${stats.outOfStockProducts} รายการ`}
                    />
                    <Link href="/admin/stock">
                      <Button type="link" icon={<RightOutlined />} />
                    </Link>
                  </List.Item>
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<TagsOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                      title={<Link href="/admin/category">หมวดหมู่สินค้า</Link>}
                      description={`${stats.categoryCount} หมวดหมู่`}
                    />
                    <Link href="/admin/category">
                      <Button type="link" icon={<RightOutlined />} />
                    </Link>
                  </List.Item>
                </List>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card title={<><FireOutlined /> การขายและโปรโมชั่น</>}>
                <List size="small">
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<AppstoreOutlined />} style={{ backgroundColor: '#722ed1' }} />}
                      title={<Link href="/admin/order">จัดการออเดอร์</Link>}
                      description={`ทั้งหมด ${stats.orderCount} รายการ | รอชำระ ${stats.pendingOrders} รายการ | วันนี้ ${stats.todayOrders} รายการ`}
                    />
                    <Link href="/admin/order">
                      <Button type="link" icon={<RightOutlined />} />
                    </Link>
                  </List.Item>
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<PercentageOutlined />} style={{ backgroundColor: '#f5222d' }} />}
                      title={<Link href="/admin/promotion">โปรโมชั่น</Link>}
                      description={`ทั้งหมด ${stats.promotionCount} รายการ | ใช้งานอยู่ ${stats.activePromotions} รายการ`}
                    />
                    <Link href="/admin/promotion">
                      <Button type="link" icon={<RightOutlined />} />
                    </Link>
                  </List.Item>
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<DollarOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                      title="ยอดขายรวม"
                      description={`${Number(stats.totalSales).toLocaleString()} บาท | เติบโต ${stats.salesGrowthPercentage}%`}
                    />
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  </List.Item>
                </List>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
