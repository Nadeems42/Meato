import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Filter, Eye, MoreHorizontal, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { getAdminOrders, updateOrderStatus, assignOrder } from "@/services/orderService";
import { getDeliveryPersons, getShopDeliveryPersonnel } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AdminOrders() {
    const [searchQuery, setSearchQuery] = useState("");
    const [orders, setOrders] = useState<any[]>([]);
    const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isSuperAdmin } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        fetchOrders();
        fetchDeliveryPersons();
    }, []);

    const fetchDeliveryPersons = async () => {
        try {
            const data = (isSuperAdmin)
                ? await getDeliveryPersons()
                : await getShopDeliveryPersonnel();
            setDeliveryPersons(data.delivery_persons);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchOrders = async () => {
        try {
            const data = await getAdminOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await updateOrderStatus(id, status);
            toast({ title: "Success", description: "Order status updated" });
            fetchOrders();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const handleAssignDelivery = async (orderId: number, deliveryPersonId: string) => {
        try {
            await assignOrder(orderId, parseInt(deliveryPersonId));
            toast({ title: "Success", description: "Delivery person assigned" });
            fetchOrders();
        } catch (error) {
            toast({ title: "Error", description: "Failed to assign delivery person", variant: "destructive" });
        }
    };

    // Filter logic
    const filteredOrders = orders.filter(order =>
        String(order.id).includes(searchQuery) ||
        order.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-fresh/10 text-fresh';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'processing': return 'bg-primary/10 text-primary';
            case 'cancelled': return 'bg-destructive/10 text-destructive';
            case 'pending': return 'bg-orange-100 text-orange-600';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                        <p className="text-muted-foreground">Manage and track customer orders.</p>
                    </div>

                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Orders Table */}
                <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50">
                                <tr className="border-b border-border text-muted-foreground">
                                    <th className="py-4 px-6 font-medium">Order ID</th>
                                    <th className="py-4 px-6 font-medium">Customer</th>
                                    <th className="py-4 px-6 font-medium">Date</th>
                                    <th className="py-4 px-6 font-medium">Items</th>
                                    <th className="py-4 px-6 font-medium">Amount</th>
                                    <th className="py-4 px-6 font-medium">Delivery</th>
                                    <th className="py-4 px-6 font-medium">Status</th>
                                    <th className="py-4 px-6 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr><td colSpan={7} className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></td></tr>
                                ) : filteredOrders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-muted/30 transition-colors">
                                        <td className="py-4 px-6 font-semibold">#{order.id}</td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium">{order.user?.name || 'Guest'}</div>
                                            <div className="text-xs text-muted-foreground">{order.user?.email}</div>
                                        </td>
                                        <td className="py-4 px-6 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="py-4 px-6">{order.items.length} items</td>
                                        <td className="py-4 px-6 font-bold">₹{order.total}</td>
                                        <td className="py-4 px-6">
                                            <Select
                                                value={order.delivery_person_id?.toString()}
                                                onValueChange={(val) => handleAssignDelivery(order.id, val)}
                                            >
                                                <SelectTrigger className="w-[140px] h-8 text-xs">
                                                    <SelectValue placeholder="Assign..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {deliveryPersons.map((dp) => (
                                                        <SelectItem key={dp.id} value={dp.id.toString()}>
                                                            {dp.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'processing')}>
                                                        Mark Processing
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'completed')}>
                                                        <CheckCircle className="h-4 w-4 mr-2" /> Mark Completed
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleStatusUpdate(order.id, 'cancelled')}>
                                                        <XCircle className="h-4 w-4 mr-2" /> Cancel Order
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
