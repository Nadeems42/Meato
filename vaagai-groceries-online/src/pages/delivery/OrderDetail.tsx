import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft, Phone, MapPin, Navigation,
    Package, IndianRupee, ChevronDown, ChevronUp,
    CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StepTracker } from "@/components/delivery/StepTracker";
import { toast } from "sonner";
import api from "@/lib/axios";

const OrderDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [itemsOpen, setItemsOpen] = useState(true);

    // Confirmation Modals
    const [confirmModal, setConfirmModal] = useState<{ show: boolean, type: string, title: string }>({
        show: false, type: '', title: ''
    });

    // Cash Collection States
    const [cashModal, setCashModal] = useState(false);
    const [amt1, setAmt1] = useState("");
    const [amt2, setAmt2] = useState("");

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/orders/${id}`); // User endpoint might work or add a specific delivery one
            setOrder(response.data);
        } catch (error) {
            toast.error("Failed to fetch order details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleAction = async (endpoint: string, body = {}) => {
        try {
            await api.put(`/delivery/orders/${id}/${endpoint}`, body);
            toast.success("Done!");
            setConfirmModal({ show: false, type: '', title: '' });
            fetchOrder();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Action failed");
        }
    };

    const handleCollectCash = async () => {
        if (amt1 !== amt2) {
            toast.error("Amounts do not match!");
            return;
        }
        if (parseFloat(amt1) !== parseFloat(order.total)) {
            toast.error(`Amount must be exactly ₹${order.total}`);
            return;
        }

        setConfirmModal({
            show: true,
            type: 'collect-cash',
            title: `Confirm you collected ₹${amt1}?`
        });
    };

    if (loading) return <div className="p-8 text-center font-bold animate-pulse text-gray-400">Loading Order Details...</div>;
    if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

    const address = typeof order.delivery_address === 'string'
        ? JSON.parse(order.delivery_address)
        : order.delivery_address;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <header className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10 border-b">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-lg font-black tracking-tight leading-none">Order #{order.id}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] uppercase font-black border-primary/20 text-primary bg-primary/5 px-2 py-0">
                            {order.payment_method === 'cod' || true ? 'COD' : 'PAID'}
                        </Badge>
                        <span className="text-sm font-black text-primary">₹{order.total}</span>
                    </div>
                </div>
            </header>

            {/* Step Tracker */}
            <div className="bg-white border-b mb-2">
                <StepTracker
                    currentStatus={order.status}
                    reachedConfirmed={order.reached_confirmed}
                    cashCollected={order.cash_collected}
                />
            </div>

            {/* Customer Section */}
            <Card className="mx-4 mt-2 border-none shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Customer</p>
                            <h2 className="text-xl font-black text-gray-800">{order.user?.name || "Customer"}</h2>
                            <p className="text-sm font-bold text-gray-500">{order.user?.phone}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="bg-green-500 text-white border-none rounded-2xl shadow-lg shadow-green-100 h-12 w-12"
                            onClick={() => window.location.href = `tel:${order.user?.phone}`}
                        >
                            <Phone className="h-6 w-6 fill-current" />
                        </Button>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <p className="text-sm font-bold text-gray-600 leading-snug">
                                {address?.address_line || ""}, {address?.area || ""}, {address?.city || ""}, {address?.pincode || ""}
                            </p>
                        </div>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 font-black h-12 rounded-xl mt-2 flex gap-2"
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${address?.lat},${address?.lng}`, '_blank')}
                        >
                            <Navigation className="h-5 w-5" /> Open in Google Maps
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Order Items Collapsible */}
            <Collapsible open={itemsOpen} onOpenChange={setItemsOpen} className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-gray-400" />
                            <span className="font-black text-gray-800">Order Items</span>
                            <Badge variant="secondary" className="rounded-full h-5 w-5 p-0 flex items-center justify-center bg-gray-100 text-[10px] font-black">
                                {order.items?.length || 0}
                            </Badge>
                        </div>
                        {itemsOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                        {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-t border-gray-50">
                                <div className="flex-1">
                                    <p className="text-sm font-black text-gray-800 line-clamp-1">{item.product?.name}</p>
                                    <p className="text-xs font-bold text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                                </div>
                                <span className="font-black text-gray-800">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <div className="pt-3 border-t-2 border-primary/10 flex justify-between items-center">
                            <span className="font-black text-gray-400 text-sm">Grand Total</span>
                            <span className="text-lg font-black text-primary">₹{order.total}</span>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Action Bar (Sticky Bottom) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                <div className="flex gap-4">
                    {(order.status === 'processing' || order.status === 'accepted' || order.status === 'assigned') && (
                        <div className="w-full space-y-3">
                            {(order.status === 'assigned') && (
                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black text-gray-500 border-gray-200" onClick={() => toast.info("Reject via Dashboard list")}>
                                        REJECT
                                    </Button>
                                    <Button className="flex-1 h-14 rounded-2xl font-black bg-primary shadow-lg shadow-primary/20" onClick={() => handleAction('accept')}>
                                        ACCEPT ORDER
                                    </Button>
                                </div>
                            )}
                            {(order.status === 'processing' || order.status === 'accepted') && (
                                <Button className="w-full h-14 rounded-2xl font-black bg-primary shadow-lg shadow-primary/20" onClick={() => setConfirmModal({ show: true, type: 'out-for-delivery', title: 'Are you leaving the shop now?' })}>
                                    MARK OUT FOR DELIVERY
                                </Button>
                            )}
                        </div>
                    )}

                    {order.status === 'out_for_delivery' && !order.reached_confirmed && (
                        <Button className="w-full h-14 rounded-2xl font-black bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-100" onClick={() => setConfirmModal({ show: true, type: 'reached', title: 'Have you reached the customer location?' })}>
                            MARK REACHED
                        </Button>
                    )}

                    {order.reached_confirmed && !order.cash_collected && (
                        <Button className="w-full h-14 rounded-2xl font-black bg-green-500 hover:bg-green-600 shadow-lg shadow-green-100" onClick={() => setCashModal(true)}>
                            COLLECT CASH (₹{order.total})
                        </Button>
                    )}

                    {order.cash_collected && order.status !== 'delivered' && (
                        <Button className="w-full h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100" onClick={() => setConfirmModal({ show: true, type: 'deliver', title: 'Confirm order delivered successfully?' })}>
                            MARK DELIVERED
                        </Button>
                    )}

                    {order.status === 'delivered' && (
                        <div className="w-full text-center py-4 bg-green-50 rounded-2xl text-green-700 font-bold flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-5 w-5" /> COMPLETED ✅
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Modal */}
            <Dialog open={confirmModal.show} onOpenChange={(val) => !val && setConfirmModal({ show: false, type: '', title: '' })}>
                <DialogContent className="rounded-3xl max-w-[90%] mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-center font-black pt-2">{confirmModal.title}</DialogTitle>
                    </DialogHeader>
                    <DialogFooter className="flex flex-row gap-3 pt-4">
                        <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={() => setConfirmModal({ show: false, type: '', title: '' })}>No</Button>
                        <Button className="flex-1 rounded-2xl h-12 bg-primary font-black" onClick={() => {
                            if (confirmModal.type === 'collect-cash') {
                                handleAction('collect-cash', { amount1: amt1, amount2: amt2 });
                                setCashModal(false);
                            } else {
                                handleAction(confirmModal.type);
                            }
                        }}>Yes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cash Modal */}
            <Dialog open={cashModal} onOpenChange={setCashModal}>
                <DialogContent className="rounded-3xl max-w-[90%] mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-center font-black">Collect Cash</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-primary/5 p-4 rounded-2xl text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase">Collection Amount</p>
                            <p className="text-3xl font-black text-primary">₹{order.total}</p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="number"
                                placeholder="Enter amount"
                                className="h-14 rounded-2xl font-bold text-center text-lg"
                                value={amt1}
                                onChange={(e) => setAmt1(e.target.value)}
                            />
                            <Input
                                type="number"
                                placeholder="Re-enter amount"
                                className="h-14 rounded-2xl font-bold text-center text-lg"
                                value={amt2}
                                onChange={(e) => setAmt2(e.target.value)}
                            />
                        </div>
                        {amt1 && amt2 && amt1 !== amt2 && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                                <AlertCircle className="h-4 w-4" /> Amounts do not match!
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full h-14 rounded-2xl font-black bg-primary shadow-lg shadow-primary/20"
                            disabled={!amt1 || !amt2 || amt1 !== amt2}
                            onClick={handleCollectCash}
                        >
                            CONFIRM CASH COLLECTED
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrderDetail;
