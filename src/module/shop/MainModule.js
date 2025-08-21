"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import ShopHeader from "@/module/shop/ShopHeader";
import CategoryFilterBar from "@/module/shop/CategoryFilterBar";
import ProductGrid from "@/module/shop/ProductGrid";
import HeroBanner from "@/module/shop/HeroBanner";
import LoadingSpinner from "@/module/shop/LoadingSpinner";

export default function MainModule() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get("/api/home"),
      axios.get("/api/promotions"),
    ])
      .then(([homeRes, promoRes]) => {
        setCategories(homeRes.data.categories || []);
        const allProducts = (homeRes.data.categories || []).flatMap(
          (cat) => cat.products || []
        );
        setProducts(allProducts);
        setPromoProducts(promoRes.data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (p) => String(p.categoryId) === String(selectedCategory)
        );

  return (
    <>
      <ShopHeader />
      <CategoryFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <HeroBanner products={promoProducts} />
          <h2 className="text-[#181411] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
            Featured
          </h2>
          <ProductGrid products={filteredProducts} />
        </>
      )}
    </>
  );
}
