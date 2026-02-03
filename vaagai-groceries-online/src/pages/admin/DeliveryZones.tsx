import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Pencil, Trash2, Zap, Package } from "lucide-react";
import {
    getAdminDeliveryZones,
    createDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone,
    approveDeliveryZone,
    DeliveryZone
} from "@/services/deliveryZoneService";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function DeliveryZones() {
    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
    const { isSuperAdmin } = useAuth();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        pincode: "",
        radius_km: 5,
        fast_delivery: false,
        active: true
    });

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const data = await getAdminDeliveryZones();
            setZones(data);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to fetch delivery zones",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingZone) {
                await updateDeliveryZone(editingZone.id!, formData);
                toast({ title: "Success", description: "Delivery zone updated successfully" });
            } else {
                await createDeliveryZone(formData);
                toast({ title: "Success", description: "Delivery zone created successfully" });
            }
            resetForm();
            fetchZones();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to save delivery zone",
                variant: "destructive"
            });
        }
    };

    const handleEdit = (zone: DeliveryZone) => {
        setEditingZone(zone);
        setFormData({
            name: zone.name,
            pincode: zone.pincode,
            radius_km: zone.radius_km || 5,
            fast_delivery: zone.fast_delivery,
            active: zone.active !== undefined ? zone.active : true
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this delivery zone?")) return;

        try {
            await deleteDeliveryZone(id);
            toast({ title: "Success", description: "Delivery zone deleted successfully" });
            fetchZones();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to delete delivery zone",
                variant: "destructive"
            });
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await approveDeliveryZone(id);
            toast({ title: "Success", description: "Delivery zone approved!" });
            fetchZones();
        } catch (error: any) {
            toast({ title: "Error", description: "Approval failed", variant: "destructive" });
        }
    };

    const resetForm = () => {
        setFormData({ name: "", pincode: "", radius_km: 5, fast_delivery: false, active: true });
        setEditingZone(null);
        setShowForm(false);
    };

    const toggleFastDelivery = async (zone: DeliveryZone) => {
        try {
            await updateDeliveryZone(zone.id!, { fast_delivery: !zone.fast_delivery });
            toast({
                title: "Success",
                description: `Fast delivery ${!zone.fast_delivery ? 'enabled' : 'disabled'} for ${zone.name}`
            });
            fetchZones();
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to update delivery zone",
                variant: "destructive"
            });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Delivery Zones</h1>
                        <p className="text-muted-foreground mt-1 font-medium">
                            Manage delivery service areas and express shipping options.
                        </p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-primary shadow-lg shadow-primary/20 h-11 px-6 rounded-xl font-bold">
                        <Plus className="h-5 w-5" />
                        <span>{showForm ? "Close Form" : "Add New Zone"}</span>
                    </Button>
                </div>

                {showForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{editingZone ? "Edit" : "Add"} Delivery Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Zone Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Sivagiri Area"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pincode">Pincode</Label>
                                        <Input
                                            id="pincode"
                                            value={formData.pincode}
                                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                            placeholder="e.g., 638109"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="radius">Radius (km)</Label>
                                    <Input
                                        id="radius"
                                        type="number"
                                        value={formData.radius_km}
                                        onChange={(e) => setFormData({ ...formData, radius_km: Number(e.target.value) })}
                                        min="1"
                                        max="50"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="fast_delivery" className="text-base">
                                            ⚡ Fast Delivery (10-min)
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Enable 10-minute delivery for this zone
                                        </p>
                                    </div>
                                    <Switch
                                        id="fast_delivery"
                                        checked={formData.fast_delivery}
                                        onCheckedChange={(checked) => setFormData({ ...formData, fast_delivery: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="active" className="text-base">Active</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Zone is currently active for deliveries
                                        </p>
                                    </div>
                                    <Switch
                                        id="active"
                                        checked={formData.active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" className="flex-1">
                                        {editingZone ? "Update" : "Create"} Zone
                                    </Button>
                                    <Button type="button" variant="outline" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>All Delivery Zones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-center py-8 text-muted-foreground">Loading zones...</p>
                        ) : zones.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground">
                                No delivery zones configured yet. Add one to get started!
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {zones.map((zone) => (
                                    <div
                                        key={zone.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`p-2 rounded-lg ${zone.fast_delivery ? 'bg-primary/10' : 'bg-muted'}`}>
                                                {zone.fast_delivery ? (
                                                    <Zap className="h-5 w-5 text-primary" />
                                                ) : (
                                                    <Package className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{zone.name}</h3>
                                                    {zone.fast_delivery && (
                                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                                            Fast Delivery
                                                        </span>
                                                    )}
                                                    {!zone.active && (
                                                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                                            Inactive
                                                        </span>
                                                    )}
                                                    {zone.is_approved ? (
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none h-5 px-2">
                                                            <Check className="h-3 w-3 mr-1" /> Approved
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 h-5 px-2">
                                                            Pending Approval
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        Pincode: {zone.pincode}
                                                    </span>
                                                    <span>Radius: {zone.radius_km} km</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleFastDelivery(zone)}
                                                title={zone.fast_delivery ? "Disable fast delivery" : "Enable fast delivery"}
                                            >
                                                {zone.fast_delivery ? (
                                                    <Zap className="h-4 w-4 text-primary" />
                                                ) : (
                                                    <Package className="h-4 w-4" />
                                                )}
                                            </Button>
                                            {isSuperAdmin && !zone.is_approved && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-green-600 border-green-200 hover:bg-green-50 gap-1"
                                                    onClick={() => handleApprove(zone.id!)}
                                                >
                                                    <Check className="h-4 w-4" /> Approve
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(zone)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(zone.id!)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
