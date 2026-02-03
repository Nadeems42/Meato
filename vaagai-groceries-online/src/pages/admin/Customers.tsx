import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCustomers, User as UserType } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Users, Mail, Phone, CheckCircle2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function AdminCustomers() {
    const { isAdmin, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: getCustomers,
        enabled: isAdmin
    });



    if (authLoading) return null;
    if (!isAdmin) return <Navigate to="/admin" replace />;

    const customers = data?.customers || [];

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                        <p className="text-muted-foreground">Manage your store's customer base.</p>
                    </div>
                    <div className="flex gap-4 items-center bg-card px-4 py-2 rounded-2xl border border-border shadow-soft">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-slate-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {customers.length} Total Customers
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-3xl border border-border shadow-soft overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Customer</th>
                                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Contact</th>
                                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-right">Join Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                            <p className="text-xs font-bold mt-4 text-muted-foreground uppercase tracking-widest">Loading Customers...</p>
                                        </td>
                                    </tr>
                                ) : customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center text-muted-foreground">
                                            <Users className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                            <p className="font-bold">No customers found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((c: UserType) => (
                                        <tr key={c.id} className="group hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs uppercase bg-slate-100 text-slate-500 border border-slate-200">
                                                        {c.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm tracking-tight">{c.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium">
                                                            Customer since {c.createdAt || c.created_at ? new Date(c.createdAt || c.created_at!).toLocaleDateString() : 'Recent'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-xs flex items-center gap-1.5 text-muted-foreground font-medium">
                                                        <Mail className="h-3 w-3" /> {c.email}
                                                    </p>
                                                    {c.phone && (
                                                        <p className="text-xs flex items-center gap-1.5 text-muted-foreground font-medium">
                                                            <Phone className="h-3 w-3" /> {c.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {c.createdAt || c.created_at ? new Date(c.createdAt || c.created_at!).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
