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
} from "antd";
import axios from "axios";
import { CheckCircleFilled } from "@ant-design/icons";

export default function AdminPromotionManager() {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");

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
      render: (v) => (
        <span style={{ color: "#0d131c", fontSize: 14 }}>{v}</span>
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
          เปิดใช้งาน
        </span>
      ),
      dataIndex: "isActive",
      key: "isActive",
      render: (v) => (v ? <CheckCircleFilled color="#4caf50" /> : <CloseCircleFilled color="#f44336" />),
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
          จำนวนที่ใช้ไป
        </span>
      ),
      dataIndex: "usageCount",
      key: "usageCount",
      render: (v) => (
        <span style={{ color: "#0d131c", fontSize: 14 }}>{v}</span>
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
        title="เพิ่มโปรโมชั่น"
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
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
