import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/products/[id]
export async function GET(req, { params }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        promotions: true,
        galleries: true,
      },
    });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
