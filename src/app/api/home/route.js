import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: ดึงข้อมูลสำหรับหน้าแรกของลูกค้า
export async function GET() {
  try {
    // สินค้าแนะนำ (เช่น สินค้าที่มีโปรโมชั่น)
    const featuredProducts = await prisma.product.findMany({
      where: {
        promotions: {
          some: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      },
      include: {
        promotions: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    // หมวดหมู่สินค้า (พร้อมสินค้าในแต่ละหมวดหมู่)
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      include: {
        products: {
          where: { deletedAt: null },
          take: 8,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    // สินค้าใหม่ล่าสุด
    const latestProducts = await prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { category: true },
    });

    return Response.json({
      featuredProducts,
      categories,
      latestProducts,
    });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
