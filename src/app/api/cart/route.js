// src/app/api/cart/route.js
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/cart - ดึงรายการตะกร้า
export async function GET(request) {
  try {
    console.log("=== GET /api/cart called ===");
    console.log("Headers:", Object.fromEntries(request.headers.entries()));
    console.log("Cookies:", request.headers.get("cookie"));
    
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });
    
    console.log("Token result:", token);
    console.log("Token ID:", token?.id);
    console.log("Token exp:", token?.exp ? new Date(token.exp * 1000) : "No expiry");
    
    if (!token?.id) {
      console.log("❌ No token or user ID found");
      return NextResponse.json({ error: "Unauthorized", debug: "No token" }, { status: 401 });
    }

    const customerId = parseInt(token.id);

    // หา cart ของ customer หรือสร้างใหม่ถ้าไม่มี
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

    // Filter out deleted products
    const validCartItems = cart.cartItems.filter(item => 
      item.product && !item.product.deletedAt
    );

    // คำนวณราคารวม
    const cartSummary = validCartItems.reduce(
      (acc, item) => {
        const product = item.product;
        let itemPrice = Number(product.price);
        let originalPrice = itemPrice;
        
        if (product.promotions.length > 0) {
          const discount = Number(product.promotions[0].discountPercent);
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

    return NextResponse.json({
      success: true,
      cart: {
        id: cart.id,
        customerId: cart.customerId,
        items: validCartItems,
        summary: cartSummary,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get cart" },
      { status: 500 }
    );
  }
}

// POST /api/cart - เพิ่มสินค้าลงตะกร้า
export async function POST(request) {
  try {
    console.log("POST /api/cart called");
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    console.log("POST Token:", token ? "Found" : "Not found");
    console.log("Token data:", token);
    
    if (!token?.id) {
      console.log("POST: No token or user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity = 1 } = await request.json();
    const customerId = parseInt(token.id);
    
    console.log("POST Customer ID:", customerId);
    console.log("Product ID:", productId, "Quantity:", quantity);

    if (!productId || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid product or quantity" },
        { status: 400 }
      );
    }

    // ตรวจสอบสินค้า
    const product = await prisma.product.findUnique({
      where: { 
        id: productId, 
        deletedAt: null 
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ 
        error: "Insufficient stock",
        availableStock: product.stock 
      }, { status: 400 });
    }

    // หา cart หรือสร้างใหม่
    let cart = await prisma.cart.findUnique({
      where: { customerId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId },
      });
      console.log("Created new cart:", cart.id);
    }

    // ตรวจสอบว่ามีสินค้านี้ในตะกร้าแล้วหรือไม่
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    if (existingCartItem) {
      // อัปเดตจำนวน
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { 
            error: "Total quantity exceeds stock",
            currentQuantity: existingCartItem.quantity,
            requestedQuantity: quantity,
            availableStock: product.stock
          },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      });
      
      console.log("Updated existing cart item to quantity:", newQuantity);
    } else {
      // เพิ่มสินค้าใหม่
      const newCartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
        },
      });
      
      console.log("Created new cart item:", newCartItem.id);
    }

    return NextResponse.json({
      success: true,
      message: "Product added to cart successfully",
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}