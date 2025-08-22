// src/app/api/admin/payments/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // Check if user is admin (you'll need to implement admin authentication)
    if (!token?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'WAITING';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const skip = (page - 1) * pageSize;

    // Get payments with order details
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { status },
        include: {
          order: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
              orderItems: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      imageUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.payment.count({ where: { status } }),
    ]);

    return NextResponse.json({
      payments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });

  } catch (error) {
    console.error("Admin payments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}