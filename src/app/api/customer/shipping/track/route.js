import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/customer/shipping/track?trackingNumber=xxx - Track shipment by tracking number
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get("trackingNumber");

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Tracking number is required" },
        { status: 400 }
      );
    }

    console.log("Tracking shipment:", trackingNumber);

    const shipping = await prisma.shipping.findFirst({
      where: { trackingNumber },
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
              },
            },
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!shipping) {
      return NextResponse.json(
        { error: "Tracking number not found" },
        { status: 404 }
      );
    }

    // Create tracking timeline
    const timeline = [
      {
        status: "PREPARING",
        title: "เตรียมสินค้า",
        description: "กำลังเตรียมสินค้าสำหรับจัดส่ง",
        timestamp: shipping.createdAt,
        completed: true,
      },
    ];

    if (shipping.shippedAt) {
      timeline.push({
        status: "SHIPPED",
        title: "จัดส่งแล้ว",
        description: `สินค้าถูกส่งโดย ${shipping.courier || "บริษัทขนส่ง"}`,
        timestamp: shipping.shippedAt,
        completed: true,
      });
    }

    if (shipping.deliveredAt) {
      timeline.push({
        status: "DELIVERED",
        title: "จัดส่งสำเร็จ",
        description: "สินค้าถูกส่งถึงผู้รับเรียบร้อยแล้ว",
        timestamp: shipping.deliveredAt,
        completed: true,
      });
    } else if (shipping.status === "SHIPPED") {
      timeline.push({
        status: "DELIVERED",
        title: "กำลังจัดส่ง",
        description: "สินค้าอยู่ระหว่างการจัดส่ง",
        timestamp: null,
        completed: false,
      });
    }

    const trackingInfo = {
      trackingNumber: shipping.trackingNumber,
      courier: shipping.courier,
      currentStatus: shipping.status,
      order: {
        id: shipping.order.id,
        totalAmount: shipping.order.totalAmount,
        createdAt: shipping.order.createdAt,
        customer: shipping.order.customer,
        items: shipping.order.orderItems,
      },
      timeline,
      estimatedDelivery: shipping.shippedAt 
        ? new Date(shipping.shippedAt.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from shipped
        : null,
    };

    return NextResponse.json(trackingInfo);

  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}