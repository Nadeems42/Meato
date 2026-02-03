import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createShopAdmin, getAdmins, deleteAdmin, createDeliveryPartner, getDeliveryPersons, getShopDeliveryPersonnel, User as UserType } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldCheck, Mail, Lock, User, Trash2, MailIcon, Phone, Truck } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminUsers() {
    const { isSuperAdmin, isAdmin, loading: authLoading, user: currentUser } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    // Form States
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [activeTab, setActiveTab] = useState(isSuperAdmin ? "admins" : "delivery");

    const { data: adminList, isLoading: isListLoading } = useQuery({
        queryKey: ['admins'],
        queryFn: getAdmins,
        enabled: isSuperAdmin
    });

    const { data: deliveryList, isLoading: isDeliveryLoading } = useQuery({
        queryKey: ['delivery_persons', currentUser?.role],
        queryFn: isSuperAdmin ? getDeliveryPersons : getShopDeliveryPersonnel,
        enabled: (isSuperAdmin || currentUser?.role === 'shop_admin')
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            toast({ title: "Success", description: "Admin deleted successfully" });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to delete admin",
                variant: "destructive"
            });
        }
    });

    if (authLoading) return null;

    if (!isSuperAdmin && currentUser?.role !== 'shop_admin') {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (activeTab === "admins") {
                await createShopAdmin({ name, email, password });
                toast({
                    title: "Shop Admin Created",
                    description: `Successfully added ${name} as a shop administrator.`,
                });
                queryClient.invalidateQueries({ queryKey: ['admins'] });
            } else {
                await createDeliveryPartner({ name, email, password, phone });
                toast({
                    title: "Delivery Partner Created",
                    description: `Successfully added ${name} as a delivery partner.`,
                });
                queryClient.invalidateQueries({ queryKey: ['delivery_persons'] });
            }
            // Reset form
            setName("");
            setEmail("");
            setPassword("");
            setPhone("");
        } catch (error: any) {
            const msg = error.response?.data?.error || "Failed to create user";
            toast({
                title: "Creation Failed",
                description: msg,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Shop Admins</h1>
                    <p className="text-muted-foreground">Create and manage shop administrator accounts.</p>
                </div>

                <Tabs defaultValue={isSuperAdmin ? "admins" : "delivery"} onValueChange={setActiveTab}>
                    <TabsList className="mb-8">
                        {isSuperAdmin && (
                            <TabsTrigger value="admins" className="gap-2">
                                <ShieldCheck className="h-4 w-4" /> Shop Admins
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="delivery" className="gap-2">
                            <Truck className="h-4 w-4" /> Delivery Partners
                        </TabsTrigger>
                    </TabsList>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Create Form */}
                        <div className="bg-card rounded-2xl border border-border shadow-soft p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    {activeTab === "admins" ? <ShieldCheck className="h-6 w-6" /> : <Truck className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Create New {activeTab === "admins" ? "Admin" : "Delivery Person"}</h2>
                                    <p className="text-sm text-muted-foreground">Add a new user to the system</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Name"
                                            className="pl-10"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="email"
                                            placeholder="user@meato.com"
                                            className="pl-10"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {activeTab === "delivery" && (
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Phone Number"
                                                className="pl-10"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        `Create ${activeTab === "admins" ? "Admin" : "Delivery Person"}`
                                    )}
                                </Button>
                            </form>
                        </div>

                        {/* User List */}
                        <div className="bg-card rounded-2xl border border-border shadow-soft p-8 h-full">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Existing {activeTab === "admins" ? "Admins" : "Delivery Personnel"}</h2>
                                    <p className="text-sm text-muted-foreground">Current system users.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {(activeTab === "admins" ? isListLoading : isDeliveryLoading) ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (activeTab === "admins" ? adminList?.admins : deliveryList?.delivery_persons) && (activeTab === "admins" ? adminList.admins.length > 0 : deliveryList.delivery_persons.length > 0) ? (
                                    (activeTab === "admins" ? adminList.admins : deliveryList.delivery_persons).map((u: UserType) => (
                                        <div key={u.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary uppercase text-xs">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{u.name} {u.id === currentUser?.id && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-md ml-1">You</span>}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <MailIcon className="h-3 w-3" /> {u.email}
                                                    </p>
                                                    {u.phone && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Phone className="h-3 w-3" /> {u.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {u.role !== 'super_admin' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to delete ${u.name}?`)) {
                                                            deleteMutation.mutate(u.id);
                                                        }
                                                    }}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">No users found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
