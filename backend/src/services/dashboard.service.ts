import { prisma } from "../config/prisma";

export type DashboardRange = 7 | 30 | 90;

export const getAdminDashboard = async (
  range: DashboardRange = 7
) => {
  const now = new Date();

  const startDate = new Date(now);

  startDate.setDate(startDate.getDate() - (range - 1));
  startDate.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalReviews,
    averageRating,
    totalRevenueResult,
    pendingOrders,
    lowStockProductGroups,
    unansweredReviews,
    recentOrders,
    recentReviews,
    ordersByStatus,
    salesOrders,
  ] = await Promise.all([
    // Total users
    prisma.user.count({
      where: {
        role: "USER",
      },
    }),

    // Total products
    prisma.product.count(),

    // Total orders
    prisma.order.count(),

    // Total reviews
    prisma.review.count(),

    // Average rating
    prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    }),

    // Total delivered revenue
    prisma.order.aggregate({
      where: {
        status: "DELIVERED",
      },
      _sum: {
        total: true,
      },
    }),

    // Pending orders
    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),

    // Low-stock products:
    // Sum stock across ACTIVE variants for each ACTIVE product.
    // Count products whose total active-variant stock is <= 10.
    prisma.productVariant.groupBy({
      by: ["productId"],
      where: {
        status: "ACTIVE",
        product: {
          is: {
            status: "ACTIVE",
          },
        },
      },
      _sum: {
        stock: true,
      },
      having: {
        stock: {
          _sum: {
            lte: 10,
          },
        },
      },
    }),

    // Unanswered reviews
    prisma.review.count({
      where: {
        reply: null,
      },
    }),

    // Recent orders
    prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    // Recent reviews
    prisma.review.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        reply: {
          select: {
            id: true,
          },
        },
      },
    }),

    // Orders grouped by status
    prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    }),

    // Delivered orders for the sales chart
    prisma.order.findMany({
      where: {
        status: "DELIVERED",
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  // Build a map containing every date in the selected range.
  const salesMap = new Map<
    string,
    {
      date: string;
      revenue: number;
      orders: number;
    }
  >();

  for (let i = 0; i < range; i++) {
    const date = new Date(startDate);

    date.setDate(startDate.getDate() + i);

    const dateKey = date.toISOString().slice(0, 10);

    salesMap.set(dateKey, {
      date: dateKey,
      revenue: 0,
      orders: 0,
    });
  }

  // Aggregate revenue and order counts by date.
  for (const order of salesOrders) {
    const dateKey = order.createdAt
      .toISOString()
      .slice(0, 10);

    const existing = salesMap.get(dateKey);

    if (!existing) {
      continue;
    }

    existing.revenue += Number(order.total);
    existing.orders += 1;
  }

  return {
    summary: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Number(
        totalRevenueResult._sum.total ?? 0
      ),
      totalReviews,
      averageRating: Number(
        (averageRating._avg.rating ?? 0).toFixed(1)
      ),
      pendingOrders,

      // groupBy returns one group per productId.
      // Use the number of groups, not the array itself.
      lowStockProducts: lowStockProductGroups.length,

      unansweredReviews,
    },

    salesOverview: Array.from(salesMap.values()),

    ordersByStatus: ordersByStatus.map((item) => ({
      status: item.status,
      count: item._count.id,
    })),

    recentOrders: recentOrders.map((order) => ({
      ...order,
      total: Number(order.total),
    })),

    recentReviews,
  };
};