// src/app/api/admin/payments/[paymentId]/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // For now, allow any authenticated user (you should implement proper admin check)
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentId = parseInt(params.paymentId);

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { error: "Invalid payment ID" },
        { status: 400 }
      );
    }

    // Get payment with order details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
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
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ payment });

  } catch (error) {
    console.error("Payment fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}