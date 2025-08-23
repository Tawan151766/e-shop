// src/app/api/admin/orders/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Create a new Prisma instance for this API
const prisma = new PrismaClient();

export async function GET(request) {
  try {
    console.log("=== Admin orders API called ===");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 20;

    console.log("Query params:", { status, page, pageSize });

    // Build where clause
    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    console.log("Where clause:", where);

    // Test database connection first
    console.log("Testing database connection...");
    await prisma.$connect();
    console.log("Database connected successfully");

    // Step 1: Try basic query first
    console.log("Fetching basic orders...");
    const basicOrders = await prisma.order.findMany({
      where,
      take: 5,
    });
    console.log("Basic query successful, found:", basicOrders.length);

    // Step 2: Try with customer and orderItems relation
    console.log("Fetching orders with relations...");
    const orders = await prisma.order.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    console.log("Orders with relations fetched:", orders.length);

    const total = await prisma.order.count({ where });
    console.log("Total count:", total);

    return NextResponse.json({
      orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });

  } catch (error) {
    console.error("Orders fetch error:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}