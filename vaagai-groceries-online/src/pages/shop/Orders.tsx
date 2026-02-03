import React, { useState, useEffect } from "react";
import ShopLayout from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Search, Filter, Bike, CheckCircle, XCircle, ShoppingBag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import { BillModal } from "@/components/shop/BillModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Reuse admin endpoint as it detects role
const getMyOrders = async () => {
    const response = await api.get('/admin/orders');
    return response.data;
};

const getDeliveryPersonnel = async () => {
    const response = await api.get('/admin/shop-delivery-persons');
    return response.data.delivery_persons;
};

export default function ShopOrders() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isBillOpen, setIsBillOpen] = useState(false);
    const [riderAssigning, setRiderAssigning] = useState<number | null>(null);
    const [selectedRider, setSelectedRider] = useState<string>("");

    const { data: orders, isLoading } = useQuery({
        queryKey: ['shop_orders'],
        queryFn: getMyOrders
    });

    const { data: riders } = useQuery({
        queryKey: ['shop_riders'],
        queryFn: getDeliveryPersonnel
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
            const response = await api.put(`/admin/orders/${orderId}`, { status });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop_orders'] });
            toast({ title: "Success", description: "Order status updated." });
        }
    });

    const assignRiderMutation = useMutation({
        mutationFn: async ({ orderId, riderId }: { orderId: number, riderId: string }) => {
            const response = await api.put(`/admin/orders/${orderId}/assign`, { delivery_person_id: riderId });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop_orders'] });
            toast({ title: "Success", description: "Rider assigned successfully." });
            setRiderAssigning(null);
            setSelectedRider("");
        }
    });

    const filteredOrders = orders?.filter((order: any) =>
        order.id.toString().includes(searchTerm) ||
        order.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ShopLayout>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Shop Orders</h1>
                    <p className="text-muted-foreground">Manage incoming orders and rider assignments.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Order ID or Customer Name..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders?.map((order: any) => (
                        <div key={order.id} className="bg-card p-6 rounded-2xl border border-border shadow-soft hover:shadow-md transition-all">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-black text-xl">Order #{order.id}</h3>
                                        <Badge className={`uppercase font-bold ${order.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                                            order.status === 'processing' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                                order.status === 'delivered' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                    'bg-slate-100 text-slate-700'
                                            }`}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    {order.status === 'pending' && (
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'processing' })}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" /> Accept Order
                                        </Button>
                                    )}
                                    {order.status === 'pending' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                            onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'cancelled' })}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" /> Reject
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 rounded-lg"
                                        onClick={() => { setSelectedOrder(order); setIsBillOpen(true); }}
                                    >
                                        View Bill / Details
                                    </Button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-dashed">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Customer</p>
                                    <p className="font-bold">{order.user?.name || "Guest"}</p>
                                    <p className="text-sm text-muted-foreground">{order.delivery_address?.phone || "No Phone"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Payment</p>
                                    <p className="font-black text-lg">₹{order.total}</p>
                                    <p className="text-xs text-fresh font-bold uppercase tracking-wider">Cash on Delivery</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Rider Assignment</p>
                                    {order.delivery_person_id ? (
                                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                            <Bike className="h-4 w-4 text-primary" />
                                            <div>
                                                <p className="text-sm font-bold">{order.delivery_person?.name || "Assigned"}</p>
                                                <p className="text-[10px] uppercase text-fresh font-bold">On the way</p>
                                            </div>
                                        </div>
                                    ) : (
                                        riderAssigning === order.id ? (
                                            <div className="flex items-center gap-2">
                                                <Select value={selectedRider} onValueChange={setSelectedRider}>
                                                    <SelectTrigger className="h-9 w-[150px]">
                                                        <SelectValue placeholder="Select Rider" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {riders?.map((rider: any) => (
                                                            <SelectItem key={rider.id} value={rider.id.toString()}>
                                                                {rider.name} {rider.is_available ? '✅' : '❌'}
                                                            </SelectItem>
                                                        ))}
                                                        {(!riders || riders.length === 0) && (
                                                            <SelectItem value="none" disabled>No riders found</SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    size="sm"
                                                    onClick={() => assignRiderMutation.mutate({ orderId: order.id, riderId: selectedRider })}
                                                    disabled={!selectedRider || assignRiderMutation.isPending}
                                                >
                                                    Ok
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => setRiderAssigning(null)}>
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5"
                                                onClick={() => setRiderAssigning(order.id)}
                                                disabled={order.status === 'cancelled' || order.status === 'delivered'}
                                            >
                                                <Bike className="h-4 w-4 mr-2" /> Assign Rider
                                            </Button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredOrders?.length === 0 && (
                        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-muted-foreground">No orders yet</h3>
                            <p className="text-sm text-muted-foreground">Incoming orders will appear here.</p>
                        </div>
                    )}
                </div>
            )}

            <BillModal
                order={selectedOrder}
                isOpen={isBillOpen}
                onClose={() => { setIsBillOpen(false); setSelectedOrder(null); }}
            />
        </ShopLayout>
    );
}
