import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: สรุปข้อมูลสำหรับ dashboard admin
export async function GET() {
  try {
    // นับจำนวนข้อมูลหลัก ๆ
    const [productCount, categoryCount, orderCount, customerCount, promotionCount, totalSales] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.promotion.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { in: ["PAID", "SHIPPING", "COMPLETED"] } } })
    ]);

    return Response.json({
      productCount,
      categoryCount,
      orderCount,
      customerCount,
      promotionCount,
      totalSales: totalSales._sum.totalAmount || 0
    });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
