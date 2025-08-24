import { useEffect, useState } from "react";
import axios from "axios";
import { Input, Button, Card, Spin, Typography, Popconfirm, Row, Col, message } from "antd";

export default function ProductGalleryAdmin({ productId }) {
  const [galleries, setGalleries] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!imageUrl) return;
    setLoading(true);
    try {
      await axios.post("/api/admin/product_galleries", { productId, imageUrl });
      setImageUrl("");
      message.success("เพิ่มรูปสำเร็จ");
      fetchGalleries();
    } catch {
      message.error("เพิ่มรูปไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

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
    <Card
      title={<span style={{ fontSize: 24, fontWeight: 700 }}>จัดการอัลบั้มรูปสินค้า</span>}
      style={{ width: '100%', maxWidth: 1200, minHeight: '100vh', margin: '0 auto', borderRadius: 16, boxShadow: '0 2px 16px #0001' }}
      bodyStyle={{ padding: 32 }}
      bordered
    >
      <form onSubmit={handleAdd} style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
        <Input
          type="url"
          placeholder="Image URL"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          required
          disabled={loading}
          style={{ flex: 1 }}
        />
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={!imageUrl}
        >
          เพิ่มรูป
        </Button>
      </form>
      <Spin spinning={loading && !galleries.length} tip="Loading...">
        <Row gutter={[16, 16]}>
          {(!loading || galleries.length > 0)
            ? galleries.map(g => (
                <Col xs={12} md={6} key={g.id}>
                  <Card
                    hoverable
                    cover={<img alt="gallery" src={g.imageUrl} style={{ aspectRatio: '1/1', objectFit: 'cover' }} />}
                    actions={[
                      <Popconfirm
                        title="ยืนยันการลบรูปนี้?"
                        onConfirm={() => handleDelete(g.id)}
                        okText="ลบ"
                        cancelText="ยกเลิก"
                        okButtonProps={{ danger: true }}
                        disabled={loading}
                      >
                        <Button danger size="small" disabled={loading}>ลบ</Button>
                      </Popconfirm>
                    ]}
                    style={{ marginBottom: 0 }}
                  />
                </Col>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <Col xs={12} md={6} key={i}>
                  <Card loading style={{ aspectRatio: '1/1' }} />
                </Col>
              ))}
        </Row>
      </Spin>
    </Card>
  );
}
