import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    Menu,
    LogOut,
    Bell,
    Store,
    Bike
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface ShopLayoutProps {
    children: React.ReactNode;
}

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/shop/dashboard" },
    { icon: Package, label: "My Inventory", href: "/shop/inventory" },
    { icon: ShoppingCart, label: "Orders", href: "/shop/orders" },
    { icon: Bike, label: "Riders", href: "/shop/riders" },
    { icon: Settings, label: "Store Settings", href: "/shop/settings" },
];

export default function ShopLayout({ children }: ShopLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

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
                    "bg-card border-r border-border transition-all duration-300 flex flex-col z-50",
                    "fixed lg:relative inset-y-0 left-0",
                    isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-64 lg:translate-x-0"
                )}
            >
                <div className="p-4 lg:p-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 border border-orange-200">
                        <Store className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight block">Shop Manager</span>
                        <span className="text-xs text-muted-foreground block truncate max-w-[140px]">{user?.name}</span>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                                location.pathname === item.href
                                    ? "bg-primary text-primary-foreground shadow-primary"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            logout();
                            window.location.href = '/';
                        }}
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="h-5 w-5 mr-3 shrink-0" />
                        <span>Logout</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-14 lg:h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
