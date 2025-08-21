import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: ดึงหมวดหมู่ทั้งหมด
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(categories);
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: สร้างหมวดหมู่ใหม่
export async function POST(req) {
  try {
    const { name, description } = await req.json();
    if (!name) {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }
    const category = await prisma.category.create({
      data: { name, description },
    });
    return Response.json(category, { status: 201 });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
