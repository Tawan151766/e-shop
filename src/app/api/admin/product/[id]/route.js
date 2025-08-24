// src/app/api/admin/product/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ดึงสินค้าตาม ID
export async function GET(request, { params }) {
  try {
    const productId = parseInt(params.id);
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { 
        category: true,
        galleries: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PATCH: แก้ไขสินค้า
export async function PATCH(request, { params }) {
  try {
    const productId = parseInt(params.id);
    const data = await request.json();
    
    const { name, description, price, stock, categoryId, imageUrl } = data;

    // Validate required fields
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Name, price, and categoryId are required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Update product in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
          categoryId: parseInt(categoryId),
          imageUrl,
          updatedAt: new Date()
        },
        include: { category: true }
      });

      // If stock was changed, record the movement
      if (stock !== undefined && parseInt(stock) !== existingProduct.stock) {
        const stockDifference = parseInt(stock) - existingProduct.stock;
        
        await tx.stockMovement.create({
          data: {
            productId,
            type: stockDifference > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(stockDifference),
            referenceType: 'ADJUSTMENT',
            notes: `Stock updated via product edit: ${existingProduct.stock} → ${stock}`
          }
        });
      }

      return updatedProduct;
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: result
    });

  } catch (error) {
    console.error("Update product error:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Product name already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE: ลบสินค้า (Soft Delete)
export async function DELETE(request, { params }) {
  try {
    const productId = parseInt(params.id);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orderItems: true,
        cartItems: true
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product is being used in orders or carts
    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete product that has been ordered" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Remove from carts first
      if (existingProduct.cartItems.length > 0) {
        await tx.cartItem.deleteMany({
          where: { productId }
        });
      }

      // Soft delete the product
      const deletedProduct = await tx.product.update({
        where: { id: productId },
        data: { 
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Record stock movement if there was stock
      if (existingProduct.stock > 0) {
        await tx.stockMovement.create({
          data: {
            productId,
            type: 'OUT',
            quantity: existingProduct.stock,
            referenceType: 'ADJUSTMENT',
            notes: `Product deleted - stock removed: ${existingProduct.stock} units`
          }
        });
      }

      return deletedProduct;
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}