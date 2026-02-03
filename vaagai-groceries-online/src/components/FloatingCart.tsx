import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

export function FloatingCart() {
    const { totalItems, totalAmount, setIsCartOpen } = useCart();
    const location = useLocation();

    // Don't show on checkout page or if cart is empty
    if (totalItems === 0 || location.pathname === "/checkout") return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-8 md:right-8 md:left-auto md:w-80">
            <button
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-primary text-white p-4 rounded-2xl shadow-elevated flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase opacity-80 tracking-widest">{totalItems} Items</span>
                        <span className="font-black text-lg leading-tight">₹{totalAmount}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 font-black text-sm uppercase text-white">
                    View Cart
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
            </button>
        </div>
    );
}
