
"use client";
import { useEffect, useState } from "react";
import ProductGalleryAdmin from "@/module/admin/ProductGalleryAdmin";
import axios from "axios";
import { Typography, Select, Spin, Card } from "antd";


export default function ProductGalleryAdminPage() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get("/api/products", { params: { page: 1, pageSize: 100 } })
      .then(res => setProducts(res.data.products || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card
      style={{ width: '100%', maxWidth: 1200, minHeight: '100vh', margin: '0 auto', borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 0 }}
      bodyStyle={{ padding: 32 }}
      bordered
    >
      <Typography.Title level={2} style={{ marginBottom: 24 }}>
        จัดการอัลบั้มรูปสินค้า
      </Typography.Title>
      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <Typography.Text strong>เลือกรายการสินค้า</Typography.Text>
            <br />
            <Select
              showSearch
              placeholder="-- เลือกสินค้า --"
              style={{ minWidth: 240, marginTop: 8 }}
              value={selectedId || undefined}
              onChange={v => setSelectedId(v)}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {products.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </div>
          {selectedId ? (
            <ProductGalleryAdmin productId={Number(selectedId)} />
          ) : (
            <Typography.Text type="secondary">กรุณาเลือกสินค้าที่ต้องการจัดการอัลบั้มรูป</Typography.Text>
          )}
        </>
      )}
    </Card>
  );
}
