// src/app/checkout/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeForClient } from "@/lib/serialize";
import ClientCheckoutPage from "@/module/checkout/ClientCheckoutPage";

export default async function CheckoutPage() {
  let session = null;
  
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Session error:", error);
    redirect("/auth/signin?callbackUrl=/checkout");
  }
  
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/checkout");
  }

  const customerId = parseInt(session.user.id);
  
  // Get cart data
  const cart = await prisma.cart.findUnique({
    where: { customerId },
    include: {
      cartItems: {
        include: {
          product: {
            include: {
              category: true,
              promotions: {
                where: {
                  isActive: true,
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                },
              },
              galleries: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Get customer info
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      name: true,
      email: true,
      phone: true,
      address: true,
    },
  });

  // If no cart or empty cart, redirect to cart page
  if (!cart || !cart.cartItems.length) {
    redirect("/cart");
  }

  // Serialize data
  const serializedCart = serializeForClient(cart);
  const serializedCustomer = serializeForClient(customer);
  
  // Filter valid items and calculate summary
  const validCartItems = serializedCart.cartItems.filter(item => 
    item.product && !item.product.deletedAt
  );

  const cartSummary = validCartItems.reduce((acc, item) => {
    const product = item.product;
    let itemPrice = product.price;
    let originalPrice = itemPrice;
    
    if (product.promotions?.length > 0) {
      const discount = product.promotions[0].discountPercent;
      itemPrice = itemPrice * (1 - discount / 100);
    }

    const itemTotal = itemPrice * item.quantity;
    const originalTotal = originalPrice * item.quantity;
    
    return {
      totalItems: acc.totalItems + item.quantity,
      totalAmount: acc.totalAmount + itemTotal,
      originalAmount: acc.originalAmount + originalTotal,
      totalDiscount: acc.totalDiscount + (originalTotal - itemTotal),
    };
  }, { totalItems: 0, totalAmount: 0, originalAmount: 0, totalDiscount: 0 });

  // Calculate shipping
  const shippingFee = cartSummary.totalAmount >= 1000 ? 0 : 50;
  const finalTotal = cartSummary.totalAmount + shippingFee;

  const checkoutData = {
    cart: {
      items: validCartItems,
      summary: {
        ...cartSummary,
        shippingFee,
        finalTotal,
      },
    },
    customer: serializedCustomer,
  };

  return <ClientCheckoutPage checkoutData={checkoutData} />;
}