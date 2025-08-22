// src/app/payment/[paymentId]/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeForClient } from "@/lib/serialize";
import ClientPaymentPage from "@/module/payment/ClientPaymentPage";

export default async function PaymentPage({ params, searchParams }) {
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

  const paymentId = parseInt(params.paymentId);
  const orderId = searchParams.orderId ? parseInt(searchParams.orderId) : null;
  const customerId = parseInt(session.user.id);

  // Get payment with order details
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      order: {
        customerId: customerId,
      },
    },
    include: {
      order: {
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
          customer: {
            select: {
              name: true,
              phone: true,
              address: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    redirect("/");
  }

  // If payment is already confirmed, redirect to order success
  if (payment.status === "CONFIRMED") {
    redirect(`/order/success/${payment.order.id}`);
  }

  // If payment is rejected, redirect to order failed
  if (payment.status === "REJECTED") {
    redirect(`/order/failed/${payment.order.id}`);
  }

  const serializedPayment = serializeForClient(payment);

  return <ClientPaymentPage paymentData={serializedPayment} />;
}