import api from "@/src/lib/axios";

export type DashboardRange = 7 | 30 | 90;

export type DashboardSummary = {
    totalUsers: number,
    totalProducts: number,
    totalOrders: number,
    totalRevenue: number,
    totalReviews: number,
    averageRating: number,
    pendingOrders: number,
    lowStockProducts: number,
    unansweredReviews: number
};

export type SalesOverviewItem = {
    date: string,
    revenue: string,
    orders: number
};

export type OrdersByStatusItem = {
    status: string,
    count: number
};

export type RecentOrder = {
    id: number,
    orderNumber: string,
    total: number,
    status: string,
    createdAt: string;
    user: {
        id: number,
        name: string,
    }
};

export type RecentReview = {
    id: number,
    rating: number,
    comment: string | null,
    createdAt: string,
    user: {
        id:number,
        name: string,
    };
    product: {
        id: number,
        name: string
    };
    reply: {
        id: number;
    } | null;
};

export type AdminDashboardResponse = {
    summary: DashboardSummary;
    salesOverview: SalesOverviewItem[];
    ordersByStatus: OrdersByStatusItem[];
    recentOrders: RecentOrder[];
    recentReviews: RecentReview[];
};

export async function getAdminDashboard(
    range: DashboardRange = 7
): Promise<AdminDashboardResponse> {
    const response = await api.get("/admin/dashboard", {
        params: {
            range,
        },
    });

    return response.data.data;
};