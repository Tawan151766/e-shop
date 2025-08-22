// src/app/api/payment/[paymentId]/status/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentId = parseInt(params.paymentId);
    const customerId = parseInt(token.id);

    // Get payment status
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        order: {
          customerId: customerId,
        },
      },
      select: {
        id: true,
        status: true,
        slipUrl: true,
        confirmedAt: true,
        updatedAt: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: payment.status,
      slipUrl: payment.slipUrl,
      confirmedAt: payment.confirmedAt,
      updatedAt: payment.updatedAt,
    });

  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}