import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface PremiumPopupProps {
    isOpen: boolean;
    onClose: () => void;
    savings?: number;
    premiumPrice?: number;
}

export function PremiumPopup({ isOpen, onClose, savings, premiumPrice }: PremiumPopupProps) {
    const navigate = useNavigate();
    const { user } = useAuth(); // To check if logged in (for button text)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-md border-none p-0 overflow-hidden bg-transparent shadow-2xl"
                overlayClassName="bg-black/60 backdrop-blur-sm"
            >
                <div className="relative bg-white rounded-3xl overflow-hidden">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')]"></div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl animate-pulse"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 animate-in zoom-in duration-500">
                                <Crown className="h-8 w-8 text-orange-500 fill-orange-500" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-white tracking-tight mb-2">
                                Unlock Premium Prices
                            </DialogTitle>
                            <DialogDescription className="text-orange-50 font-medium">
                                Join the exclusive club & start saving today!
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="space-y-4">
                            {premiumPrice && (
                                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                                    <span className="text-orange-800 font-bold">Premium Price</span>
                                    <span className="text-2xl font-black text-orange-600">₹{premiumPrice}</span>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                    <span>Extra discounts on every product</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                    <span>Free delivery on all orders</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                    <span>Priority support & early access</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={() => {
                                    onClose();
                                    navigate(user ? "/premium-registration" : "/register");
                                }}
                                className="w-full h-12 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-900/20"
                            >
                                <Sparkles className="mr-2 h-4 w-4 text-amber-400" />
                                {user ? "Upgrade Now" : "Register Now"}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="w-full h-10 text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-semibold"
                            >
                                Maybe Later
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
