"use client";
import { useEffect, useState } from "react";
import ProductGalleryAdmin from "@/module/admin/ProductGalleryAdmin";
import axios from "axios";

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">จัดการอัลบั้มรูปสินค้า</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block mb-1 font-medium">เลือกรายการสินค้า</label>
            <select
              className="border px-2 py-1 rounded min-w-[200px]"
              value={selectedId || ""}
              onChange={e => setSelectedId(e.target.value || null)}
            >
              <option value="">-- เลือกสินค้า --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {selectedId ? (
            <ProductGalleryAdmin productId={Number(selectedId)} />
          ) : (
            <div className="text-gray-500">กรุณาเลือกสินค้าที่ต้องการจัดการอัลบั้มรูป</div>
          )}
        </>
      )}
    </div>
  );
}
