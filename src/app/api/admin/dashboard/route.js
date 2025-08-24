import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: สรุปข้อมูลสำหรับ dashboard admin
export async function GET() {
  try {
    // นับจำนวนข้อมูลหลัก ๆ
    const [productCount, categoryCount, orderCount, customerCount, promotionCount, totalSales, stockStats, lowStockCount] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.promotion.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { in: ["PAID", "SHIPPING", "COMPLETED"] } } }),
      prisma.product.aggregate({ _sum: { stock: true }, where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null, stock: { lte: 10 } } })
    ]);

    return Response.json({
      productCount,
      categoryCount,
      orderCount,
      customerCount,
      promotionCount,
      totalSales: totalSales._sum.totalAmount || 0,
      totalStock: stockStats._sum.stock || 0,
      lowStockProducts: lowStockCount
    });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
