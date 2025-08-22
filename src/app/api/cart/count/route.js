// src/app/api/cart/count/route.js
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/cart/count - ดึงจำนวนสินค้าในตะกร้า (สำหรับแสดงใน header)
export async function GET(request) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.id) {
      return NextResponse.json({ count: 0 });
    }

    const customerId = parseInt(token.id);

    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        cartItems: {
          include: {
            product: {
              select: {
                deletedAt: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ count: 0 });
    }

    // นับเฉพาะสินค้าที่ยังมีอยู่ (ไม่ถูกลบ)
    const totalItems = cart.cartItems
      .filter(item => !item.product.deletedAt)
      .reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({ 
      count: totalItems,
      cartId: cart.id 
    });
  } catch (error) {
    console.error("Get cart count error:", error);
    return NextResponse.json({ count: 0 });
  }
}