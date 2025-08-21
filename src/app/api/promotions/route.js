import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();
    // Find active promotions with product info
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        product: {
          deletedAt: null,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    // Filter out promotions without product
    const promoProducts = promotions
      .filter((promo) => promo.product)
      .map((promo) => ({
        ...promo.product,
        promotion: {
          id: promo.id,
          discountPercent: promo.discountPercent,
          startDate: promo.startDate,
          endDate: promo.endDate,
        },
      }));
    return NextResponse.json({ products: promoProducts });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
