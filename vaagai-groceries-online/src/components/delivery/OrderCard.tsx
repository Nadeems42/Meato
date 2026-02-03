import React, { useState, useEffect } from "react";
import { Clock, MapPin, X, Check, ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderCardProps {
    order: any;
    type: "new" | "progress" | "completed";
    onAccept?: (id: number) => void;
    onReject?: (id: number) => void;
    onViewDetail?: (id: number) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, type, onAccept, onReject, onViewDetail }) => {
    const [timeLeft, setTimeLeft] = useState(60); // 1 minute countdown for new orders

    useEffect(() => {
        if (type === "new" && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [type, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Safe address parsing
    const address = typeof order.delivery_address === 'string'
        ? JSON.parse(order.delivery_address)
        : order.delivery_address;

    return (
        <Card className="mb-4 overflow-hidden border-none shadow-md rounded-2xl">
            <CardHeader className="bg-white pb-2 flex flex-row justify-between items-center">
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</span>
                    <CardTitle className="text-lg font-black tracking-tight">#{order.id}</CardTitle>
                </div>
                {type === "new" && timeLeft > 0 && (
                    <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full ring-1 ring-red-100 animate-pulse">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold tabular-nums">{formatTime(timeLeft)}</span>
                    </div>
                )}
                {type === "completed" && (
                    <Badge className="bg-green-50 text-green-700 border-green-100 hover:bg-green-50 shadow-none">
                        Completed
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none shadow-none font-bold">
                            {order.distance ? `${order.distance} km` : 'Near you'}
                        </Badge>
                        <Badge variant="outline" className="border-gray-200 text-gray-600 font-semibold shadow-none">
                            {order.payment_method === 'cod' || true ? 'COD' : 'PAID'}
                        </Badge>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-xs font-bold text-gray-400">Total</span>
                        <span className="text-xl font-black text-primary">₹{order.total}</span>
                    </div>
                </div>

                <div className="space-y-3 bg-gray-50/50 p-3 rounded-xl border border-dashed border-gray-200">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Customer Area</p>
                            <p className="text-xs font-bold text-gray-700 line-clamp-1">
                                {address?.area || address?.landmark || "Delivery Location"}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="bg-gray-50/30 p-4 border-t border-gray-100 gap-3">
                {type === "new" ? (
                    <>
                        <Button
                            variant="outline"
                            className="flex-1 border-gray-200 text-gray-500 font-bold h-12 rounded-xl"
                            onClick={() => onReject?.(order.id)}
                        >
                            <X className="h-4 w-4 mr-2" /> Reject
                        </Button>
                        <Button
                            className="flex-1 font-bold h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                            onClick={() => onAccept?.(order.id)}
                        >
                            <Check className="h-4 w-4 mr-2" /> Accept
                        </Button>
                    </>
                ) : (
                    <Button
                        className="w-full font-bold h-12 rounded-xl bg-white border-2 border-primary text-primary hover:bg-primary/5 transition-all flex justify-between px-5 group"
                        onClick={() => onViewDetail?.(order.id)}
                    >
                        <span>View Order Detail</span>
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};
