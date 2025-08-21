"use client";
import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Space } from "antd";
import axios from "axios";

export default function AdminProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/product");
      setProducts(res.data);
    } catch (e) {
      message.error("โหลดข้อมูลสินค้าไม่สำเร็จ");
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/admin/category");
      setCategories(res.data);
    } catch (e) {
      message.error("โหลดข้อมูลหมวดหมู่ไม่สำเร็จ");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await axios.post("/api/admin/product", values);
      message.success("เพิ่มสินค้าสำเร็จ");
      setModalOpen(false);
      fetchProducts();
    } catch (e) {
      message.error("เพิ่มสินค้าไม่สำเร็จ");
    }
  };

  const columns = [
    { title: "ชื่อสินค้า", dataIndex: "name", key: "name" },
    { title: "หมวดหมู่", dataIndex: ["category", "name"], key: "category", render: (v, r) => r.category?.name || "-" },
    { title: "ราคา", dataIndex: "price", key: "price" },
    { title: "คงเหลือ", dataIndex: "stock", key: "stock" },
    { title: "รายละเอียด", dataIndex: "description", key: "description" },
    { title: "วันที่สร้าง", dataIndex: "createdAt", key: "createdAt", render: (v) => v && new Date(v).toLocaleString() },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", background: "#fff", padding: 24, borderRadius: 8 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>เพิ่มสินค้า</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
      <Modal
        title="เพิ่มสินค้า"
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="ชื่อสินค้า" rules={[{ required: true, message: "กรุณากรอกชื่อสินค้า" }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="categoryId" label="หมวดหมู่" rules={[{ required: true, message: "กรุณาเลือกหมวดหมู่" }]}> 
            <Select options={categories.map(c => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="price" label="ราคา" rules={[{ required: true, message: "กรุณากรอกราคา" }]}> 
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="คงเหลือ"> 
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="รายละเอียด">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="imageUrl" label="ลิงก์รูปสินค้า">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
