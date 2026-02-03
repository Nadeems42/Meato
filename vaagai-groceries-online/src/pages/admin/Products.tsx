import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, Product, Category, approveProduct } from "@/services/productService";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { isSuperAdmin } = useAuth();
    const { toast } = useToast();

    // Form states
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [price, setPrice] = useState("");
    const [mrp, setMrp] = useState("");
    const [stock, setStock] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [gstPercentage, setGstPercentage] = useState("0");
    const [variants, setVariants] = useState<{ name: string; price: string; stock: string }[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const addVariant = () => {
        setVariants([...variants, { name: "", price: "", stock: "" }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: string, value: string) => {
        const newVariants = [...variants];
        (newVariants[index] as any)[field] = value;
        setVariants(newVariants);
    };

    const fetchData = async () => {
        try {
            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getCategories()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setName(product.name);
        setCategoryId(product.category_id.toString());
        setPrice(product.price.toString());
        setMrp(product.mrp?.toString() || "");
        setStock(product.stock.toString());
        setDescription(product.description || "");
        setGstPercentage(product.gst_percentage?.toString() || "0");
        setVariants(product.variants?.map(v => ({
            name: v.variant_name,
            price: v.price.toString(),
            stock: v.stock_qty.toString()
        })) || []);
        setImage(null);
        setOpen(true);
    };

    const handleApprove = async (id: number) => {
        try {
            await approveProduct(id);
            toast({ title: "Success", description: "Product approved successfully" });
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to approve product", variant: "destructive" });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteProduct(id);
            toast({ title: "Success", description: "Product deleted successfully" });
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("category_id", categoryId);
        formData.append("price", price);
        formData.append("mrp", mrp);
        formData.append("stock", stock);
        formData.append("description", description);
        formData.append("gst_percentage", gstPercentage);
        if (variants.length > 0) {
            formData.append("variants", JSON.stringify(variants));
        }
        if (image) formData.append("image", image);

        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
                toast({ title: "Success", description: "Product updated successfully" });
            } else {
                await createProduct(formData);
                toast({ title: "Success", description: "Product created successfully" });
            }
            setOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to save product", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setName("");
        setCategoryId("");
        setPrice("");
        setMrp("");
        setStock("");
        setDescription("");
        setGstPercentage("0");
        setImage(null);
        setEditingProduct(null);
        setVariants([]);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                        <p className="text-muted-foreground">Manage your product inventory and pricing.</p>
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => resetForm()} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl h-11 px-6 shadow-purple">
                                <Plus className="h-5 w-5" />
                                Add New Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Product Name</Label>
                                        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={categoryId} onValueChange={setCategoryId} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="mrp">MRP (₹)</Label>
                                        <Input id="mrp" type="number" value={mrp} onChange={e => setMrp(e.target.value)} placeholder="Max Retail Price" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Standard Price (₹)</Label>
                                        <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} required placeholder="Discounted Price" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Total Stock</Label>
                                        <Input id="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gst">GST (%)</Label>
                                        <Input id="gst" type="number" value={gstPercentage} onChange={e => setGstPercentage(e.target.value)} placeholder="0" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-bold">Product Variants (Optional)</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add Variant
                                        </Button>
                                    </div>

                                    {variants.length > 0 && (
                                        <div className="space-y-3 p-4 border rounded-xl bg-muted/20">
                                            {variants.map((variant, index) => (
                                                <div key={index} className="grid grid-cols-12 gap-2 items-end border-b border-border/30 pb-3 last:border-0 last:pb-0">
                                                    <div className="col-span-5 space-y-1">
                                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Size/Weight</Label>
                                                        <Input placeholder="e.g. 500g" value={variant.name} onChange={e => updateVariant(index, 'name', e.target.value)} required />
                                                    </div>
                                                    <div className="col-span-3 space-y-1">
                                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Price</Label>
                                                        <Input type="number" placeholder="₹" value={variant.price} onChange={e => updateVariant(index, 'price', e.target.value)} required />
                                                    </div>
                                                    <div className="col-span-3 space-y-1">
                                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Stock</Label>
                                                        <Input type="number" placeholder="Qty" value={variant.stock} onChange={e => updateVariant(index, 'stock', e.target.value)} required />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)} className="text-destructive h-10 w-10">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Product Image</Label>
                                    <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                                        <Input type="file" accept="image/*" className="hidden" id="prod-image" onChange={e => setImage(e.target.files?.[0] || null)} />
                                        <label htmlFor="prod-image" className="cursor-pointer flex flex-col items-center w-full">
                                            {image ? (
                                                <span className="text-sm font-medium">{image.name}</span>
                                            ) : (
                                                <>
                                                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                                    <span className="text-sm text-muted-foreground">Click to upload image</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingProduct ? "Update Product" : "Create Product"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="bg-card p-4 rounded-2xl border border-border shadow-soft flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                                    <th className="px-6 py-4 font-semibold uppercase text-[10px]">Product</th>
                                    <th className="px-6 py-4 font-semibold uppercase text-[10px]">Category</th>
                                    <th className="px-6 py-4 font-semibold uppercase text-[10px]">Price</th>
                                    <th className="px-6 py-4 font-semibold uppercase text-[10px]">GST</th>
                                    <th className="px-6 py-4 font-semibold uppercase text-[10px]">Stock</th>
                                    <th className="px-6 py-4 font-semibold uppercase text-[10px]">Status</th>
                                    <th className="px-6 py-4 font-semibold uppercase text-[10px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-muted-foreground">No products found.</td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="group hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0 border border-border">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                                                <ImageIcon className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="font-bold text-foreground">{product.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                                                    {product.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold">
                                                {product.variants && product.variants.length > 0 ? (
                                                    <div className="flex flex-col">
                                                        <span>₹{Math.min(...product.variants.map(v => v.price))}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase">{product.variants.length} Variants</span>
                                                    </div>
                                                ) : (
                                                    `₹${product.price}`
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium">{product.gst_percentage || 0}%</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-1.5 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    <div className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? 'bg-green-600' : 'bg-red-600'}`} />
                                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.is_approved ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                                        <Check className="h-3 w-3 mr-1" /> Approved
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                                        Pending
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {isSuperAdmin && !product.is_approved && (
                                                            <DropdownMenuItem onClick={() => handleApprove(product.id)} className="text-green-600 font-bold">
                                                                <Check className="mr-2 h-4 w-4" /> Approve
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout >
    );
}
