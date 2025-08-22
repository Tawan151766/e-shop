// src/app/cart/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientCartPage from "@/module/cart/ClientCartPage";

export default async function CartPage() {
  let session = null;
  
  // Safely get session with error handling
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Session error:", error);
    // If session fails, redirect to signin
    redirect("/auth/signin?callbackUrl=/cart");
  }
  
  // Redirect if not authenticated
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/cart");
  }

  // Fetch cart data on server side
  const customerId = parseInt(session.user.id);
  
  let cart = await prisma.cart.findUnique({
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
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { customerId },
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
        },
      },
    });
  }

  // Filter out deleted products and serialize data
  const validCartItems = cart.cartItems
    .filter(item => item.product && !item.product.deletedAt)
    .map(item => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price), // Convert Decimal to Number
        promotions: item.product.promotions.map(promo => ({
          ...promo,
          discountPercent: Number(promo.discountPercent), // Convert Decimal to Number
        })),
      },
    }));

  // Calculate summary
  const cartSummary = validCartItems.reduce(
    (acc, item) => {
      const product = item.product;
      let itemPrice = product.price; // Already converted to Number
      let originalPrice = itemPrice;
      
      if (product.promotions.length > 0) {
        const discount = product.promotions[0].discountPercent; // Already converted to Number
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
    },
    { 
      totalItems: 0, 
      totalAmount: 0, 
      originalAmount: 0,
      totalDiscount: 0 
    }
  );

  const cartData = {
    id: cart.id,
    customerId: cart.customerId,
    items: validCartItems,
    summary: cartSummary,
    createdAt: cart.createdAt.toISOString(), // Convert Date to string
    updatedAt: cart.updatedAt.toISOString(), // Convert Date to string
  };

  // Pass data to client component
  return <ClientCartPage initialCart={cartData} />;
}