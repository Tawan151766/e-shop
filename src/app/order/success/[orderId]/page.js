// src/app/order/success/[orderId]/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeForClient } from "@/lib/serialize";
import OrderSuccessPage from "@/module/order/OrderSuccessPage";

export default async function OrderSuccess({ params }) {
  let session = null;
  
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Session error:", error);
    redirect("/auth/signin");
  }
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const orderId = parseInt(params.orderId);
  const customerId = parseInt(session.user.id);

  // Get order details
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerId: customerId,
    },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      },
      payment: {
        select: {
          id: true,
          status: true,
          confirmedAt: true,
        },
      },
      shipping: {
        select: {
          id: true,
          status: true,
          trackingNumber: true,
        },
      },
      customer: {
        select: {
          name: true,
          phone: true,
          address: true,
        },
      },
    },
  });

  if (!order) {
    redirect("/");
  }

  const serializedOrder = serializeForClient(order);

  return <OrderSuccessPage orderData={serializedOrder} />;
}