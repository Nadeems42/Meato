import { useState, useEffect } from "react";
import { X, Trophy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";



export function PremiumBanner() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(false);


    useEffect(() => {
        // Show after a short delay - ALways show on every visit/refresh
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 2000);



        return () => clearTimeout(timer);
    }, [user]);

    const handleClose = () => {
        setIsVisible(false);
    };

    if (user?.is_premium) return null;
    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="relative bg-slate-900/90 backdrop-blur-xl text-white p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 max-w-[320px] group overflow-hidden">
                {/* Background Glows */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl group-hover:bg-amber-500/40 transition-all duration-700" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700" />

                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                        <Trophy className="h-6 w-6 text-white" />
                    </div>

                    <div className="space-y-1 pr-4">
                        <h4 className="font-black text-lg tracking-tight bg-gradient-to-r from-amber-200 to-white bg-clip-text text-transparent">Exclusive Member Prices</h4>
                        <p className="text-xs text-white/70 leading-relaxed font-semibold">
                            Get <span className="text-amber-400 font-black">Member-Only Discounts</span> & ₹0 Delivery fees. Join now to unlock hidden savings on every item!
                        </p>
                    </div>
                </div>

                <div className="mt-5">
                    <Button
                        onClick={() => {
                            navigate(user ? '/premium-registration' : '/register');
                            setIsVisible(false);
                        }}
                        className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 hover:from-amber-500 hover:to-orange-700 text-white font-black rounded-xl h-12 shadow-lg shadow-orange-600/30 group/btn border-none"
                    >
                        UNLOCK SAVINGS
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>

                </div>
            </div>
        </div>
    );
}
