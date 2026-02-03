import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { Loader2, Package, CheckCircle, Phone, MapPin, AlertCircle, ShoppingBag, History, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { DeliveryLayout } from "@/components/delivery/DeliveryLayout";
import { OrderCard } from "@/components/delivery/OrderCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

const DeliveryDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAvailable, setIsAvailable] = useState(user?.is_available ?? true);
    const [toggling, setToggling] = useState(false);
    const [activeTab, setActiveTab] = useState("new");

    // Reject Reason Modal
    const [rejectModal, setRejectModal] = useState<{ show: boolean, orderId: number | null }>({
        show: false, orderId: null
    });
    const [rejectReason, setRejectReason] = useState("");

    const fetchOrders = async () => {
        try {
            const response = await api.get("/delivery/orders");
            setOrders(response.data.orders);
        } catch (error) {
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleToggleAvailability = async () => {
        setToggling(true);
        try {
            const response = await api.put("/delivery/availability");
            setIsAvailable(response.data.is_available);
            toast.success(response.data.message);
        } catch (error) {
            toast.error("Failed to update availability");
        } finally {
            setToggling(false);
        }
    };

    const handleAccept = async (orderId: number) => {
        try {
            await api.put(`/delivery/orders/${orderId}/accept`);
            toast.success("Order accepted!");
            setActiveTab("progress");
            fetchOrders();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to accept order");
        }
    };

    const handleReject = async () => {
        if (!rejectModal.orderId) return;
        if (!rejectReason) {
            toast.error("Please select a reason");
            return;
        }
        try {
            await api.put(`/delivery/orders/${rejectModal.orderId}/reject`, { reason: rejectReason });
            toast.success("Order rejected");
            setRejectModal({ show: false, orderId: null });
            setRejectReason("");
            fetchOrders();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to reject order");
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === "new") return order.status === "assigned";
        if (activeTab === "progress") return ["processing", "accepted", "out_for_delivery"].includes(order.status);
        if (activeTab === "completed") return order.status === "delivered";
        return false;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const renderTabContent = () => {
        if (activeTab === "profile") {
            return (
                <div className="p-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <UserIcon className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-xl font-black text-gray-800">{user?.name}</h2>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{user?.shop?.name || "Independent Rider"}</p>

                        <div className="w-full mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`h-3 w-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="font-bold text-gray-700">{isAvailable ? 'Working Online' : 'Currently Offline'}</span>
                            </div>
                            <Switch
                                checked={isAvailable}
                                onCheckedChange={handleToggleAvailability}
                                disabled={toggling}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Deliveries</p>
                            <p className="text-2xl font-black text-gray-800">{orders.filter(o => o.status === 'delivered').length}</p>
                        </div>
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">COD Collected</p>
                            <p className="text-2xl font-black text-primary">₹{orders.filter(o => o.status === 'delivered' && o.cash_collected).reduce((acc, curr) => acc + parseFloat(curr.total), 0)}</p>
                        </div>
                    </div>

                    <Button variant="ghost" className="w-full h-14 rounded-2xl font-black text-red-500 bg-red-50 hover:bg-red-100" onClick={logout}>
                        LOGOUT
                    </Button>
                </div>
            );
        }

        return (
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-black text-gray-800">
                        {activeTab === "new" ? "New Assignments" :
                            activeTab === "progress" ? "Active Deliveries" : "Past Deliveries"}
                    </h2>
                    <Badge variant="secondary" className="rounded-full bg-primary/5 text-primary text-xs font-black">
                        {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
                    </Badge>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                            {activeTab === "new" ? <AlertCircle className="h-8 w-8 text-gray-300" /> :
                                activeTab === "progress" ? <ShoppingBag className="h-8 w-8 text-gray-300" /> :
                                    <History className="h-8 w-8 text-gray-300" />}
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-gray-400 uppercase text-xs tracking-widest">No Orders Found</p>
                            <p className="text-sm font-bold text-gray-300">Check back later for updates</p>
                        </div>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            type={activeTab as any}
                            onAccept={handleAccept}
                            onReject={(id) => setRejectModal({ show: true, orderId: id })}
                            onViewDetail={(id) => navigate(`/delivery/order/${id}`)}
                        />
                    ))
                )}
            </div>
        );
    };

    return (
        <>
            <DeliveryLayout activeTab={activeTab} onTabChange={setActiveTab}>
                {renderTabContent()}
            </DeliveryLayout>

            {/* Reject Reason Modal */}
            <Dialog open={rejectModal.show} onOpenChange={(val) => !val && setRejectModal({ show: false, orderId: null })}>
                <DialogContent className="rounded-3xl max-w-[90%] mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-center font-black pt-2">Reason for Rejecting?</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-3 py-4">
                        {["Busy", "Too far", "Vehicle issue", "Personal Emergency"].map((reason) => (
                            <Button
                                key={reason}
                                variant={rejectReason === reason ? "default" : "outline"}
                                className={cn(
                                    "h-14 rounded-2xl font-black transition-all",
                                    rejectReason === reason ? "bg-primary shadow-lg shadow-primary/20" : "text-gray-500"
                                )}
                                onClick={() => setRejectReason(reason)}
                            >
                                {reason}
                            </Button>
                        ))}
                    </div>
                    <DialogFooter className="pt-2">
                        <Button
                            className="w-full h-14 rounded-2xl font-black bg-primary shadow-lg shadow-primary/20"
                            disabled={!rejectReason}
                            onClick={handleReject}
                        >
                            CONFIRM REJECTION
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default DeliveryDashboard;
