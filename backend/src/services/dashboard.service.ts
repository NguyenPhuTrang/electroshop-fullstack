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
    lowStockProducts,
    unansweredReviews,
    recentOrders,
    recentReviews,
    ordersByStatus,
    salesOrders,
  ] = await Promise.all([
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

    prisma.order.aggregate({
      where: {
        status: "DELIVERED",
      },
      _sum: {
        total: true,
      },
    }),

    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),
  
    prisma.product.count({
        where: {
            status: "ACTIVE",
            variants: {
                some: {
                    status: "ACTIVE",
                    stock: {
                        lte: 10,
                    },
                },
            },
        },
    }),

    prisma.review.count({
      where: {
        reply: null,
      },
    }),

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

    prisma.order.groupBy({ // groupBy gom các record có cùng một giá trị thành từng nhóm
      by: ["status"],
      _count: {
        id: true,
      },
    }),

    // Orders for sales chart
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
      lowStockProducts,
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