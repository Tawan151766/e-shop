"use client";
import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Space, Popconfirm } from "antd";
import axios from "axios";

export default function AdminProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");

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
    setEditMode(false);
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      categoryId: record.category?.id,
      price: record.price,
      stock: record.stock,
      description: record.description,
      imageUrl: record.imageUrl,
    });
    setEditMode(true);
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/product/${id}`);
      message.success("ลบสินค้าสำเร็จ");
      fetchProducts();
    } catch (e) {
      message.error("ลบสินค้าไม่สำเร็จ");
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editMode && editingId) {
        await axios.patch(`/api/admin/product/${editingId}`, values);
        message.success("แก้ไขสินค้าสำเร็จ");
      } else {
        await axios.post("/api/admin/product", values);
        message.success("เพิ่มสินค้าสำเร็จ");
      }
      setModalOpen(false);
      setEditMode(false);
      setEditingId(null);
      fetchProducts();
    } catch (e) {
      message.error(editMode ? "แก้ไขสินค้าไม่สำเร็จ" : "เพิ่มสินค้าไม่สำเร็จ");
    }
  };

  const columns = [
    
    {
      title: <span style={{ color: '#0d131c', fontWeight: 500, fontSize: 15 }}>No</span>,
      key: 'rowNumber',
      width: 60,
      align: 'center',
      render: (_v, _r, i) => <span style={{ color: '#476d9e', fontWeight: 500 }}>{i + 1}</span>,
    },
    {
      title: <span style={{ color: '#0d131c', fontWeight: 500, fontSize: 15 }}>Name</span>,
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (v) => <span style={{ color: '#0d131c', fontSize: 14 }}>{v}</span>,
    },
    {
      title: <span style={{ color: '#0d131c', fontWeight: 500, fontSize: 15 }}>Category</span>,
      dataIndex: ["category", "name"],
      key: "category",
      width: 160,
      render: (v, r) => <span style={{ color: '#476d9e', fontSize: 14 }}>{r.category?.name || "-"}</span>,
    },
    {
      title: <span style={{ color: '#0d131c', fontWeight: 500, fontSize: 15 }}>Price</span>,
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (v) => <span style={{ color: '#0d131c', fontSize: 14 }}>{v}</span>,
    },
    {
      title: <span style={{ color: '#0d131c', fontWeight: 500, fontSize: 15 }}>Stock</span>,
      dataIndex: "stock",
      key: "stock",
      width: 100,
      render: (v) => <span style={{ color: '#0d131c', fontSize: 14 }}>{v}</span>,
    },
    {
      title: <span style={{ color: '#0d131c', fontWeight: 500, fontSize: 15 }}>Description</span>,
      dataIndex: "description",
      key: "description",
      width: 300,
      render: (v) => <span style={{ color: '#476d9e', fontSize: 14 }}>{v}</span>,
    },
    {
      title: <span style={{ color: '#0d131c', fontWeight: 500, fontSize: 15 }}>Actions</span>,
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" style={{ color: '#476d9e', fontWeight: 700, padding: 0 }} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <span style={{ color: '#476d9e', fontWeight: 700 }}>|</span>
          <Popconfirm
            title="ยืนยันการลบสินค้านี้?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" style={{ color: '#476d9e', fontWeight: 700, padding: 0 }} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="px-40 flex flex-1 justify-center py-5 min-h-screen bg-[#f7fafd]">
      <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <p className="text-[#0d131c] tracking-light text-[32px] font-bold leading-tight min-w-72">Products</p>
          <Button
            className="flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e6ecf4] text-[#0d131c] text-sm font-medium leading-normal border-0"
            style={{ boxShadow: 'none' }}
            onClick={handleAdd}
          >
            <span className="truncate">Add Product</span>
          </Button>
        </div>
        <div className="px-4 py-3">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#476d9e] flex border-none bg-[#e6ecf4] items-center justify-center pl-4 rounded-l-lg border-r-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>
              <input
                placeholder="Search products"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d131c] focus:outline-0 focus:ring-0 border-none bg-[#e6ecf4] focus:border-none h-full placeholder:text-[#476d9e] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </label>
        </div>
        <div className="px-4 py-3 @container">
          <div className="flex overflow-hidden rounded-lg border border-[#ced9e9] bg-slate-50">
            <Table
              columns={columns}
              dataSource={products.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                (p.description || '').toLowerCase().includes(search.toLowerCase())
              )}
              rowKey="id"
              loading={loading}
              pagination={false}
              bordered={false}
              style={{ flex: 1, background: 'transparent' }}
              rowClassName={() => 'border-t border-t-[#ced9e9] h-[72px]'}
              scroll={{ x: 900 }}
            />
          </div>
        </div>
      </div>
      <Modal
        title={editMode ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => { setModalOpen(false); setEditMode(false); setEditingId(null); }}
        okText="บันทึก"
        cancelText="ยกเลิก"
        destroyOnClose
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
