// src/app/api/cart/[id]/route.js
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PUT /api/cart/[id] - อัปเดตจำนวนสินค้าในตะกร้า
export async function PUT(request, { params }) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartItemId = parseInt(params.id);
    const { quantity } = await request.json();
    const customerId = parseInt(token.id);

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า cart item นี้เป็นของ customer นี้หรือไม่
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          customerId: customerId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            stock: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าสินค้ายังมีอยู่หรือไม่
    if (cartItem.product.deletedAt) {
      return NextResponse.json(
        { error: "Product is no longer available" },
        { status: 400 }
      );
    }

    // ตรวจสอบสต็อก
    if (cartItem.product.stock < quantity) {
      return NextResponse.json(
        { 
          error: "Insufficient stock",
          availableStock: cartItem.product.stock,
          productName: cartItem.product.name
        },
        { status: 400 }
      );
    }

    // อัปเดตจำนวน
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return NextResponse.json({
      success: true,
      message: "Cart item updated successfully",
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/[id] - ลบสินค้าออกจากตะกร้า
export async function DELETE(request, { params }) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartItemId = parseInt(params.id);
    const customerId = parseInt(token.id);

    // ตรวจสอบว่า cart item นี้เป็นของ customer นี้หรือไม่
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          customerId: customerId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // ลบ cart item
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({
      success: true,
      message: `${cartItem.product.name} removed from cart successfully`,
    });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove cart item" },
      { status: 500 }
    );
  }
}