import React, { useState, useRef, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useHero } from "@/context/HeroContext";
import { toast } from "sonner";
import { Save, RefreshCcw, Upload, X, Loader2 } from "lucide-react";

export default function HeroSettings() {
    const { heroData, updateHeroData, isLoading } = useHero();
    const [formData, setFormData] = useState(heroData);
    const [isSaving, setIsSaving] = useState(false);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);

    const [imagePreview, setImagePreview] = useState<string>(heroData.imageUrl);
    const [bgPreview, setBgPreview] = useState<string>(heroData.backgroundImageUrl);

    useEffect(() => {
        setFormData(heroData);
        setImagePreview(heroData.imageUrl);
        setBgPreview(heroData.backgroundImageUrl);
    }, [heroData]);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'bg') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'image') {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
            } else {
                setBackgroundImageFile(file);
                setBgPreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                fd.append(key, value);
            });

            if (imageFile) fd.append('imageFile', imageFile);
            if (backgroundImageFile) fd.append('backgroundImageFile', backgroundImageFile);

            await updateHeroData(formData, fd);
            toast.success("Hero section updated successfully!");
        } catch (error) {
            toast.error("Failed to update hero section.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setFormData(heroData);
        setImagePreview(heroData.imageUrl);
        setBgPreview(heroData.backgroundImageUrl);
        setImageFile(null);
        setBackgroundImageFile(null);
        toast.info("Form reset to current values.");
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
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hero Section Settings</h1>
                        <p className="text-sm md:text-base text-muted-foreground">Manage the content of your homepage hero section.</p>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving} className="flex-1 sm:flex-none">
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none">
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-card p-6 rounded-2xl border border-border shadow-soft">
                        <h3 className="text-lg font-bold border-b pb-3">Edit Content</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Badge Text</label>
                                <Input
                                    name="badge"
                                    value={formData.badge}
                                    onChange={handleChange}
                                    placeholder="e.g. 100% Fresh & Organic"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Main Title</label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Hero headline"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Subtitle / Description</label>
                                <Textarea
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleChange}
                                    placeholder="Detailed description..."
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Primary Button Text</label>
                                    <Input
                                        name="buttonText"
                                        value={formData.buttonText}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Secondary Button Text</label>
                                    <Input
                                        name="secondaryButtonText"
                                        value={formData.secondaryButtonText}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Hero Floating Image</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="h-16 w-16 rounded-lg border overflow-hidden bg-muted">
                                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, 'image')}
                                                className="hidden"
                                                ref={imageInputRef}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => imageInputRef.current?.click()}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload New Image
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Background Image</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="h-16 w-16 rounded-lg border overflow-hidden bg-muted">
                                            <img src={bgPreview} alt="Preview" className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, 'bg')}
                                                className="hidden"
                                                ref={bgInputRef}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => bgInputRef.current?.click()}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload New Background
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 bg-card p-6 rounded-2xl border border-border shadow-soft h-fit">
                        <h3 className="text-lg font-bold border-b pb-3">Live Preview Hint</h3>
                        <div className="p-4 rounded-xl bg-primary/5 text-sm text-muted-foreground space-y-4">
                            <p>Your changes will be visible on the homepage immediately after saving.</p>
                            <div
                                className="aspect-video bg-muted rounded-lg overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-border p-4 relative text-white"
                                style={{
                                    backgroundImage: bgPreview ? `linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url(${bgPreview})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {!bgPreview && "No Background Image"}
                                <div className="space-y-2 relative z-10 text-center">
                                    <h4 className="font-bold drop-shadow-md">{formData.title}</h4>
                                    <p className="line-clamp-2 text-xs opacity-90 drop-shadow-md">{formData.subtitle}</p>
                                    <div className="flex gap-2 justify-center">
                                        <div className="px-3 py-1 bg-primary text-primary-foreground text-[8px] rounded-full uppercase">{formData.buttonText}</div>
                                        <div className="px-3 py-1 border border-white/50 text-white text-[8px] rounded-full uppercase backdrop-blur-sm">{formData.secondaryButtonText}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
