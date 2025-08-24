"use client";
import { useEffect, useState } from "react";
import { 
  Table, Button, Modal, Form, InputNumber, Select, message, Space, 
  Card, Row, Col, Statistic, Tag, Tabs, Input, Tooltip 
} from "antd";
import { 
  WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  PlusOutlined, MinusOutlined, EditOutlined, HistoryOutlined
} from "@ant-design/icons";
import axios from "axios";

const { TabPane } = Tabs;

export default function AdminStockManager() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [adjustmentModal, setAdjustmentModal] = useState(false);
  const [movementsModal, setMovementsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const fetchStockData = async (lowStock = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        ...(lowStock && { lowStock: 'true' })
      });
      
      const res = await axios.get(`/api/admin/stock?${params}`);
      setProducts(res.data.products);
      setStatistics(res.data.statistics);
    } catch (e) {
      message.error("โหลดข้อมูลสต็อกไม่สำเร็จ");
    }
    setLoading(false);
  };

  const fetchMovements = async (productId = null) => {
    setMovementsLoading(true);
    try {
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      
      const res = await axios.get(`/api/admin/stock/movements?${params}`);
      setMovements(res.data.movements);
    } catch (e) {
      message.error("โหลดประวัติการเคลื่อนไหวไม่สำเร็จ");
    }
    setMovementsLoading(false);
  };

  useEffect(() => {
    fetchStockData(activeTab === "low");
  }, [search, activeTab]);

  const handleAdjustment = (product, type) => {
    setSelectedProduct(product);
    form.resetFields();
    form.setFieldsValue({ type });
    setAdjustmentModal(true);
  };

  const handleViewMovements = (product) => {
    setSelectedProduct(product);
    setMovementsModal(true);
    fetchMovements(product.id);
  };

  const handleAdjustmentSubmit = async () => {
    try {
      const values = await form.validateFields();
      await axios.post("/api/admin/stock/adjustment", {
        productId: selectedProduct.id,
        ...values
      });
      
      message.success("ปรับสต็อกสำเร็จ");
      setAdjustmentModal(false);
      fetchStockData(activeTab === "low");
    } catch (e) {
      message.error("ปรับสต็อกไม่สำเร็จ");
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'red', text: 'หมด', icon: <ExclamationCircleOutlined /> };
    if (stock <= 10) return { color: 'orange', text: 'ต่ำ', icon: <WarningOutlined /> };
    return { color: 'green', text: 'ปกติ', icon: <CheckCircleOutlined /> };
  };

  const stockColumns = [
    {
      title: <span style={{ color: '#0d131c', fontWeight: 500, fontSize: 15 }}>No</span>,
      key: 'rowNumber',
      width: 60,
      align: 'center',
      render: (_v, _r, i) => <span style={{ color: '#476d9e', fontWeight: 500 }}>{i + 1}</span>,
    },
    {
      title: <span style={{ color: '#0d131c', fontWeight: 500, fontSize: 15 }}>สินค้า</span>,
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (v, record) => (
        <div>
          <div style={{ color: '#0d131c', fontSize: 14, fontWeight: 500 }}>{v}</div>
          <div style={{ color: '#476d9e', fontSize: 12 }}>{record.category?.name}</div>
        </div>
      ),
    },
    {
      title: <span style={{ color: '#0d131c', fontWeight: 500, fontSize: 15 }}>สต็อกปัจจุบัน</span>,
      dataIndex: "stock",
      key: "stock",
      width: 120,
      align: 'center',
      render: (stock) => {
        const status = getStockStatus(stock);
        return (
          <Tag color={status.color} icon={status.icon}>
            {stock} ({status.text})
          </Tag>
        );
      },
    },
    {
      title: <span style={{ color: '#0d131c', fontWeight: 500, fontSize: 15 }}>ราคา</span>,
      dataIndex: "price",
      key: "price",
      width: 100,
      align: 'right',
      render: (v) => <span style={{ color: '#0d131c', fontSize: 14 }}>฿{Number(v).toLocaleString()}</span>,
    },
    {
      title: <span style={{ color: '#0d131c', fontWeight: 500, fontSize: 15 }}>มูลค่าสต็อก</span>,
      key: "stockValue",
      width: 120,
      align: 'right',
      render: (_, record) => {
        const value = Number(record.price) * record.stock;
        return <span style={{ color: '#0d131c', fontSize: 14, fontWeight: 500 }}>฿{value.toLocaleString()}</span>;
      },
    },
    {
      title: <span style={{ color: '#0d131c', fontWeight: 500, fontSize: 15 }}>การดำเนินการ</span>,
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="เพิ่มสต็อก">
            <Button 
              type="link" 
              icon={<PlusOutlined />}
              style={{ color: '#52c41a', padding: 0 }}
              onClick={() => handleAdjustment(record, 'IN')}
            >
              เพิ่ม
            </Button>
          </Tooltip>
          <Tooltip title="ลดสต็อก">
            <Button 
              type="link" 
              icon={<MinusOutlined />}
              style={{ color: '#ff4d4f', padding: 0 }}
              onClick={() => handleAdjustment(record, 'OUT')}
            >
              ลด
            </Button>
          </Tooltip>
          <Tooltip title="ปรับสต็อก">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              style={{ color: '#1890ff', padding: 0 }}
              onClick={() => handleAdjustment(record, 'ADJUSTMENT')}
            >
              ปรับ
            </Button>
          </Tooltip>
          <Tooltip title="ประวัติ">
            <Button 
              type="link" 
              icon={<HistoryOutlined />}
              style={{ color: '#476d9e', padding: 0 }}
              onClick={() => handleViewMovements(record)}
            >
              ประวัติ
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const movementColumns = [
    {
      title: "วันที่",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (v) => new Date(v).toLocaleString('th-TH'),
    },
    {
      title: "ประเภท",
      dataIndex: "type",
      key: "type",
      width: 80,
      render: (type) => {
        const colors = { IN: 'green', OUT: 'red', ADJUSTMENT: 'blue' };
        const texts = { IN: 'เข้า', OUT: 'ออก', ADJUSTMENT: 'ปรับ' };
        return <Tag color={colors[type]}>{texts[type]}</Tag>;
      },
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      align: 'center',
    },
    {
      title: "อ้างอิง",
      dataIndex: "referenceType",
      key: "referenceType",
      width: 100,
    },
    {
      title: "หมายเหตุ",
      dataIndex: "notes",
      key: "notes",
      render: (v) => v || "-",
    },
  ];

  return (
    <div className="px-40 flex flex-1 justify-center py-5 min-h-screen bg-[#f7fafd]">
      <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <p className="text-[#0d131c] tracking-light text-[32px] font-bold leading-tight min-w-72">
            Stock Management
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="px-4 py-3">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="สินค้าทั้งหมด"
                  value={statistics.totalProducts || 0}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="สต็อกรวม"
                  value={statistics.totalStock || 0}
                  prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="สต็อกเฉลี่ย"
                  value={statistics.averageStock || 0}
                  prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="สต็อกต่ำ"
                  value={statistics.lowStockProducts || 0}
                  prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#476d9e] flex border-none bg-[#e6ecf4] items-center justify-center pl-4 rounded-l-lg border-r-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>
              <input
                placeholder="ค้นหาสินค้า..."
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d131c] focus:outline-0 focus:ring-0 border-none bg-[#e6ecf4] focus:border-none h-full placeholder:text-[#476d9e] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </label>
        </div>

        {/* Tabs */}
        <div className="px-4">
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="สินค้าทั้งหมด" key="all" />
            <TabPane 
              tab={
                <span>
                  <WarningOutlined />
                  สต็อกต่ำ ({statistics.lowStockProducts || 0})
                </span>
              } 
              key="low" 
            />
          </Tabs>
        </div>

        {/* Table */}
        <div className="px-4 py-3 @container">
          <div className="flex overflow-hidden rounded-lg border border-[#ced9e9] bg-slate-50">
            <Table
              columns={stockColumns}
              dataSource={products}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              bordered={false}
              style={{ flex: 1, background: 'transparent' }}
              rowClassName={() => 'border-t border-t-[#ced9e9] h-[72px]'}
              scroll={{ x: 900 }}
            />
          </div>
        </div>

        {/* Stock Adjustment Modal */}
        <Modal
          title={`ปรับสต็อก - ${selectedProduct?.name}`}
          open={adjustmentModal}
          onOk={handleAdjustmentSubmit}
          onCancel={() => setAdjustmentModal(false)}
          okText="บันทึก"
          cancelText="ยกเลิก"
          destroyOnClose
        >
          <Form form={form} layout="vertical">
            <Form.Item name="type" label="ประเภทการปรับ" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="IN">เพิ่มสต็อก</Select.Option>
                <Select.Option value="OUT">ลดสต็อก</Select.Option>
                <Select.Option value="ADJUSTMENT">ปรับสต็อกเป็น</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="quantity" label="จำนวน" rules={[{ required: true, message: "กรุณากรอกจำนวน" }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="notes" label="หมายเหตุ">
              <Input.TextArea rows={3} placeholder="เหตุผลในการปรับสต็อก..." />
            </Form.Item>
          </Form>
        </Modal>

        {/* Stock Movements Modal */}
        <Modal
          title={`ประวัติการเคลื่อนไหว - ${selectedProduct?.name}`}
          open={movementsModal}
          onCancel={() => setMovementsModal(false)}
          footer={null}
          width={800}
          destroyOnClose
        >
          <Table
            columns={movementColumns}
            dataSource={movements}
            rowKey="id"
            loading={movementsLoading}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Modal>
      </div>
    </div>
  );
}