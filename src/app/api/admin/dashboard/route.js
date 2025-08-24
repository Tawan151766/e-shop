import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: สรุปข้อมูลสำหรับ dashboard admin
export async function GET() {
  try {
    // นับจำนวนข้อมูลหลัก ๆ และข้อมูลเพิ่มเติม
    const [
      productCount, 
      categoryCount, 
      orderCount, 
      customerCount, 
      promotionCount, 
      totalSales,
      stockStats, 
      lowStockCount,
      pendingOrders,
      waitingPayments,
      activePromotions,
      recentOrders,
      topProducts,
      todayOrders,
      monthlyOrders,
      outOfStockCount,
      expiredPromotions,
      topSellingProducts,
      recentCustomers,
      salesGrowth
    ] = await Promise.all([
      // Basic counts
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.category.count({ where: { deletedAt: null } }),
      prisma.order.count(),
      prisma.customer.count({ where: { deletedAt: null } }),
      prisma.promotion.count(),
      
      // Sales data
      prisma.order.aggregate({ 
        _sum: { totalAmount: true }, 
        where: { status: { in: ["PAID", "SHIPPING", "COMPLETED"] } } 
      }),
      
      // Stock data
      prisma.product.aggregate({ 
        _sum: { stock: true }, 
        where: { deletedAt: null } 
      }),
      prisma.product.count({ 
        where: { deletedAt: null, stock: { lte: 10 } } 
      }),
      
      // Order status data
      prisma.order.count({ 
        where: { status: "PENDING_PAYMENT" } 
      }),
      prisma.payment.count({ 
        where: { status: "WAITING" } 
      }),
      
      // Active promotions
      prisma.promotion.count({
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() }
        }
      }),
      
      // Recent orders (last 7 days)
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Top selling products (by order items)
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      
      // Today's orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // This month's orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // Out of stock products
      prisma.product.count({ 
        where: { deletedAt: null, stock: { lte: 0 } } 
      }),
      
      // Expired promotions
      prisma.promotion.count({
        where: {
          endDate: { lt: new Date() },
          isActive: true
        }
      }),
      
      // Top selling products with details
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10
      }),
      
      // Recent customers (last 30 days)
      prisma.customer.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          deletedAt: null
        }
      }),
      
      // Sales growth (compare last 30 days vs previous 30 days)
      Promise.all([
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: {
            status: { in: ["PAID", "SHIPPING", "COMPLETED"] },
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: {
            status: { in: ["PAID", "SHIPPING", "COMPLETED"] },
            createdAt: {
              gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ])
    ]);

    // Calculate sales growth percentage
    const currentSales = salesGrowth[0]._sum.totalAmount || 0;
    const previousSales = salesGrowth[1]._sum.totalAmount || 0;
    const growthPercentage = previousSales > 0 
      ? ((currentSales - previousSales) / previousSales * 100).toFixed(1)
      : 0;

    return Response.json({
      // Basic counts
      productCount,
      categoryCount,
      orderCount,
      customerCount,
      promotionCount,
      
      // Financial data
      totalSales: totalSales._sum.totalAmount || 0,
      currentMonthSales: currentSales,
      salesGrowthPercentage: growthPercentage,
      
      // Stock data
      totalStock: stockStats._sum.stock || 0,
      lowStockProducts: lowStockCount,
      outOfStockProducts: outOfStockCount,
      
      // Order management data
      pendingOrders,
      waitingPayments,
      todayOrders,
      monthlyOrders,
      
      // Promotion data
      activePromotions,
      expiredPromotions,
      
      // Recent activity
      recentOrders,
      recentCustomers,
      
      // Top products
      topProductsCount: topProducts.length,
      topSellingProductsCount: topSellingProducts.length,
      
      // Additional insights
      averageOrderValue: orderCount > 0 ? (totalSales._sum.totalAmount || 0) / orderCount : 0,
      stockTurnoverRate: stockStats._sum.stock > 0 ? (topProducts.reduce((sum, p) => sum + (p._sum.quantity || 0), 0) / stockStats._sum.stock * 100).toFixed(1) : 0,
      
      // System health indicators
      systemHealth: {
        stockStatus: lowStockCount === 0 && outOfStockCount === 0 ? 'good' : lowStockCount > 0 ? 'warning' : 'critical',
        orderStatus: pendingOrders === 0 ? 'good' : pendingOrders < 10 ? 'warning' : 'critical',
        paymentStatus: waitingPayments === 0 ? 'good' : waitingPayments < 5 ? 'warning' : 'critical',
        promotionStatus: activePromotions > 0 ? 'good' : 'warning'
      }
    });
  } catch (e) {
    console.error('Dashboard API Error:', e);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
