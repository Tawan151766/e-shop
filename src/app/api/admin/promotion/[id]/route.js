// src/app/api/admin/promotion/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ดึงโปรโมชั่นตาม ID
export async function GET(request, { params }) {
  try {
    const promotionId = parseInt(params.id);
    
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: { 
        product: {
          include: {
            category: true
          }
        }
      }
    });

    if (!promotion) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(promotion);

  } catch (error) {
    console.error("Get promotion error:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotion" },
      { status: 500 }
    );
  }
}

// PATCH: แก้ไขโปรโมชั่น
export async function PATCH(request, { params }) {
  try {
    const promotionId = parseInt(params.id);
    const data = await request.json();
    
    const { productId, discountPercent, startDate, endDate, isActive, maxUsage } = data;

    // Validate required fields
    if (!productId || !discountPercent || !startDate || !endDate) {
      return NextResponse.json(
        { error: "productId, discountPercent, startDate, endDate are required" },
        { status: 400 }
      );
    }

    // Validate discount percent
    if (discountPercent < 0 || discountPercent > 100) {
      return NextResponse.json(
        { error: "Discount percent must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    // Check if promotion exists
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id: promotionId }
    });

    if (!existingPromotion) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Update promotion
    const updatedPromotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: {
        productId: parseInt(productId),
        discountPercent: parseFloat(discountPercent),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? !!isActive : true,
        maxUsage: maxUsage ? parseInt(maxUsage) : null,
        updatedAt: new Date()
      },
      include: { 
        product: {
          include: {
            category: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Promotion updated successfully",
      promotion: updatedPromotion
    });

  } catch (error) {
    console.error("Update promotion error:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Duplicate promotion for this product and date range" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update promotion" },
      { status: 500 }
    );
  }
}

// DELETE: ลบโปรโมชั่น
export async function DELETE(request, { params }) {
  try {
    const promotionId = parseInt(params.id);

    // Check if promotion exists
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        product: {
          include: {
            orderItems: {
              include: {
                order: true
              }
            }
          }
        }
      }
    });

    if (!existingPromotion) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    // Check if promotion is currently active and being used
    const now = new Date();
    const isCurrentlyActive = existingPromotion.isActive && 
                             existingPromotion.startDate <= now && 
                             existingPromotion.endDate >= now;

    if (isCurrentlyActive && existingPromotion.usageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete active promotion that has been used" },
        { status: 400 }
      );
    }

    // Delete the promotion
    await prisma.promotion.delete({
      where: { id: promotionId }
    });

    return NextResponse.json({
      success: true,
      message: "Promotion deleted successfully"
    });

  } catch (error) {
    console.error("Delete promotion error:", error);
    return NextResponse.json(
      { error: "Failed to delete promotion" },
      { status: 500 }
    );
  }
}