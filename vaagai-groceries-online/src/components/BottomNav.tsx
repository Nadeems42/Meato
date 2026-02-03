import { Home, Grid, ShoppingBasket, User, Star } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export function BottomNav() {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: "Home", href: "/" },
        { icon: Grid, label: "Categories", href: "/categories" },
        { icon: ShoppingBasket, label: "My Orders", href: "/orders" },
        { icon: User, label: "Profile", href: "/profile" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border px-4 py-2 flex items-center justify-between md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            {navItems.map((item, idx) => {
                const isActive = location.pathname === item.href;

                return (
                    <Link
                        key={idx}
                        to={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 min-w-[50px] transition-colors",
                            isActive ? "text-primary fill-primary" : "text-muted-foreground"
                        )}
                    >
                        <div className="relative flex flex-col items-center">
                            <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
