import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/shipping/[shippingId] - Get shipping details
export async function GET(request, { params }) {
  try {
    const shippingId = parseInt(params.shippingId);

    if (!shippingId) {
      return NextResponse.json(
        { error: "Invalid shipping ID" },
        { status: 400 }
      );
    }

    const shipping = await prisma.shipping.findUnique({
      where: { id: shippingId },
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
        { error: "Shipping record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(shipping);

  } catch (error) {
    console.error("Shipping fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/shipping/[shippingId] - Update shipping details
export async function PUT(request, { params }) {
  try {
    const shippingId = parseInt(params.shippingId);
    const { courier, trackingNumber, status } = await request.json();

    if (!shippingId) {
      return NextResponse.json(
        { error: "Invalid shipping ID" },
        { status: 400 }
      );
    }

    console.log("Updating shipping:", shippingId, { courier, trackingNumber, status });

    // Get current shipping record
    const currentShipping = await prisma.shipping.findUnique({
      where: { id: shippingId },
      include: { order: true },
    });

    if (!currentShipping) {
      return NextResponse.json(
        { error: "Shipping record not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {};
    if (courier !== undefined) updateData.courier = courier;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (status !== undefined) {
      updateData.status = status;
      
      // Set timestamps based on status
      if (status === "SHIPPED" && !currentShipping.shippedAt) {
        updateData.shippedAt = new Date();
      }
      if (status === "DELIVERED" && !currentShipping.deliveredAt) {
        updateData.deliveredAt = new Date();
      }
    }

    // Update shipping record
    const updatedShipping = await prisma.shipping.update({
      where: { id: shippingId },
      data: updateData,
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
          },
        },
      },
    });

    // Update order status based on shipping status
    let orderStatus = currentShipping.order.status;
    if (status === "SHIPPED" && trackingNumber) {
      orderStatus = "SHIPPING";
    } else if (status === "DELIVERED") {
      orderStatus = "COMPLETED";
    }

    if (orderStatus !== currentShipping.order.status) {
      await prisma.order.update({
        where: { id: currentShipping.orderId },
        data: { status: orderStatus },
      });
    }

    console.log("Updated shipping record:", updatedShipping.id);

    return NextResponse.json(updatedShipping);

  } catch (error) {
    console.error("Shipping update error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}