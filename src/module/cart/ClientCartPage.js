// src/module/cart/ClientCartPage.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CartHeader from "@/module/cart/CartHeader";
import CartItemList from "@/module/cart/CartItemList";
import CartSummary from "@/module/cart/CartSummary";
import EmptyCart from "@/module/cart/EmptyCart";

export default function ClientCartPage({ initialCart }) {
  const router = useRouter();
  const [cart, setCart] = useState(initialCart);
  const [updating, setUpdating] = useState(false);

  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh page to get updated data
        router.refresh();
      } else {
        alert(data.error || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Update quantity error:", error);
      alert("Failed to update quantity");
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (cartItemId) => {
    if (!confirm("Are you sure you want to remove this item?")) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh page to get updated data
        router.refresh();
      } else {
        alert(data.error || "Failed to remove item");
      }
    } catch (error) {
      console.error("Remove item error:", error);
      alert("Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!confirm("Are you sure you want to clear your entire cart?")) return;

    try {
      setUpdating(true);
      const response = await fetch("/api/cart/clear", {
        method: "DELETE",
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh page to get updated data
        router.refresh();
      } else {
        alert(data.error || "Failed to clear cart");
      }
    } catch (error) {
      console.error("Clear cart error:", error);
      alert("Failed to clear cart");
    } finally {
      setUpdating(false);
    }
  };

  const proceedToCheckout = () => {
    if (!cart?.items?.length) {
      alert("Your cart is empty");
      return;
    }
    
    // TODO: Navigate to checkout page
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CartHeader 
        onBack={() => router.back()}
        onClear={cart?.items?.length > 0 ? clearCart : null}
        itemCount={cart?.summary?.totalItems || 0}
      />

      <div className="max-w-4xl mx-auto p-4">
        {!cart?.items?.length ? (
          <EmptyCart onContinueShopping={() => router.push("/")} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <CartItemList
                items={cart.items}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                updating={updating}
              />
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <CartSummary
                summary={cart.summary}
                onCheckout={proceedToCheckout}
                onContinueShopping={() => router.push("/")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}