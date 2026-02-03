import AdminLayout from "@/components/admin/AdminLayout";
import {
    TrendingUp,
    Users,
    Package,
    ShoppingBag,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboardService";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from "recharts";

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#8884d8', '#A281E8', '#FF6B6B'];

export default function AdminDashboard() {
    const { data: dashboardData, isLoading, isError } = useQuery({
        queryKey: ['adminDashboard'],
        queryFn: DashboardService.getStats,
        refetchInterval: 60000 // Refresh every minute
    });

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="h-[80vh] flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    if (isError || !dashboardData) {
        return (
            <AdminLayout>
                <div className="h-[80vh] flex flex-col items-center justify-center text-center">
                    <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Dashboard</h2>
                    <p className="text-muted-foreground">Could not fetch analytics data. Please try again later.</p>
                </div>
            </AdminLayout>
        );
    }

    const { stats, recentOrders, topCategories, charts } = dashboardData;

    const statsList = [
        { label: "Total Revenue", ...stats.revenue, icon: TrendingUp },
        { label: "Total Orders", ...stats.orders, icon: ShoppingBag },
        { label: "Customers", ...stats.customers, icon: Users },
        { label: "Total Products", ...stats.products, icon: Package },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6 lg:space-y-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-sm lg:text-base text-muted-foreground">Welcome back, here's what's happening today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
                    {statsList.map((stat) => (
                        <div key={stat.label} className="bg-card p-4 lg:p-6 rounded-2xl border border-border shadow-soft">
                            <div className="flex justify-between items-start mb-3 lg:mb-4">
                                <div className="p-2.5 lg:p-3 rounded-xl bg-primary/10 text-primary">
                                    <stat.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold ${stat.positive ? 'text-fresh' : 'text-destructive'}`}>
                                    {stat.change}
                                    {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                </div>
                            </div>
                            <p className="text-xs lg:text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <h3 className="text-xl lg:text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Trend Chart */}
                    <div className="bg-card rounded-2xl border border-border shadow-soft p-6">
                        <h3 className="text-lg font-bold mb-6">Revenue Trend (30 Days)</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={charts.revenueTrend}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`₹${value}`, 'Revenue']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10B981"
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Order Status Chart */}
                    <div className="bg-card rounded-2xl border border-border shadow-soft p-6">
                        <h3 className="text-lg font-bold mb-6">Order Status Distribution</h3>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts.orderStatus}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {charts.orderStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Second Row: Shop Sales */}
                {dashboardData.shopSales && dashboardData.shopSales.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border shadow-soft p-6">
                        <h3 className="text-lg font-bold mb-6">Shop-wise Performance</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboardData.shopSales.map(s => ({ name: s.shop?.name || 'Unknown', revenue: parseFloat(s.revenue) }))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                                    <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                                    <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Recent Orders & Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-soft p-6">
                        <h3 className="text-lg font-bold mb-6">Recent Orders</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border text-muted-foreground">
                                        <th className="pb-3 font-medium">Order ID</th>
                                        <th className="pb-3 font-medium">Customer</th>
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Amount</th>
                                        <th className="pb-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentOrders.length > 0 ? (
                                        recentOrders.map((order) => (
                                            <tr key={order.id} className="group hover:bg-muted/30 transition-colors">
                                                <td className="py-4 font-semibold">#{order.id}</td>
                                                <td className="py-4">{order.customer}</td>
                                                <td className="py-4 text-muted-foreground">{order.date}</td>
                                                <td className="py-4 font-bold">{order.amount}</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'Completed' ? 'bg-fresh/10 text-fresh' :
                                                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'Processing' ? 'bg-primary/10 text-primary' :
                                                                order.status === 'Cancelled' ? 'bg-destructive/10 text-destructive' :
                                                                    'bg-muted text-muted-foreground'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                                No recent orders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-card rounded-2xl border border-border shadow-soft p-6">
                        <h3 className="text-lg font-bold mb-6">Top Categories</h3>
                        {topCategories.length > 0 ? (
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topCategories} layout="vertical" margin={{ left: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="percentage" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} name="Sales %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground">
                                No sales data yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
