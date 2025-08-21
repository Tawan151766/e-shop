"use client";
import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Space } from "antd";
import axios from "axios";

export default function AdminCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/category");
      setCategories(res.data);
    } catch (e) {
      message.error("โหลดข้อมูลหมวดหมู่ไม่สำเร็จ");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await axios.post("/api/admin/category", values);
      message.success("เพิ่มหมวดหมู่สำเร็จ");
      setModalOpen(false);
      fetchCategories();
    } catch (e) {
      message.error("เพิ่มหมวดหมู่ไม่สำเร็จ");
    }
  };

  const columns = [
    { title: "ชื่อหมวดหมู่", dataIndex: "name", key: "name" },
    { title: "รายละเอียด", dataIndex: "description", key: "description" },
    { title: "วันที่สร้าง", dataIndex: "createdAt", key: "createdAt", render: (v) => v && new Date(v).toLocaleString() },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", background: "#fff", padding: 24, borderRadius: 8 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>เพิ่มหมวดหมู่</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
      <Modal
        title="เพิ่มหมวดหมู่สินค้า"
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="ชื่อหมวดหมู่" rules={[{ required: true, message: "กรุณากรอกชื่อหมวดหมู่" }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="description" label="รายละเอียด">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
