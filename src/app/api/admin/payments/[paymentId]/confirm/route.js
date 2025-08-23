// src/app/api/admin/payments/[paymentId]/confirm/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // For now, allow any authenticated user (you should implement proper admin check)
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Implement proper admin role checking

    const paymentId = parseInt(params.paymentId);
    const { action, note } = await request.json(); // action: 'confirm' or 'reject'

    if (!['confirm', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get payment with order
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: {
            include: {
              orderItems: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status !== "WAITING") {
        throw new Error("Payment is not waiting for confirmation");
      }

      const newStatus = action === 'confirm' ? 'CONFIRMED' : 'REJECTED';
      const now = new Date();

      // Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          confirmedAt: action === 'confirm' ? now : null,
          updatedAt: now,
        },
      });

      // Update order status
      let newOrderStatus = payment.order.status;
      if (action === 'confirm') {
        newOrderStatus = 'PAID';
      } else {
        // If rejected, we might want to restore stock
        newOrderStatus = 'CANCELLED';
        
        // Restore stock for rejected payments
        for (const orderItem of payment.order.orderItems) {
          await tx.product.update({
            where: { id: orderItem.productId },
            data: { stock: { increment: orderItem.quantity } },
          });

          // Record stock movement
          await tx.stockMovement.create({
            data: {
              productId: orderItem.productId,
              type: "IN",
              quantity: orderItem.quantity,
              referenceType: "RETURN",
              referenceId: payment.order.id,
              notes: `Payment rejected - Order #${payment.order.id}`,
            },
          });
        }
      }

      // Update order status
      await tx.order.update({
        where: { id: payment.order.id },
        data: { 
          status: newOrderStatus,
          updatedAt: now,
        },
      });

      // Log admin activity (if you have admin_activities table)
      // await tx.adminActivity.create({
      //   data: {
      //     adminId: token.adminId,
      //     action: `${action}_payment`,
      //     tableName: 'payments',
      //     recordId: paymentId,
      //     oldValues: { status: 'WAITING' },
      //     newValues: { status: newStatus },
      //     notes: note,
      //   },
      // });

      return updatedPayment;
    });

    return NextResponse.json({
      success: true,
      payment: result,
      message: `Payment ${action}ed successfully`,
    });

  } catch (error) {
    console.error("Payment confirmation error:", error);
    
    if (error.message.includes("not found") || error.message.includes("not waiting")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to process payment confirmation" },
      { status: 500 }
    );
  }
}