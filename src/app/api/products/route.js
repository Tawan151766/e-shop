import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "16", 10);
    const skip = (page - 1) * pageSize;

    // Filter by category if provided
    const categoryId = searchParams.get("categoryId");
    const where = { deletedAt: null };
    if (categoryId && categoryId !== "all") {
      where.categoryId = Number(categoryId);
    }

    const now = new Date();
    const [products, total] = await Promise.all([
      prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        promotions: {
        where: {
          startDate: { lte: now },
          endDate: { gte: now },
        },
        take: 1, // แสดงแค่ promotion ปัจจุบันอันเดียว
        },
      },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
