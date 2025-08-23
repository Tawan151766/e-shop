import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/shipping - Get all shipping records
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 20;
    const search = searchParams.get("search");

    console.log("Fetching shipping records with params:", { status, orderId, page, pageSize, search });

    // Build where clause
    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (orderId) {
      where.orderId = parseInt(orderId);
    }
    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: "insensitive" } },
        { courier: { contains: search, mode: "insensitive" } },
        { order: { customer: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    // Get shipping records with pagination
    const [shippings, total] = await Promise.all([
      prisma.shipping.findMany({
        where,
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
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.shipping.count({ where }),
    ]);

    console.log("Found shipping records:", shippings.length, "Total:", total);

    return NextResponse.json({
      shippings,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });

  } catch (error) {
    console.error("Shipping fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/shipping - Create shipping record
export async function POST(request) {
  try {
    const { orderId, courier, trackingNumber } = await request.json();

    console.log("Creating shipping record:", { orderId, courier, trackingNumber });

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Check if order exists and is in PAID status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shippings: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== "PAID") {
      return NextResponse.json(
        { error: "Order must be paid before shipping" },
        { status: 400 }
      );
    }

    // Check if shipping already exists for this order
    if (order.shippings.length > 0) {
      return NextResponse.json(
        { error: "Shipping record already exists for this order" },
        { status: 400 }
      );
    }

    // Create shipping record
    const shipping = await prisma.shipping.create({
      data: {
        orderId,
        courier: courier || null,
        trackingNumber: trackingNumber || null,
        status: "PREPARING",
      },
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

    // Update order status to SHIPPING if tracking number is provided
    if (trackingNumber) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "SHIPPING" },
      });

      await prisma.shipping.update({
        where: { id: shipping.id },
        data: {
          status: "SHIPPED",
          shippedAt: new Date(),
        },
      });
    }

    console.log("Created shipping record:", shipping.id);

    return NextResponse.json(shipping, { status: 201 });

  } catch (error) {
    console.error("Shipping creation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}