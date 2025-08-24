"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Space,
  Switch,
  Popconfirm,
  Tag,
  Tooltip,
} from "antd";
import axios from "axios";
import { CheckCircleFilled, CloseCircleFilled, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function AdminPromotionManager() {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/promotion");
      setPromotions(res.data || []);
    } catch (e) {
      const errorMessage = e.response?.data?.error || "โหลดข้อมูลโปรโมชั่นไม่สำเร็จ";
      message.error(errorMessage);
      console.error("Fetch promotions error:", e);
      setPromotions([]);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/admin/product");
      setProducts(res.data || []);
    } catch (e) {
      const errorMessage = e.response?.data?.error || "โหลดข้อมูลสินค้าไม่สำเร็จ";
      message.error(errorMessage);
      console.error("Fetch products error:", e);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchProducts();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setEditMode(false);
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      productId: record.product?.id,
      discountPercent: record.discountPercent,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
      isActive: record.isActive,
      maxUsage: record.maxUsage,
    });
    setEditMode(true);
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    setDeleteLoading(prev => ({ ...prev, [id]: true }));
    try {
      const response = await axios.delete(`/api/admin/promotion/${id}`);
      message.success(response.data.message || "ลบโปรโมชั่นสำเร็จ");
      fetchPromotions();
    } catch (e) {
      const errorMessage = e.response?.data?.error || "ลบโปรโมชั่นไม่สำเร็จ";
      message.error(errorMessage);
      console.error("Delete promotion error:", e);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleOk = async () => {
    setSaveLoading(true);
    try {
      const values = await form.validateFields();
      const promotionData = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
      };

      let response;
      if (editMode && editingId) {
        response = await axios.patch(`/api/admin/promotion/${editingId}`, promotionData);
        message.success(response.data.message || "แก้ไขโปรโมชั่นสำเร็จ");
      } else {
        response = await axios.post("/api/admin/promotion", promotionData);
        message.success(response.data.message || "เพิ่มโปรโมชั่นสำเร็จ");
      }

      setModalOpen(false);
      setEditMode(false);
      setEditingId(null);
      fetchPromotions();
    } catch (e) {
      const errorMessage = e.response?.data?.error || (editMode ? "แก้ไขโปรโมชั่นไม่สำเร็จ" : "เพิ่มโปรโมชั่นไม่สำเร็จ");
      message.error(errorMessage);
      console.error("Save promotion error:", e);
    } finally {
      setSaveLoading(false);
    }
  };

  const columns = [
    {
      title: (
        <span style={{ color: "#0d131c", fontWeight: 500, fontSize: 15 }}>
          #
        </span>
      ),
      key: "rowNumber",
      width: 60,
      align: "center",
      render: (_v, _r, i) => (
        <span style={{ color: "#476d9e", fontWeight: 500 }}>{i + 1}</span>
      ),
    },
    {
      title: (
        <span style={{ color: "#0d131c", fontWeight: 500, fontSize: 15 }}>
          สินค้า
        </span>
      ),
      dataIndex: ["product", "name"],
      key: "product",
      render: (v, r) => (
        <span style={{ color: "#476d9e", fontSize: 14 }}>
          {r.product?.name || "-"}
        </span>
      ),
    },
    {
      title: (
        <span style={{ color: "#0d131c", fontWeight: 500, fontSize: 15 }}>
          % ส่วนลด
        </span>
      ),
      dataIndex: "discountPercent",
      key: "discountPercent",
      width: 100,
      align: "center",
      render: (v) => (
        <Tag color="green" style={{ fontSize: 14 }}>{v}%</Tag>
      ),
    },
    {
      title: (
        <span style={{ color: "#0d131c", fontWeight: 500, fontSize: 15 }}>
          วันที่เริ่ม
        </span>
      ),
      dataIndex: "startDate",
      key: "startDate",
      render: (v) =>
        v && (
          <span style={{ color: "#476d9e", fontSize: 14 }}>
            {new Date(v).toLocaleDateString()}
          </span>
        ),
    },
    {
      title: (
        <span style={{ color: "#0d131c", fontWeight: 500, fontSize: 15 }}>
          วันที่สิ้นสุด
        </span>
      ),
      dataIndex: "endDate",
      key: "endDate",
      render: (v) =>
        v && (
          <span style={{ color: "#476d9e", fontSize: 14 }}>
            {new Date(v).toLocaleDateString()}
          </span>
        ),
    },
    {
      title: (
        <span style={{ color: "#0d131c", fontWeight: 500, fontSize: 15 }}>
          สถานะ
        </span>
      ),
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      align: "center",
      render: (isActive, record) => {
        const now = new Date();
        const startDate = new Date(record.startDate);
        const endDate = new Date(record.endDate);
        
        let status = "inactive";
        let color = "default";
        let text = "ปิดใช้งาน";
        
        if (isActive) {
          if (now < startDate) {
            status = "scheduled";
            color = "blue";
            text = "รอเริ่ม";
          } else if (now >= startDate && now <= endDate) {
            status = "active";
            color = "green";
            text = "ใช้งานอยู่";
          } else {
            status = "expired";
            color = "red";
            text = "หมดอายุ";
          }
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: (
        <span style={{ color: "#0d131c", fontWeight: 500, fontSize: 15 }}>
          จำนวนใช้สูงสุด
        </span>
      ),
      dataIndex: "maxUsage",
      key: "maxUsage",
      render: (v) => (
        <span style={{ color: "#0d131c", fontSize: 14 }}>{v}</span>
      ),
    },
    {
      title: (
        <span style={{ color: "#0d131c", fontWeight: 500, fontSize: 15 }}>
          การใช้งาน
        </span>
      ),
      key: "usage",
      width: 120,
      align: "center",
      render: (_, record) => (
        <span style={{ color: "#0d131c", fontSize: 14 }}>
          {record.usageCount} / {record.maxUsage || "∞"}
        </span>
      ),
    },
    {
      title: (
        <span style={{ color: "#0d131c", fontWeight: 500, fontSize: 15 }}>
          การดำเนินการ
        </span>
      ),
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="แก้ไข">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              style={{ color: '#476d9e', padding: 0 }}
              onClick={() => handleEdit(record)}
            >
              แก้ไข
            </Button>
          </Tooltip>
          <Popconfirm
            title="ยืนยันการลบโปรโมชั่นนี้?"
            description="การลบโปรโมชั่นจะไม่สามารถกู้คืนได้"
            onConfirm={() => handleDelete(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true, loading: deleteLoading[record.id] }}
          >
            <Button 
              type="link" 
              icon={<DeleteOutlined />}
              style={{ color: '#ff4d4f', padding: 0 }}
              danger
              loading={deleteLoading[record.id]}
            >
              ลบ
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
          <p className="text-[#0d131c] tracking-light text-[32px] font-bold leading-tight min-w-72">
            Promotions
          </p>
          <Button
            className="flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e6ecf4] text-[#0d131c] text-sm font-medium leading-normal border-0"
            style={{ boxShadow: "none" }}
            onClick={handleAdd}
          >
            <span className="truncate">Add Promotion</span>
          </Button>
        </div>
        <div className="px-4 py-3">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#476d9e] flex border-none bg-[#e6ecf4] items-center justify-center pl-4 rounded-l-lg border-r-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24px"
                  height="24px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>
              <input
                placeholder="Search promotions"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d131c] focus:outline-0 focus:ring-0 border-none bg-[#e6ecf4] focus:border-none h-full placeholder:text-[#476d9e] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </label>
        </div>
        <div className="px-4 py-3 @container">
          <div className="flex overflow-hidden rounded-lg border border-[#ced9e9] bg-slate-50">
            <Table
              columns={columns}
              dataSource={promotions.filter(
                (p) =>
                  (p.product?.name || "")
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                  (p.discountPercent + "").includes(search) ||
                  (p.usageCount + "").includes(search)
              )}
              rowKey="id"
              loading={loading}
              pagination={false}
              bordered={false}
              style={{ flex: 1, background: "transparent" }}
              rowClassName={() => "border-t border-t-[#ced9e9] h-[72px]"}
              scroll={{ x: 900 }}
            />
          </div>
        </div>
      </div>
      <Modal
        title={editMode ? "แก้ไขโปรโมชั่น" : "เพิ่มโปรโมชั่น"}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => { 
          setModalOpen(false); 
          setEditMode(false); 
          setEditingId(null);
          setSaveLoading(false);
        }}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={saveLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="productId"
            label="สินค้า"
            rules={[{ required: true, message: "กรุณาเลือกสินค้า" }]}
          >
            <Select
              options={products.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Form.Item>
          <Form.Item
            name="discountPercent"
            label="% ส่วนลด"
            rules={[{ required: true, message: "กรุณากรอกเปอร์เซ็นต์ส่วนลด" }]}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="วันที่เริ่ม"
            rules={[{ required: true, message: "กรุณาเลือกวันที่เริ่ม" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="วันที่สิ้นสุด"
            rules={[{ required: true, message: "กรุณาเลือกวันที่สิ้นสุด" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="เปิดใช้งาน"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
          <Form.Item name="maxUsage" label="จำนวนใช้สูงสุด">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
