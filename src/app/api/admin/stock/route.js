// src/app/api/admin/stock/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const lowStock = searchParams.get("lowStock") === "true";

    const skip = (page - 1) * limit;

    // Build where condition
    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { category: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
      ...(lowStock && { stock: { lte: 10 } }), // Products with stock <= 10
    };

    // Get products with stock info
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          stockMovements: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Get stock statistics
    const stockStats = await prisma.product.aggregate({
      where: { deletedAt: null },
      _count: { id: true },
      _sum: { stock: true },
      _avg: { stock: true },
    });

    const lowStockCount = await prisma.product.count({
      where: { deletedAt: null, stock: { lte: 10 } },
    });

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statistics: {
        totalProducts: stockStats._count.id,
        totalStock: stockStats._sum.stock || 0,
        averageStock: Math.round(stockStats._avg.stock || 0),
        lowStockProducts: lowStockCount,
      },
    });
  } catch (error) {
    console.error("Stock API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
