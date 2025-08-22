// src/app/api/payment/upload-slip/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("slip");
    const paymentId = formData.get("paymentId");

    if (!file || !paymentId) {
      return NextResponse.json(
        { error: "Missing file or payment ID" },
        { status: 400 }
      );
    }

    const customerId = parseInt(token.id);

    // Verify payment belongs to customer
    const payment = await prisma.payment.findFirst({
      where: {
        id: parseInt(paymentId),
        order: {
          customerId: customerId,
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if payment is still waiting
    if (payment.status !== "WAITING") {
      return NextResponse.json(
        { error: "Payment is no longer waiting for confirmation" },
        { status: 400 }
      );
    }

    // Validate file
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", "slips");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `slip_${paymentId}_${timestamp}.${extension}`;
    const filepath = join(uploadDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update payment record
    const slipUrl = `/uploads/slips/${filename}`;
    await prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        slipUrl: slipUrl,
        paymentDate: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      slipUrl: slipUrl,
      message: "Slip uploaded successfully",
    });

  } catch (error) {
    console.error("Slip upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload slip" },
      { status: 500 }
    );
  }
}