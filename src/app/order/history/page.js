// src/app/order/history/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeForClient } from "@/lib/serialize";
import OrderHistory from "@/module/customer/order/OrderHistory";

export default async function OrderHistoryPage() {
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

  const customerId = parseInt(session.user.id);

  // Get customer's orders
  const orders = await prisma.order.findMany({
    where: {
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
              price: true,
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const serializedOrders = serializeForClient(orders);

  return (
    <div style={{ minHeight: "80vh", backgroundColor: "#f5f5f5", padding: "24px 0" }}>
      <OrderHistory orders={serializedOrders} />
    </div>
  );
}