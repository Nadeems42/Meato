import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Bike } from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function TrackOrder() {
    const [orderId, setOrderId] = useState("");
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleTrack = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!orderId) return;

        setLoading(true);
        try {
            const response = await api.get(`/orders/track/${orderId}`);
            setOrder(response.data.order);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Order not found. Please check your ID.",
                variant: "destructive"
            });
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-6 w-6 text-amber-500" />;
            case 'accepted':
            case 'processing': return <Package className="h-6 w-6 text-blue-500" />;
            case 'shipped':
            case 'out_for_delivery': return <Truck className="h-6 w-6 text-purple-500" />;
            case 'delivered': return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'cancelled': return <CheckCircle className="h-6 w-6 text-red-500" />;
            default: return <Clock className="h-6 w-6" />;
        }
    };

    const getStatusStep = (status: string) => {
        const steps = ['pending', 'processing', 'shipped', 'delivered'];
        const currentIdx = steps.indexOf(status === 'accepted' ? 'processing' : status === 'out_for_delivery' ? 'shipped' : status);
        return currentIdx === -1 ? 0 : currentIdx;
    };

    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <Header />
            <main className="flex-1 container py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black tracking-tight mb-4">Track Your Order</h1>
                        <p className="text-muted-foreground">Enter your Order ID to see real-time updates.</p>
                    </div>

                    <form onSubmit={handleTrack} className="flex gap-2 mb-12">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="e.g. 1024"
                                className="h-14 pl-12 rounded-2xl text-lg shadow-sm bg-white"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                        </div>
                        <Button type="submit" size="xl" className="rounded-2xl h-14 px-8 font-black" disabled={loading}>
                            {loading ? "Searching..." : "Track"}
                        </Button>
                    </form>

                    {order && (
                        <div className="bg-card rounded-3xl border border-border shadow-elevated overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Status Header */}
                            <div className="p-8 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-primary/10 flex items-center justify-center">
                                        {getStatusIcon(order.status)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-primary tracking-widest leading-none mb-1">Status</p>
                                        <h2 className="text-2xl font-black capitalize flex items-center gap-2">
                                            {order.status.replace('_', ' ')}
                                            {order.status === 'delivered' && <CheckCircle className="h-5 w-5 text-green-500" fill="currentColor" />}
                                        </h2>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Order ID</p>
                                    <p className="text-xl font-black">#{order.id}</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Visual Tracker */}
                                <div className="flex justify-between relative">
                                    <div className="absolute top-5 left-0 w-full h-1 bg-muted -z-10" />
                                    <div
                                        className="absolute top-5 left-0 h-1 bg-primary transition-all duration-1000 -z-10"
                                        style={{ width: `${(getStatusStep(order.status) / 3) * 100}%` }}
                                    />

                                    {['Placed', 'Processing', 'On Way', 'Delivered'].map((label, idx) => {
                                        const isCompleted = idx <= getStatusStep(order.status);
                                        return (
                                            <div key={label} className="flex flex-col items-center gap-2">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 ${isCompleted ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-muted text-muted'}`}>
                                                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-tighter ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Separator />

                                {/* Rider Info if assigned */}
                                {order.delivery_person && (
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                                    <Bike className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase">Your Delivery Partner</p>
                                                    <h3 className="font-black text-lg">{order.delivery_person.name}</h3>
                                                </div>
                                            </div>
                                            <Button variant="outline" className="rounded-xl border-primary text-primary font-bold h-10 px-4" asChild>
                                                <a href={`tel:${order.delivery_person.phone}`}>Call Rider</a>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Order Items Summary */}
                                <div>
                                    <h3 className="font-black mb-4 flex items-center gap-2 text-lg">
                                        <Package className="h-5 w-5 text-primary" /> Order Items
                                    </h3>
                                    <div className="space-y-4">
                                        {order.items?.map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-xl border border-border overflow-hidden bg-white shrink-0 p-1">
                                                    <img src={item.product?.image || '/placeholder.svg'} alt={item.product?.name} className="h-full w-full object-contain" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold">{item.product?.name}</p>
                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-sm font-medium">{order.delivery_type === 'express' ? 'Express Delivery' : 'Standard Delivery'}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Paid Amount</p>
                                        <p className="text-2xl font-black text-primary">₹{order.total}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!order && !loading && orderId && (
                        <div className="text-center py-12 px-6 bg-white rounded-3xl border-2 border-dashed border-muted">
                            <h3 className="text-xl font-bold text-muted-foreground mb-2">No Order Found</h3>
                            <p className="text-sm text-muted-foreground">Double check your ID. It should be a number like 1024.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
