import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Save, RefreshCcw, Loader2, Settings as SettingsIcon } from "lucide-react";
import { settingService } from "@/services/settingService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GeneralSettings() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const data = await settingService.getSettings();
            setSettings(data);
        } catch (error) {
            toast.error("Failed to fetch settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await settingService.updateGeneralSettings(settings);
            toast.success("Settings updated successfully!");
        } catch (error) {
            toast.error("Failed to update settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">General Settings</h1>
                        <p className="text-sm md:text-base text-muted-foreground">Manage global application configurations.</p>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <Button variant="outline" size="sm" onClick={fetchSettings} disabled={isSaving} className="flex-1 sm:flex-none">
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-primary shadow-lg shadow-primary/20 flex-1 sm:flex-none">
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save All
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    <div className="grid gap-6">
                        <Card className="rounded-2xl border-none shadow-soft overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <SettingsIcon className="h-5 w-5 text-primary" />
                                    Shop Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black uppercase tracking-wider text-slate-500">Shop Name</label>
                                        <Input
                                            name="shop_name"
                                            value={settings.shop_name || "Meato"}
                                            onChange={handleChange}
                                            placeholder="e.g. Meato Meat Shop"
                                            className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black uppercase tracking-wider text-slate-500">Support Email</label>
                                        <Input
                                            name="support_email"
                                            type="email"
                                            value={settings.support_email || "samishathifoods@gmail.com"}
                                            onChange={handleChange}
                                            placeholder="support@meato.com"
                                            className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black uppercase tracking-wider text-slate-500">Contact Phone</label>
                                        <Input
                                            name="contact_phone"
                                            value={settings.contact_phone || "8605082096"}
                                            onChange={handleChange}
                                            placeholder="+91 00000 00000"
                                            className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black uppercase tracking-wider text-slate-500">Currency Symbol</label>
                                        <Input
                                            name="currency_symbol"
                                            value={settings.currency_symbol || "₹"}
                                            onChange={handleChange}
                                            placeholder="₹"
                                            className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Placeholder for more settings */}
                        <Card className="rounded-2xl border-none shadow-soft overflow-hidden opacity-60 grayscale">
                            <CardHeader className="bg-slate-50/50 border-b">
                                <CardTitle className="text-lg">Notification Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground">Additional settings like SMTP, SMS gateway, etc. can be added here.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
