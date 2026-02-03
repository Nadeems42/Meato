import React, { useEffect, useState } from "react";
import ShopLayout from "@/components/shop/ShopLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, Wallet, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function ShopDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/admin/dashboard");
                setStats(response.data.stats);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load dashboard stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <ShopLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </ShopLayout>
        );
    }

    return (
        <ShopLayout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Shop Dashboard</h1>
                <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                    <p className="text-xs font-bold text-primary uppercase">Today's Focus</p>
                    <p className="text-sm font-medium">Manage your shop's efficiency</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-soft overflow-hidden group">
                    <div className="h-1 bg-green-500 w-full" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Revenue</CardTitle>
                        <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats?.revenue?.value || "₹0.00"}</div>
                        <p className="text-xs text-muted-foreground mt-1">Life-time shop earnings</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-soft overflow-hidden group">
                    <div className="h-1 bg-blue-500 w-full" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Orders</CardTitle>
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <ShoppingBag className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats?.orders?.value || "0"}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total orders processed</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-soft overflow-hidden group">
                    <div className="h-1 bg-amber-500 w-full" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">COD Collected</CardTitle>
                        <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <Wallet className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats?.cod_total?.value || "₹0.00"}</div>
                        <p className="text-xs text-muted-foreground mt-1">Cash on Hand</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-soft overflow-hidden group">
                    <div className="h-1 bg-purple-500 w-full" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Inventory</CardTitle>
                        <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <Package className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats?.products?.value || "0"}</div>
                        <p className="text-xs text-muted-foreground mt-1">Master catalog items</p>
                    </CardContent>
                </Card>
            </div>

            <LowStockSection items={stats?.lowStockItems} />

            <div className="mt-8 p-6 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2">
                    <h3 className="text-xl font-bold">Manage your Shop Efficiency</h3>
                    <p className="text-slate-400 text-sm max-w-md">Update your inventory regularly and ensure fast rider assignment for better customer ratings.</p>
                </div>
                <div className="flex gap-4 shrink-0">
                    <button className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors">View Orders</button>
                    <a href="/shop/products" className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold border border-slate-700 hover:bg-slate-700 transition-colors">Check Stock</a>
                </div>
            </div>
        </ShopLayout>
    );
}

// Add Low Stock Section component
const LowStockSection = ({ items }: { items?: any[] }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="mt-8 bg-red-50 border border-red-100 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-red-700 flex items-center gap-2 mb-4">
                <span className="bg-red-200 p-1 rounded-md">⚠️</span> Low Stock Alerts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-red-100 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gray-100 rounded-lg overflow-hidden">
                                {item.image ? (
                                    <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                                ) : (
                                    <div className="h-full w-full bg-gray-200" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-900">{item.name}</p>
                                <p className="text-xs text-red-600 font-bold">Only {item.stock} left</p>
                            </div>
                        </div>
                        <a href="/shop/products" className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-700">Restock</a>
                    </div>
                ))}
            </div>
        </div>
    );
};
