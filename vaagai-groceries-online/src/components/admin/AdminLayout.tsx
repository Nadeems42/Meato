import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Menu,
    X,
    LogOut,
    Bell,
    Search,
    Truck,
    Store,
    List,
    Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const baseMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: List, label: "Categories", href: "/admin/categories" },
    { icon: Truck, label: "Delivery Zones", href: "/admin/delivery-zones" },
    { icon: LayoutDashboard, label: "Hero Content", href: "/admin/hero" },
    { icon: Settings, label: "General Settings", href: "/admin/settings" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: Users, label: "Customers", href: "/admin/customers" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { isSuperAdmin, user, logout } = useAuth();

    const menuItems = [...baseMenuItems];
    if (isSuperAdmin) {
        menuItems.push({ icon: Building2, label: "Franchise", href: "/admin/shops" }); // Using /admin/shops as the base for Franchise management
        menuItems.push({ icon: Users, label: "Shop Admins", href: "/admin/users" });
    }

    return (
        <div className="min-h-screen bg-muted/30 flex">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col z-50 group",
                    "fixed lg:relative inset-y-0 left-0",
                    isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-20 lg:translate-x-0 lg:hover:w-64"
                )}
            >
                <div className="p-4 lg:p-6 flex items-center gap-3 overflow-hidden">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-primary/10 p-1 transition-transform duration-300 group-hover:scale-105">
                        <img src="/logo.jpg" alt="Logo" className="h-full w-full object-contain" />
                    </div>
                    <span className={cn(
                        "font-bold text-lg lg:text-xl tracking-tight text-foreground whitespace-nowrap transition-all duration-300",
                        isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 hidden lg:block"
                    )}>
                        Meato Admin
                    </span>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group/item relative overflow-hidden",
                                location.pathname === item.href
                                    ? "bg-primary text-primary-foreground shadow-primary shadow-lg"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300 group-hover/item:scale-110", location.pathname === item.href && "animate-pulse-subtle")} />
                            <span className={cn(
                                "font-medium whitespace-nowrap transition-all duration-300",
                                isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 hidden lg:block"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border overflow-hidden">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            logout();
                            window.location.href = '/';
                        }}
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 group/logout"
                    >
                        <LogOut className="h-5 w-5 mr-3 shrink-0 transition-transform group-hover/logout:-translate-x-1" />
                        <span className={cn(
                            "whitespace-nowrap transition-all duration-300",
                            isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 hidden lg:block"
                        )}>
                            Logout
                        </span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-14 lg:h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="h-9 w-9 lg:h-10 lg:w-10"
                        >
                            <Menu className="h-4 w-4 lg:h-5 lg:w-5" />
                        </Button>
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-muted/50 rounded-lg border-none focus:ring-2 focus:ring-primary/20 w-40 lg:w-64 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        <Button variant="ghost" size="icon" className="relative h-9 w-9 lg:h-10 lg:w-10">
                            <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
                        </Button>
                        <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-border">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs lg:text-sm font-semibold">{user?.name || 'Admin User'}</p>
                                <p className="text-[10px] lg:text-xs text-muted-foreground">{isSuperAdmin ? 'Super Admin' : 'Admin'}</p>
                            </div>
                            <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Body */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
