// src/app/api/cart/clear/route.js
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// DELETE /api/cart/clear - ล้างตะกร้าทั้งหมด
export async function DELETE(request) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = parseInt(token.id);

    // หา cart ของ customer
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        cartItems: true,
      },
    });

    if (!cart) {
      return NextResponse.json({
        success: true,
        message: "Cart is already empty",
      });
    }

    // ลบ cart items ทั้งหมด
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Cleared ${cart.cartItems.length} items from cart`,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}