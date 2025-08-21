import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductGalleryAdmin({ productId }) {
  const [galleries, setGalleries] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGalleries = () => {
    setLoading(true);
    axios
      .get("/api/admin/product_galleries", { params: { productId } })
      .then((res) => setGalleries(res.data.galleries || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (productId) fetchGalleries();
  }, [productId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!imageUrl) return;
    setLoading(true);
    await axios.post("/api/admin/product_galleries", { productId, imageUrl });
    setImageUrl("");
    fetchGalleries();
  };

  const handleDelete = async (id) => {
    setLoading(true);
    await axios.delete("/api/admin/product_galleries", { params: { id } });
    fetchGalleries();
  };

  return (
    <div className="border rounded p-4 max-w-xl mx-auto">
      <h3 className="font-bold mb-2">จัดการอัลบั้มรูปสินค้า</h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="url"
          className="border px-2 py-1 rounded grow"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
          disabled={loading || !imageUrl}
        >
          เพิ่มรูป
        </button>
      </form>
      {loading && <div className="text-sm text-gray-500">Loading...</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {galleries.map((g) => (
          <div key={g.id} className="relative group border rounded overflow-hidden">
            <img src={g.imageUrl} alt="gallery" className="w-full aspect-square object-cover" />
            <button
              className="absolute top-1 right-1 bg-red-600 text-white rounded px-2 py-0.5 text-xs opacity-80 group-hover:opacity-100"
              onClick={() => handleDelete(g.id)}
              disabled={loading}
            >
              ลบ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
