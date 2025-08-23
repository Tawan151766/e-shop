// src/app/api/admin/payments/statistics/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
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

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get payment statistics
    const [
      totalPayments,
      confirmedPayments,
      waitingPayments,
      rejectedPayments,
      totalAmountResult,
      confirmedAmountResult,
      todayPayments,
      todayAmountResult,
    ] = await Promise.all([
      // Total payments count
      prisma.payment.count(),
      
      // Confirmed payments count
      prisma.payment.count({
        where: { status: "CONFIRMED" }
      }),
      
      // Waiting payments count
      prisma.payment.count({
        where: { status: "WAITING" }
      }),
      
      // Rejected payments count
      prisma.payment.count({
        where: { status: "REJECTED" }
      }),
      
      // Total amount
      prisma.payment.aggregate({
        _sum: { amount: true }
      }),
      
      // Confirmed amount
      prisma.payment.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { amount: true }
      }),
      
      // Today's payments count
      prisma.payment.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          }
        }
      }),
      
      // Today's amount
      prisma.payment.aggregate({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          }
        },
        _sum: { amount: true }
      }),
    ]);

    const statistics = {
      totalPayments,
      confirmedPayments,
      waitingPayments,
      rejectedPayments,
      totalAmount: Number(totalAmountResult._sum.amount || 0),
      confirmedAmount: Number(confirmedAmountResult._sum.amount || 0),
      todayPayments,
      todayAmount: Number(todayAmountResult._sum.amount || 0),
    };

    return NextResponse.json(statistics);

  } catch (error) {
    console.error("Payment statistics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment statistics" },
      { status: 500 }
    );
  }
}