import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return Response.json({ error: 'Username and password are required' }, { status: 400 });
    }
    // Find admin by username
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin || !admin.isActive) {
      return Response.json({ error: 'Invalid username or password' }, { status: 401 });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return Response.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Create session in AdminSession table
    const sessionId = randomUUID();
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7); // 7 days
    await prisma.adminSession.create({
      data: {
        id: sessionId,
        adminId: admin.id,
        ipAddress,
        userAgent,
        lastActivity: now,
        expiresAt,
        createdAt: now,
      },
    });

    // Success: return admin info (no password) and session id
    return Response.json({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      email: admin.email,
      avatarUrl: admin.avatarUrl,
      sessionId,
      expiresAt,
    });
  } catch (e) {
    console.error('Admin login error:', e);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
