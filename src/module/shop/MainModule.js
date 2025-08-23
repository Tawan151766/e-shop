"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import ShopHeader from "@/module/shop/ShopHeader";
import CategoryFilterBar from "@/module/shop/CategoryFilterBar";
import ProductGrid from "@/module/shop/ProductGrid";
import { useCallback } from "react";
import Pagination from "@/module/shop/Pagination";
import HeroBanner from "@/module/shop/HeroBanner";
import LoadingSpinner from "@/module/shop/LoadingSpinner";
import ShopFooter from "@/module/shop/ShopFooter";

export default function MainModule() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(16);
  const [totalPages, setTotalPages] = useState(1);

  // ดึงหมวดหมู่และโปรโมชันครั้งเดียว
  useEffect(() => {
    Promise.all([
      axios.get("/api/home"),
      axios.get("/api/promotions"),
    ]).then(([homeRes, promoRes]) => {
      setCategories(homeRes.data.categories || []);
      setPromoProducts(promoRes.data.products || []);
    });
  }, []);

  // ดึงสินค้าตาม page/category
  const fetchProducts = useCallback(() => {
    setLoading(true);
    axios
      .get("/api/products", {
        params: {
          page,
          pageSize,
          categoryId: selectedCategory,
        },
      })
      .then((res) => {
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, pageSize, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // เปลี่ยนหมวดหมู่ให้กลับไปหน้าแรก
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <>
      <ShopHeader />
      <CategoryFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={handleCategoryChange}
      />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <HeroBanner products={promoProducts} />
          <h2 className="text-[#181411] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
            Featured
          </h2>
          <ProductGrid products={products} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
      <ShopFooter />
    </>
  );
}
