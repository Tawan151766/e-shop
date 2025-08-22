"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/module/shop/LoadingSpinner";
import ProductDetail from "@/module/product/ProductDetail";

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data.product))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  return <ProductDetail product={product} />;
}
