// src/app/api/admin/orders/statistics/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    // TODO: Add admin authentication later
    // const adminUser = await verifyAdminToken(request);
    // if (!adminUser) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get order statistics
    const [
      totalOrders,
      pendingPayment,
      waitingConfirm,
      paid,
      shipping,
      completed,
      cancelled,
      totalRevenue,
      todayOrders,
      todayRevenue,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),
      
      // Orders by status
      prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
      prisma.order.count({ where: { status: "WAITING_CONFIRM" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "SHIPPING" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      
      // Total revenue (completed orders only)
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { totalAmount: true },
      }),
      
      // Today's orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      }),
      
      // Today's revenue (completed orders only)
      prisma.order.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    const statistics = {
      totalOrders,
      pendingPayment,
      waitingConfirm,
      paid,
      shipping,
      completed,
      cancelled,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      todayOrders,
      todayRevenue: Number(todayRevenue._sum.totalAmount || 0),
    };

    return NextResponse.json(statistics);

  } catch (error) {
    console.error("Order statistics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}