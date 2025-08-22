// src/app/api/payment/generate-qr/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(request) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, orderId } = await request.json();

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // PromptPay configuration
    const promptPayId = "0812345678"; // Replace with actual PromptPay number
    const formattedAmount = Number(amount).toFixed(2);

    // Generate PromptPay QR Code using external service
    // For demo purposes, we'll use a simple QR code generator
    const qrData = generatePromptPayQRData(promptPayId, formattedAmount);
    
    // Use QR code generation service (example with qr-server.com)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

    return NextResponse.json({
      success: true,
      qrCodeUrl,
      promptPayId,
      amount: formattedAmount,
    });

  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}

function generatePromptPayQRData(promptPayId, amount) {
  // This is a simplified PromptPay QR format
  // In production, you should use proper PromptPay QR generation library
  
  // Basic PromptPay QR structure
  const payload = [
    "00", "02", "01", // Payload Format Indicator
    "01", "12", "02", // Point of Initiation Method
    "29", "37", // Merchant Account Information
    "0016", "A000000677010111", // Application Identifier
    "01", String(promptPayId.length).padStart(2, '0'), promptPayId, // PromptPay ID
    "53", "03", "764", // Transaction Currency (THB)
    "54", String(amount.length).padStart(2, '0'), amount, // Transaction Amount
    "58", "02", "TH", // Country Code
    "62", "07", "0503***", // Additional Data Field Template
    "63", "04", // CRC (placeholder)
  ].join("");

  // Calculate CRC16 (simplified - in production use proper CRC16 calculation)
  const crc = "1234"; // Placeholder CRC
  
  return payload + crc;
}