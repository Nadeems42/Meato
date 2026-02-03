import React, { useState } from "react";
import ShopLayout from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2, UserPlus, Phone, Search, Bike } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const getRiders = async () => {
    const response = await api.get('/admin/shop-delivery-persons');
    return response.data.delivery_persons;
};

export default function ShopRiders() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRider, setNewRider] = useState({ name: "", phone: "", email: "" });

    const { data: riders, isLoading } = useQuery({
        queryKey: ['shop_riders_page'],
        queryFn: getRiders
    });

    const createRiderMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/admin/create-delivery-partner', {
                ...data,
                franchise_id: currentUser?.franchise_id // Assign to current shop
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop_riders_page'] });
            toast({ title: "Success", description: "Rider added successfully." });
            setIsAddModalOpen(false);
            setNewRider({ name: "", phone: "", email: "" });
        },
        onError: (err: any) => {
            toast({
                title: "Error",
                description: err.response?.data?.error || "Failed to add rider",
                variant: "destructive"
            });
        }
    });

    const handleAddRider = (e: React.FormEvent) => {
        e.preventDefault();
        createRiderMutation.mutate(newRider);
    };

    return (
        <ShopLayout>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Delivery Partners</h1>
                    <p className="text-muted-foreground">Manage riders assigned to your shop.</p>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl shadow-lg ring-offset-background transition-all hover:scale-105 active:scale-95">
                            <UserPlus className="h-4 w-4 mr-2" /> Add New Rider
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Delivery Partner</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddRider} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter rider name"
                                    value={newRider.name}
                                    onChange={e => setNewRider({ ...newRider, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="+91"
                                    value={newRider.phone}
                                    onChange={e => setNewRider({ ...newRider, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (Optional)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="rider@meato.com"
                                    value={newRider.email}
                                    onChange={e => setNewRider({ ...newRider, email: e.target.value })}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">Riders can login using their phone number and OTP.</p>
                            <Button type="submit" className="w-full" disabled={createRiderMutation.isPending}>
                                {createRiderMutation.isPending ? <Loader2 className="animate-spin" /> : "Registry Rider"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {riders?.map((rider: any) => (
                        <div key={rider.id} className="bg-card p-6 rounded-2xl border border-border shadow-soft group hover:border-primary/40 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <Bike className="h-6 w-6" />
                                </div>
                                <Badge className={rider.is_available ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}>
                                    {rider.is_available ? "Online" : "Offline"}
                                </Badge>
                            </div>
                            <h3 className="font-bold text-lg mb-1">{rider.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Phone className="h-3 w-3" />
                                {rider.phone}
                            </div>
                            <div className="pt-4 border-t flex justify-between items-center">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Status</span>
                                <div className={`h-2 w-2 rounded-full ${rider.is_available ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`} />
                            </div>
                        </div>
                    ))}

                    {riders?.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                            <h3 className="text-xl font-bold text-muted-foreground">No riders added yet</h3>
                            <p className="text-sm text-muted-foreground">Add your delivery partners to start assigning orders.</p>
                        </div>
                    )}
                </div>
            )}
        </ShopLayout>
    );
}
