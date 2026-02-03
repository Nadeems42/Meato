import api from '@/lib/axios';

export interface DashboardStats {
    revenue: {
        value: string;
        change: string;
        positive: boolean;
    };
    orders: {
        value: string;
        change: string;
        positive: boolean;
    };
    customers: {
        value: string;
        change: string;
        positive: boolean;
    };
    members: {
        value: string;
        change: string;
        positive: boolean;
    };
    products: {
        value: string;
        change: string;
        positive: boolean;
    };
}

export interface RecentOrder {
    id: number;
    customer: string;
    date: string;
    amount: string;
    status: string;
}

export interface ChartData {
    revenueTrend: Array<{ date: string; revenue: number }>;
    orderStatus: Array<{ name: string; value: number }>;
}

export interface TopCategory {
    name: string;
    percentage: number;
    color: string;
}

export interface DashboardData {
    stats: DashboardStats;
    recentOrders: RecentOrder[];
    topCategories: TopCategory[];
    shopSales?: Array<{ shop: { name: string }; revenue: string; orders: number }>;
    lowStockItems?: Array<{ id: number; name: string; stock: number; image?: string }>;
    charts: ChartData;
}

export const DashboardService = {
    getStats: async (): Promise<DashboardData> => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    }
};
