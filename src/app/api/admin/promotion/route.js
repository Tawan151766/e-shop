import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: ดึงโปรโมชั่นทั้งหมด (รวมชื่อสินค้า)
export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      include: { 
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(promotions);
  } catch (e) {
    console.error("Get promotions error:", e);
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

    // Validate discount percent
    if (discountPercent < 0 || discountPercent > 100) {
      return Response.json({ error: 'Discount percent must be between 0 and 100' }, { status: 400 });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return Response.json({ error: 'Start date must be before end date' }, { status: 400 });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        productId: parseInt(productId),
        discountPercent: parseFloat(discountPercent),
        startDate: start,
        endDate: end,
        isActive: isActive !== undefined ? !!isActive : true,
        maxUsage: maxUsage ? parseInt(maxUsage) : null,
      },
      include: { 
        product: {
          include: {
            category: true
          }
        }
      }
    });

    return Response.json({
      success: true,
      message: "Promotion created successfully",
      promotion
    }, { status: 201 });

  } catch (e) {
    console.error("Create promotion error:", e);
    
    if (e.code === 'P2002') {
      return Response.json({ error: 'Duplicate promotion for this product and date range' }, { status: 400 });
    }
    
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
