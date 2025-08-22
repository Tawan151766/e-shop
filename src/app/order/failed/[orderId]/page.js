// src/app/order/failed/[orderId]/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeForClient } from "@/lib/serialize";
import OrderFailedPage from "@/module/order/OrderFailedPage";

export default async function OrderFailed({ params }) {
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
      payment: {
        select: {
          id: true,
          status: true,
          slipUrl: true,
        },
      },
    },
  });

  if (!order) {
    redirect("/");
  }

  const serializedOrder = serializeForClient(order);

  return <OrderFailedPage orderData={serializedOrder} />;
}