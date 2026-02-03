import React, { useState, useEffect } from "react";
import ShopLayout from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getShop, updateShop } from "@/services/shopService";
import { getShopZones, createDeliveryZone, deleteDeliveryZone } from "@/services/deliveryZoneService";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Save, Trash2, MapPin, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

export default function ShopSettings() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const shopId = user?.franchise_id;

    // Fetch Shop Data
    const { data: shop, isLoading: isShopLoading } = useQuery({
        queryKey: ['my_shop', shopId],
        queryFn: () => getShop(shopId!),
        enabled: !!shopId
    });

    // Fetch Delivery Zones
    const { data: zones, isLoading: isZonesLoading } = useQuery({
        queryKey: ['my_shop_zones'],
        queryFn: getShopZones,
        enabled: !!shopId
    });

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        base_delivery_fee: 40,
        is_active: true
    });

    const [newPincode, setNewPincode] = useState("");

    useEffect(() => {
        if (shop) {
            setFormData({
                name: shop.name,
                address: shop.address,
                base_delivery_fee: shop.base_delivery_fee,
                is_active: shop.is_active
            });
        }
    }, [shop]);

    // Update Shop Mutation
    const updateMutation = useMutation({
        mutationFn: (data: any) => updateShop(shopId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my_shop'] });
            toast({ title: "Success", description: "Settings updated successfully" });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to update settings",
                variant: "destructive"
            });
        }
    });

    // Add Zone Mutation
    const addZoneMutation = useMutation({
        mutationFn: async (pincode: string) => {
            return createDeliveryZone({
                name: `${shop?.name} - ${pincode}`,
                pincode: pincode,
                fast_delivery: true, // Defaulting to fast delivery requests
                active: true
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my_shop_zones'] });
            toast({ title: "Success", description: "Delivery zone added" });
            setNewPincode("");
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to add zone",
                variant: "destructive"
            });
        }
    });

    // Delete Zone Mutation
    const deleteZoneMutation = useMutation({
        mutationFn: deleteDeliveryZone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my_shop_zones'] });
            toast({ title: "Success", description: "Zone removed" });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to remove zone",
                variant: "destructive"
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    const handleAddPincode = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPincode.length !== 6 || isNaN(Number(newPincode))) {
            toast({ title: "Invalid Pincode", description: "Please enter a valid 6-digit pincode", variant: "destructive" });
            return;
        }
        addZoneMutation.mutate(newPincode);
    };

    if (!shopId) return <ShopLayout><div className="p-10 text-center">No shop linked.</div></ShopLayout>;

    if (isShopLoading) {
        return (
            <ShopLayout>
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </ShopLayout>
        );
    }

    return (
        <ShopLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
                    <p className="text-muted-foreground">Manage your shop profile and delivery areas.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* General Settings */}
                    <div className="bg-card rounded-xl border border-border shadow-sm p-6 h-fit">
                        <div className="flex items-center gap-2 mb-6 text-primary">
                            <Save className="h-5 w-5" />
                            <h2 className="text-xl font-bold text-foreground">General</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b">
                                <div className="space-y-1">
                                    <Label className="text-base">Shop Status</Label>
                                    <p className="text-xs text-muted-foreground">Turn off to look temporarily closed.</p>
                                </div>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Shop Name</Label>
                                <Input disabled value={formData.name} className="bg-muted/50" />
                            </div>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Base Delivery Fee (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.base_delivery_fee}
                                    onChange={e => setFormData({ ...formData, base_delivery_fee: parseFloat(e.target.value) })}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                            </Button>
                        </form>
                    </div>

                    {/* Delivery Zones */}
                    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-6 text-primary">
                            <MapPin className="h-5 w-5" />
                            <h2 className="text-xl font-bold text-foreground">Delivery Zones</h2>
                        </div>

                        <div className="space-y-6">
                            <form onSubmit={handleAddPincode} className="flex gap-2">
                                <Input
                                    placeholder="Enter 6-digit Pincode"
                                    value={newPincode}
                                    onChange={e => setNewPincode(e.target.value)}
                                    maxLength={6}
                                />
                                <Button type="submit" disabled={addZoneMutation.isPending}>
                                    {addZoneMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                </Button>
                            </form>

                            <div className="space-y-3">
                                <Label>Active Delivery Areas</Label>
                                {isZonesLoading ? (
                                    <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                                ) : zones && zones.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {zones.map((zone: any) => (
                                            <div key={zone.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 group">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-lg tracking-wider">{zone.pincode}</span>
                                                    <span className="text-[10px] text-muted-foreground">{zone.fast_delivery ? '⚡ Fast Delivery' : 'Standard'}</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => deleteZoneMutation.mutate(zone.id)}
                                                    disabled={deleteZoneMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No delivery zones added.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
