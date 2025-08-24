import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: ดึงสินค้าทั้งหมด (รวมชื่อหมวดหมู่) - ไม่รวมสินค้าที่ถูกลบ
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(products);
  } catch (e) {
    console.error("Get products error:", e);
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

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: stock ? parseInt(stock) : 0,
          categoryId: parseInt(categoryId),
          imageUrl,
        },
        include: { category: true }
      });

      // Record initial stock if any
      if (stock && parseInt(stock) > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: 'IN',
            quantity: parseInt(stock),
            referenceType: 'ADJUSTMENT',
            notes: 'Initial stock when creating product'
          }
        });
      }

      return product;
    });

    return Response.json({
      success: true,
      message: "Product created successfully",
      product: result
    }, { status: 201 });

  } catch (e) {
    console.error("Create product error:", e);
    
    if (e.code === 'P2002') {
      return Response.json({ error: 'Product name already exists' }, { status: 400 });
    }
    
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
