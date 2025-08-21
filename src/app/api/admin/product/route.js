import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: ดึงสินค้าทั้งหมด (รวมชื่อหมวดหมู่)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(products);
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: สร้างสินค้าใหม่
export async function POST(req) {
  try {
    const { name, description, price, stock, categoryId, imageUrl } = await req.json();
    if (!name || !price || !categoryId) {
      return Response.json({ error: 'Name, price, and categoryId are required' }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        categoryId: parseInt(categoryId),
        imageUrl,
      },
    });
    return Response.json(product, { status: 201 });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
