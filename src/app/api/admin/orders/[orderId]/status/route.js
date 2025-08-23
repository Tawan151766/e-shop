// src/app/api/admin/orders/[orderId]/status/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    // TODO: Add admin authentication later
    // const adminUser = await verifyAdminToken(request);
    // if (!adminUser) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { orderId } = params;
    const { status, paymentVerified, verifiedAt } = await request.json();

    // Validate status
    const validStatuses = [
      "PENDING_PAYMENT",
      "WAITING_CONFIRM", 
      "PAID",
      "SHIPPING",
      "COMPLETED",
      "CANCELLED"
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Handle stock restoration for cancelled orders
    if (status === "CANCELLED" && existingOrder.status !== "CANCELLED") {
      // Restore stock for cancelled orders
      for (const item of existingOrder.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    // Prepare update data
    const updateData = {
      status,
      updatedAt: new Date(),
    };

    // Add payment verification data if provided
    if (paymentVerified !== undefined) {
      updateData.paymentVerified = paymentVerified;
      if (verifiedAt) {
        updateData.verifiedAt = new Date(verifiedAt);
      }
      if (status === "PAID") {
        updateData.paidAt = new Date();
      }
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });

  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}