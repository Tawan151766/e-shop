// src/app/api/customer/shipping/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Verify that the order belongs to the customer
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        customerId: parseInt(token.id)
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or access denied" },
        { status: 404 }
      );
    }

    // Get shipping information for this order
    const shippings = await prisma.shipping.findMany({
      where: { orderId: parseInt(orderId) },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ shippings });

  } catch (error) {
    console.error("Customer shipping fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping information" },
      { status: 500 }
    );
  }
}