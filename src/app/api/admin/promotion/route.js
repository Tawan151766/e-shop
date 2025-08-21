import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: ดึงโปรโมชั่นทั้งหมด (รวมชื่อสินค้า)
export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(promotions);
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: สร้างโปรโมชั่นใหม่
export async function POST(req) {
  try {
    const { productId, discountPercent, startDate, endDate, isActive, maxUsage } = await req.json();
    if (!productId || !discountPercent || !startDate || !endDate) {
      return Response.json({ error: 'productId, discountPercent, startDate, endDate are required' }, { status: 400 });
    }
    const promotion = await prisma.promotion.create({
      data: {
        productId: parseInt(productId),
        discountPercent: parseFloat(discountPercent),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? !!isActive : true,
        maxUsage: maxUsage ? parseInt(maxUsage) : null,
      },
    });
    return Response.json(promotion, { status: 201 });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
