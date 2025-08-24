import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Update category
export async function PATCH(req, { params }) {
  const { id } = params;
  const data = await req.json();
  try {
    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Delete category
export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    const deleted = await prisma.category.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json(deleted);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
