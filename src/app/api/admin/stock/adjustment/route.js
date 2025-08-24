// src/app/api/admin/stock/adjustment/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { productId, quantity, type, notes } = await request.json();

    if (!productId || !quantity || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      return NextResponse.json(
        { error: "Invalid adjustment type" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get current product
      const product = await tx.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // Calculate new stock
      let newStock = product.stock;
      if (type === 'IN') {
        newStock += quantity;
      } else if (type === 'OUT') {
        newStock -= quantity;
        if (newStock < 0) {
          throw new Error("Insufficient stock");
        }
      } else if (type === 'ADJUSTMENT') {
        newStock = quantity; // Set to exact quantity
      }

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: newStock }
      });

      // Record stock movement
      const stockMovement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity: type === 'ADJUSTMENT' ? (quantity - product.stock) : quantity,
          referenceType: 'ADJUSTMENT',
          notes: notes || `Stock ${type.toLowerCase()} adjustment`
        }
      });

      return { product: updatedProduct, movement: stockMovement };
    });

    return NextResponse.json({
      success: true,
      message: "Stock adjusted successfully",
      data: result
    });

  } catch (error) {
    console.error("Stock adjustment error:", error);
    
    if (error.message.includes("not found") || error.message.includes("Insufficient")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to adjust stock" },
      { status: 500 }
    );
  }
}