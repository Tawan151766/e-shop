import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET: /api/admin/product_galleries?productId=1
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const where = productId ? { productId: Number(productId) } : {};
    const galleries = await prisma.productGallery.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ galleries });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST: /api/admin/product_galleries
// body: { productId: number, imageUrl: string }
export async function POST(req) {
  try {
    const body = await req.json();
    const { productId, imageUrl } = body;
    if (!productId || !imageUrl) {
      return NextResponse.json({ error: 'productId and imageUrl required' }, { status: 400 });
    }
    const gallery = await prisma.productGallery.create({
      data: { productId, imageUrl },
    });
    return NextResponse.json({ gallery });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: /api/admin/product_galleries?id=1
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    await prisma.productGallery.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
