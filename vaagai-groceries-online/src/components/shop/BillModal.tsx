import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

interface BillModalProps {
    order: any;
    isOpen: boolean;
    onClose: () => void;
}

export const BillModal: React.FC<BillModalProps> = ({ order, isOpen, onClose }) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Bill - Order #${order.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; }
                        .bill-header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
                        .store-name { font-size: 28px; font-weight: bold; color: #f97316; margin: 0; }
                        .store-sub { font-size: 14px; color: #666; }
                        .bill-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        .bill-info h4 { margin: 0 0 5px 0; color: #333; }
                        .bill-info p { margin: 0; font-size: 14px; color: #666; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { text-align: left; background: #f9fafb; padding: 12px; border-bottom: 2px solid #eee; }
                        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
                        .totals { display: flex; flex-direction: column; align-items: flex-end; }
                        .total-row { display: flex; justify-content: space-between; width: 250px; margin-bottom: 8px; }
                        .grand-total { font-size: 20px; font-weight: bold; color: #333; border-top: 2px solid #eee; padding-top: 8px; margin-top: 8px; }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <script>
                        window.onload = () => {
                            window.print();
                            window.onafterprint = () => window.close();
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (!order) return null;

    const address = order.delivery_address || {};

    // itemsSubtotal = total - fees - gst
    const deliveryFeeVal = parseFloat(order.delivery_fee || 0);
    const handlingFeeVal = parseFloat(order.handling_fee || 0);
    const gstVal = parseFloat(order.gst_amount || 0);
    const itemsSubtotal = parseFloat(order.total) - deliveryFeeVal - handlingFeeVal - gstVal;
    const grandTotal = parseFloat(order.total);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="no-print">
                    <div className="flex items-center justify-between mt-2">
                        <DialogTitle>Order Bill Preview</DialogTitle>
                        <Button onClick={handlePrint} className="gap-2">
                            <Printer className="h-4 w-4" />
                            Print Bill
                        </Button>
                    </div>
                </DialogHeader>

                <div ref={printRef} className="bg-white p-8 border rounded-lg">
                    <div className="bill-header">
                        {/* <h1 className="store-name">Meato</h1> */}
                        <div className="flex justify-center mb-2">
                            <img src="/logo.jpg" alt="Meato" style={{ height: '60px', objectFit: 'contain' }} />
                        </div>
                        <p className="store-sub">Fresh Quality Meat & Eggs Delivered</p>
                    </div>

                    <div className="bill-info grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h4 className="text-sm font-bold uppercase text-muted-foreground mb-2">Order Information</h4>
                            <p className="font-bold">Order ID: #{order.id}</p>
                            <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
                            <p>Status: <span className="uppercase">{order.status}</span></p>
                        </div>
                        <div className="text-right">
                            <h4 className="text-sm font-bold uppercase text-muted-foreground mb-2">Customer Details</h4>
                            <p className="font-bold">{order.user?.name || "Guest"}</p>
                            <p>{order.user?.email}</p>
                            <p>{address.phone || 'No phone'}</p>
                            <p className="text-xs mt-1 text-muted-foreground">
                                {address.address}, {address.landmark ? address.landmark + ', ' : ''}
                                {address.city}, {address.pincode}
                            </p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th className="text-right">Price</th>
                                <th className="text-center">Qty</th>
                                <th className="text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item: any) => (
                                <tr key={item.id}>
                                    <td>
                                        <p className="font-medium">{item.product?.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.variant?.variant_name || 'Standard'}</p>
                                    </td>
                                    <td className="text-right">₹{parseFloat(item.price).toFixed(2)}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-right font-medium">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex flex-col items-end">
                        <div className="w-full max-w-[300px] space-y-2 border-t pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Item Subtotal</span>
                                <span>₹{itemsSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">GST</span>
                                <span>₹{gstVal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Delivery Fee</span>
                                <span>₹{deliveryFeeVal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Handling Fee</span>
                                <span>₹{handlingFeeVal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold border-t pt-4 mt-2">
                                <span>Total Amount</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
                        <p>Thank you for shopping with Meato!</p>
                        <p>This is a computer generated invoice and does not require a signature.</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
