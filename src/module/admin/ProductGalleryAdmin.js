import { useEffect, useState } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Card,
  Spin,
  Typography,
  Popconfirm,
  Row,
  Col,
  message,
} from "antd";

export default function ProductGalleryAdmin({ productId }) {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGalleries = () => {
    setLoading(true);
    axios
      .get("/api/admin/product_galleries", { params: { productId } })
      .then((res) => setGalleries(res.data.galleries || []))
      .catch(() => message.error("โหลดรูปสินค้าไม่สำเร็จ"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (productId) fetchGalleries();
  }, [productId]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete("/api/admin/product_galleries", { params: { id } });
      message.success("ลบรูปสำเร็จ");
      fetchGalleries();
    } catch {
      message.error("ลบรูปไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-40 flex flex-1 justify-center py-5 min-h-screen bg-[#f7fafd]">
      <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <p className="text-[#0d131c] tracking-light text-[32px] font-bold leading-tight min-w-72">
            Product Gallery
          </p>
        </div>
        <div className="px-4 py-3">
          <Spin spinning={loading && !galleries.length} tip="Loading...">
            <Row gutter={[16, 16]}>
              {!loading || galleries.length > 0
                ? galleries.map((g, idx) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={g.id}>
                      <Card
                        hoverable
                        cover={
                          <div className="relative">
                            <img
                              alt="gallery"
                              src={g.imageUrl}
                              style={{
                                aspectRatio: "1/1",
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                            />
                            <span className="absolute top-2 left-2 bg-[#e6ecf4] text-[#476d9e] rounded px-2 py-1 text-xs font-bold shadow">
                              {idx + 1}
                            </span>
                          </div>
                        }
                        actions={[
                          <Popconfirm
                            title="ยืนยันการลบรูปนี้?"
                            onConfirm={() => handleDelete(g.id)}
                            okText="ลบ"
                            cancelText="ยกเลิก"
                            okButtonProps={{ danger: true }}
                            disabled={loading}
                          >
                            <Button danger size="small" disabled={loading}>
                              ลบ
                            </Button>
                          </Popconfirm>,
                        ]}
                        style={{ marginBottom: 0, borderRadius: 12 }}
                        bodyStyle={{ padding: 12 }}
                      />
                    </Col>
                  ))
                : Array.from({ length: 4 }).map((_, i) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={i}>
                      <Card
                        loading
                        style={{ aspectRatio: "1/1", borderRadius: 12 }}
                      />
                    </Col>
                  ))}
            </Row>
          </Spin>
        </div>
      </div>
    </div>
  );
}
