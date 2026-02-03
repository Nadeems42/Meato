import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Package, Clock, MapPin, CheckCircle2, Loader2, AlertCircle, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getOrders } from "@/services/orderService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Printer } from "lucide-react";
import { ScrollToTop } from "@/components/ScrollToTop";

const Orders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                navigate("/login");
                return;
            }
            fetchOrders();
        }
    }, [isAuthenticated, authLoading, navigate]);

    const fetchOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to fetch orders", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (order: any) => {
        const printContent = `
            <html>
            <head>
                <title>Invoice #${order.id}</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .details { margin-top: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
                    .total { text-align: right; margin-top: 30px; font-size: 24px; font-weight: bold; }
                    .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>Meato</h1>
                        <p>Order ID: #ORD-${order.id.slice(0, 8)}</p>
                        <p>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
                        <p>Email: samishathifoods@gmail.com | Phone: 8605082096</p>
                        <p>Order ID: #${order.id}</p>
                        <p>Date: ${new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div style="text-align: right">
                        <p><strong>Status: ${order.status.toUpperCase()}</strong></p>
                    </div>
                </div>
                <div class="details">
                    <h3>Delivery To:</h3>
                    <p>${order.delivery_address?.name || 'Customer'}<br>
                    ${order.delivery_address?.address_line}<br>
                    ${order.delivery_address?.city} - ${order.delivery_address?.pincode}<br>
                    Phone: ${order.delivery_address?.phone}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map((item: any) => `
                            <tr>
                                <td>${item.product?.name || 'Product'}</td>
                                <td>${item.quantity}</td>
                                <td>₹${item.price}</td>
                                <td>₹${item.price * item.quantity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="total">
                    <div style="font-size: 14px; font-weight: normal; margin-bottom: 5px;">Subtotal: ₹${order.total}</div>
                    <div style="font-size: 14px; font-weight: normal; margin-bottom: 5px;">GST: ₹${order.gst_amount || 0}</div>
                    <div style="font-size: 14px; font-weight: normal; margin-bottom: 5px;">Delivery Fee: ₹${order.delivery_fee || 0}</div>
                    <div style="font-size: 14px; font-weight: normal; margin-bottom: 10px;">Handling Fee: ₹${order.handling_fee || 0}</div>
                    Grand Total: ₹${(parseFloat(order.total) + parseFloat(order.gst_amount || 0) + parseFloat(order.delivery_fee || 0) + parseFloat(order.handling_fee || 0)).toFixed(2)}
                </div>
                <div class="footer">
                    Thank you for shopping with Meato!
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
        }
    };

    if (loading || authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 container py-8 pb-24">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h1 className="text-3xl font-black tracking-tight">My Orders</h1>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-4 py-2 rounded-full border border-slate-200">
                                <Package className="h-4 w-4" />
                                <span>Total Orders: {orders.length}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/track-order")}
                                className="rounded-full gap-2 border-primary text-primary hover:bg-primary hover:text-white"
                            >
                                <Truck className="h-4 w-4" />
                                Track Order
                            </Button>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl shadow-soft">
                            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
                            <p className="text-muted-foreground mb-6">Start shopping to place your first order!</p>
                            <Button onClick={() => navigate("/shop")}>Go Shopping</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Card key={order.id} className="rounded-3xl border-none shadow-soft overflow-hidden group hover:shadow-card transition-all duration-300">
                                    <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center justify-between p-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-lg">Order #{order.id}</span>
                                                <Badge variant="secondary" className={`border-none px-3 font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {order.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {new Date(order.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="rounded-full gap-2 border-slate-200" onClick={() => handlePrint(order)}>
                                                <Printer className="h-4 w-4" />
                                                <span className="hidden sm:inline">Print Bill</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest">Items</h4>
                                                <div className="space-y-3">
                                                    {order.items.map((item: any, i: number) => (
                                                        <div key={i} className="flex justify-between items-center">
                                                            <span className="text-sm font-medium">
                                                                {item.product?.name || 'Product'} <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                                                            </span>
                                                            <span className="text-sm font-bold">₹{item.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4 border-l md:pl-8 border-slate-100">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-2">Delivery Address</h4>
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                            <span>
                                                                {order.delivery_address?.address_line || 'No Address'}, {order.delivery_address?.city} - {order.delivery_address?.pincode}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="pt-2 space-y-2">
                                                        <div className="flex justify-between text-sm px-3">
                                                            <span className="text-muted-foreground">GST</span>
                                                            <span className="font-medium">₹{order.gst_amount || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm px-3">
                                                            <span className="text-muted-foreground">Delivery & Handling</span>
                                                            <span className="font-medium">₹{(parseFloat(order.delivery_fee || 0) + parseFloat(order.handling_fee || 0)).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                                                            <span className="font-bold">Total Amount Paid</span>
                                                            <span className="text-xl font-black text-primary">₹{(parseFloat(order.total) + parseFloat(order.gst_amount || 0) + parseFloat(order.delivery_fee || 0) + parseFloat(order.handling_fee || 0)).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    <div className="bg-white rounded-3xl p-8 text-center space-y-4 shadow-soft">
                        <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
                        <div className="space-y-2">
                            <h3 className="text-xl font-black">All set!</h3>
                            <p className="text-muted-foreground">You've reached the end of your order history.</p>
                        </div>
                        <Button variant="link" asChild className="text-primary font-black">
                            <Link to="/shop">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default Orders;
