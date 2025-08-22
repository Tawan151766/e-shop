// src/app/api/checkout/route.js
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shippingInfo } = await request.json();
    const customerId = parseInt(token.id);

    // Validate shipping info
    if (!shippingInfo?.name || !shippingInfo?.phone || !shippingInfo?.address) {
      return NextResponse.json(
        { error: "Missing required shipping information" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get cart with items
      const cart = await tx.cart.findUnique({
        where: { customerId },
        include: {
          cartItems: {
            include: {
              product: {
                include: {
                  promotions: {
                    where: {
                      isActive: true,
                      startDate: { lte: new Date() },
                      endDate: { gte: new Date() },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!cart || !cart.cartItems.length) {
        throw new Error("Cart is empty");
      }

      // Validate stock and calculate total
      let totalAmount = 0;
      const orderItemsData = [];

      for (const cartItem of cart.cartItems) {
        const product = cartItem.product;
        
        // Check if product still exists and has stock
        if (product.deletedAt || product.stock < cartItem.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        // Calculate price with promotion
        let itemPrice = Number(product.price);
        if (product.promotions.length > 0) {
          const discount = Number(product.promotions[0].discountPercent);
          itemPrice = itemPrice * (1 - discount / 100);
        }

        const itemTotal = itemPrice * cartItem.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: itemPrice,
        });

        // Update stock
        await tx.product.update({
          where: { id: cartItem.productId },
          data: { stock: { decrement: cartItem.quantity } },
        });

        // Record stock movement
        await tx.stockMovement.create({
          data: {
            productId: cartItem.productId,
            type: "OUT",
            quantity: cartItem.quantity,
            referenceType: "SALE",
            notes: "Order checkout",
          },
        });
      }

      // Create order
      const order = await tx.order.create({
        data: {
          customerId,
          status: "PENDING_PAYMENT",
          totalAmount,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          status: "WAITING",
        },
      });

      // Create shipping record
      const shipping = await tx.shipping.create({
        data: {
          orderId: order.id,
          status: "PREPARING",
        },
      });

      // Update customer shipping info
      await tx.customer.update({
        where: { id: customerId },
        data: {
          name: shippingInfo.name,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
        },
      });

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return {
        order,
        payment,
        shipping,
      };
    });

    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      paymentId: result.payment.id,
      totalAmount: Number(result.order.totalAmount),
      message: "Order created successfully",
    });

  } catch (error) {
    console.error("Checkout error:", error);
    
    if (error.message.includes("stock") || error.message.includes("empty")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}