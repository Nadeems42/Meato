import React, { useState } from "react";
import ShopLayout from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getShopInventory, updateInventoryItem, ShopProduct } from "@/services/shopService";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Package, Search, Power, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function ShopInventory() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    // Identify current shop from user profile
    const shopId = user?.franchise_id;

    const { data: inventory, isLoading } = useQuery({
        queryKey: ['shop_inventory', shopId],
        queryFn: () => getShopInventory(shopId!),
        enabled: !!shopId
    });

    const updateMutation = useMutation({
        mutationFn: ({ productId, data }: { productId: number, data: any }) => updateInventoryItem(shopId!, productId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop_inventory'] });
            toast({ title: "Success", description: "Product updated successfully" });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to update product",
                variant: "destructive"
            });
        }
    });

    const filteredInventory = inventory?.filter(item =>
        item.Product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggle = (item: ShopProduct) => {
        updateMutation.mutate({
            productId: item.product_id,
            data: { is_enabled: !item.is_enabled }
        });
    };

    if (!shopId) {
        return (
            <ShopLayout>
                <div className="flex justify-center p-10 text-muted-foreground">
                    You are not linked to any active shop. Please contact Super Admin.
                </div>
            </ShopLayout>
        );
    }

    return (
        <ShopLayout>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground">Enable products, manage stock, and override prices.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredInventory?.map(item => (
                        <InventoryItemRow key={item.id} item={item} onToggle={() => handleToggle(item)} onUpdate={(data) => updateMutation.mutate({ productId: item.product_id, data })} isUpdating={updateMutation.isPending} />
                    ))}
                    {filteredInventory?.length === 0 && (
                        <p className="text-center py-10 text-muted-foreground">No products found matching your search.</p>
                    )}
                </div>
            )}
        </ShopLayout>
    );
}

const InventoryItemRow = ({ item, onToggle, onUpdate, isUpdating }: { item: ShopProduct, onToggle: () => void, onUpdate: (data: any) => void, isUpdating: boolean }) => {
    const [stock, setStock] = useState(item.stock);
    const [price, setPrice] = useState(item.price_override || "");
    const [hasChanges, setHasChanges] = useState(false);

    const handleSave = () => {
        onUpdate({
            stock: parseInt(stock.toString()),
            price_override: price === "" ? null : parseFloat(price.toString())
        });
        setHasChanges(false);
    };

    return (
        <div className={`flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl border ${item.is_enabled ? "bg-card border-border" : "bg-muted/30 border-dashed border-gray-200 opacity-75"}`}>
            {/* Image & Name */}
            <div className="flex items-center gap-4 flex-1 w-full">
                <div className="h-16 w-16 rounded-lg bg-gray-100 p-1 flex items-center justify-center shrink-0">
                    <img src={item.Product?.image || '/placeholder.svg'} alt={item.Product?.name} className="h-full w-full object-contain" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.Product?.name}</h3>
                        {item.is_enabled && item.stock > 0 ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px]">In Stock</Badge>
                        ) : (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none text-[10px]">
                                {!item.is_enabled ? "Disabled" : "Out of Stock"}
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">Master Price: ₹{item.Product?.price}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="flex items-center gap-2">
                    <Switch checked={item.is_enabled} onCheckedChange={onToggle} />
                    <span className="text-sm font-medium">{item.is_enabled ? "Enabled" : "Disabled"}</span>
                </div>

                <div className="w-24">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Stock</label>
                    <Input
                        type="number"
                        value={stock}
                        onChange={e => { setStock(parseInt(e.target.value)); setHasChanges(true); }}
                        className="h-8"
                    />
                </div>

                <div className="w-28">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">My Price (₹)</label>
                    <Input
                        type="number"
                        placeholder={item.Product?.price?.toString()} // Placeholder shows master price
                        value={price}
                        onChange={e => { setPrice(e.target.value); setHasChanges(true); }}
                        className="h-8 border-orange-200 focus-visible:ring-orange-500"
                    />
                </div>

                <Button
                    size="sm"
                    disabled={!hasChanges || isUpdating}
                    onClick={handleSave}
                    className={hasChanges ? "animate-pulse" : ""}
                >
                    <Save className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
