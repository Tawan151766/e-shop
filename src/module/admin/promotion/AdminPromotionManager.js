"use client";
import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, message, Space, Switch } from "antd";
import axios from "axios";

export default function AdminPromotionManager() {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/promotion");
      setPromotions(res.data);
    } catch (e) {
      message.error("โหลดข้อมูลโปรโมชั่นไม่สำเร็จ");
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/admin/product");
      setProducts(res.data);
    } catch (e) {
      message.error("โหลดข้อมูลสินค้าไม่สำเร็จ");
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchProducts();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await axios.post("/api/admin/promotion", {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
      });
      message.success("เพิ่มโปรโมชั่นสำเร็จ");
      setModalOpen(false);
      fetchPromotions();
    } catch (e) {
      message.error("เพิ่มโปรโมชั่นไม่สำเร็จ");
    }
  };

  const columns = [
    { title: "สินค้า", dataIndex: ["product", "name"], key: "product", render: (v, r) => r.product?.name || "-" },
    { title: "% ส่วนลด", dataIndex: "discountPercent", key: "discountPercent" },
    { title: "วันที่เริ่ม", dataIndex: "startDate", key: "startDate", render: (v) => v && new Date(v).toLocaleDateString() },
    { title: "วันที่สิ้นสุด", dataIndex: "endDate", key: "endDate", render: (v) => v && new Date(v).toLocaleDateString() },
    { title: "เปิดใช้งาน", dataIndex: "isActive", key: "isActive", render: (v) => v ? "✅" : "❌" },
    { title: "จำนวนใช้สูงสุด", dataIndex: "maxUsage", key: "maxUsage" },
    { title: "จำนวนที่ใช้ไป", dataIndex: "usageCount", key: "usageCount" },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", background: "#fff", padding: 24, borderRadius: 8 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>เพิ่มโปรโมชั่น</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={promotions}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
      <Modal
        title="เพิ่มโปรโมชั่น"
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="productId" label="สินค้า" rules={[{ required: true, message: "กรุณาเลือกสินค้า" }]}> 
            <Select options={products.map(p => ({ value: p.id, label: p.name }))} />
          </Form.Item>
          <Form.Item name="discountPercent" label="% ส่วนลด" rules={[{ required: true, message: "กรุณากรอกเปอร์เซ็นต์ส่วนลด" }]}> 
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="startDate" label="วันที่เริ่ม" rules={[{ required: true, message: "กรุณาเลือกวันที่เริ่ม" }]}> 
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endDate" label="วันที่สิ้นสุด" rules={[{ required: true, message: "กรุณาเลือกวันที่สิ้นสุด" }]}> 
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="เปิดใช้งาน" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item name="maxUsage" label="จำนวนใช้สูงสุด">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
