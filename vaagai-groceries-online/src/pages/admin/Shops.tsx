import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getShops, createShop, deleteShop, updateShop, Shop } from "@/services/shopService";
import { getAdmins, User } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Store, MapPin, Trash2, Edit, Plus, User as UserIcon } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Shops() {
    const { isSuperAdmin, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingShop, setEditingShop] = useState<Shop | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        lat: 20.5312,
        lng: 76.1856,
        delivery_radius_km: 5,
        commission_percentage: 10,
        base_delivery_fee: 40,
        owner_id: "0" // "0" means no owner selected
    });

    const { data: shops, isLoading: isListLoading } = useQuery({
        queryKey: ['shops'],
        queryFn: getShops,
        enabled: isSuperAdmin
    });

    // Fetch potential owners (Admins)
    const { data: adminList } = useQuery({
        queryKey: ['admins'],
        queryFn: getAdmins,
        enabled: isSuperAdmin && isDialogOpen
    });

    const createMutation = useMutation({
        mutationFn: createShop,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shops'] });
            toast({ title: "Success", description: "Shop created successfully" });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to create shop",
                variant: "destructive"
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => updateShop(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shops'] });
            toast({ title: "Success", description: "Shop updated successfully" });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to update shop",
                variant: "destructive"
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteShop,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shops'] });
            toast({ title: "Success", description: "Shop deleted successfully" });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to delete shop",
                variant: "destructive"
            });
        }
    });

    if (authLoading) return null;
    if (!isSuperAdmin) return <Navigate to="/admin" replace />;

    const resetForm = () => {
        setFormData({
            name: "",
            address: "",
            lat: 20.5312,
            lng: 76.1856,
            delivery_radius_km: 5,
            commission_percentage: 10,
            base_delivery_fee: 40,
            owner_id: "0"
        });
        setEditingShop(null);
    };

    const handleEdit = (shop: Shop) => {
        setEditingShop(shop);
        setFormData({
            name: shop.name,
            address: shop.address,
            lat: shop.lat,
            lng: shop.lng,
            delivery_radius_km: shop.delivery_radius_km,
            commission_percentage: shop.commission_percentage,
            base_delivery_fee: shop.base_delivery_fee,
            owner_id: shop.owner_id ? shop.owner_id.toString() : "0"
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            owner_id: formData.owner_id === "0" ? null : parseInt(formData.owner_id)
        };

        if (editingShop) {
            updateMutation.mutate({ id: editingShop.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Franchise Management</h1>
                        <p className="text-muted-foreground">Manage shops, assign administrators, and view performance.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => window.location.href = '/admin/users'}>
                            <UserIcon className="mr-2 h-4 w-4" /> Manage Shop Admins
                        </Button>
                        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" /> Add New Franchise
                        </Button>
                    </div>
                </div>

                {/* List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isListLoading ? (
                        <div className="col-span-full flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : shops?.map((shop) => (
                        <div key={shop.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 flex-1 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                            <Store className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg leading-none">{shop.name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${shop.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {shop.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span>{shop.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="h-4 w-4 shrink-0" />
                                        <span>Owner: <span className="text-foreground font-medium">{shop.owner?.name || "Unassigned"}</span></span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3 mt-2">
                                    <div>
                                        <span className="text-muted-foreground block">Radius</span>
                                        <span className="font-semibold">{shop.delivery_radius_km} km</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Delivery Fee</span>
                                        <span className="font-semibold">₹{shop.base_delivery_fee}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Commission</span>
                                        <span className="font-semibold">{shop.commission_percentage}%</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Coords</span>
                                        <span className="font-semibold">{shop.lat}, {shop.lng}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 border-t border-border flex gap-2">
                                <Button variant="outline" className="flex-1" size="sm" onClick={() => handleEdit(shop)}>
                                    <Edit className="mr-2 h-3 w-3" /> Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 text-destructive hover:bg-destructive/10"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm("Delete this shop?")) deleteMutation.mutate(shop.id);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-3 w-3" /> Delete
                                </Button>
                            </div>
                        </div>
                    ))}

                    {!isListLoading && shops?.length === 0 && (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                            No shops found. Create one to get started.
                        </div>
                    )}
                </div>

                {/* Create/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingShop ? "Edit Franchise" : "Add New Franchise"}</DialogTitle>
                            <DialogDescription>
                                Set up a new location for your business.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label>Shop Name</Label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Meato Central Branch"
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label>Full Address</Label>
                                    <Input
                                        required
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Street, City, Pincode"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Latitude</Label>
                                    <Input
                                        type="number" step="any" required
                                        value={formData.lat}
                                        onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Longitude</Label>
                                    <Input
                                        type="number" step="any" required
                                        value={formData.lng}
                                        onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Delivery Radius (km)</Label>
                                    <Input
                                        type="number" step="0.1" required
                                        value={formData.delivery_radius_km}
                                        onChange={e => setFormData({ ...formData, delivery_radius_km: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Base Delivery Fee (₹)</Label>
                                    <Input
                                        type="number" required
                                        value={formData.base_delivery_fee}
                                        onChange={e => setFormData({ ...formData, base_delivery_fee: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Commission (%)</Label>
                                    <Input
                                        type="number" step="0.1" required
                                        value={formData.commission_percentage}
                                        onChange={e => setFormData({ ...formData, commission_percentage: parseFloat(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Assign Owner (Admin)</Label>
                                    <Select
                                        value={formData.owner_id}
                                        onValueChange={val => setFormData({ ...formData, owner_id: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an admin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Unassigned</SelectItem>
                                            {adminList?.admins?.map((admin: User) => (
                                                <SelectItem key={admin.id} value={admin.id.toString()}>
                                                    {admin.name} ({admin.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingShop ? "Update Shop" : "Create Shop"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
