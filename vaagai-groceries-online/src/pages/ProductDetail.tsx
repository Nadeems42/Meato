import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import {
    Minus,
    Plus,
    ShoppingCart,
    ArrowLeft,
    Star,
    Truck,
    ShieldCheck,
    RotateCcw,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getProduct } from "@/services/productService";
import { Product } from "@/data/products";

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const p = await getProduct(id);
                const mappedProduct: Product = {
                    id: String(p.id),
                    name: p.name,
                    category: p.category?.name || 'Uncategorized',
                    categoryId: String(p.category_id),
                    price: Number(p.price),
                    mrp: Number(p.mrp) || (Number(p.price) * 1.2),
                    unit: '1 pack',
                    image: p.image || '/placeholder.svg',
                    description: p.description || '',
                    inStock: p.stock > 0,
                    rating: 4.8,
                    reviews: 120,
                    variants: p.variants?.map(v => ({
                        id: String(v.id),
                        name: v.variant_name,
                        price: Number(v.price),
                        stockQty: v.stock_qty,
                        originalPrice: Number(v.price) * 1.1
                    }))
                };

                setProduct(mappedProduct);
                if (mappedProduct.variants && mappedProduct.variants.length > 0) {
                    setSelectedVariantId(mappedProduct.variants[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const selectedVariant = product?.variants?.find(v => v.id === selectedVariantId) || null;
    const standardPrice = selectedVariant ? selectedVariant.price : (product?.price || 0);
    const mrp = selectedVariant ? selectedVariant.originalPrice : (product?.originalPrice || 0);
    const currentUnit = selectedVariant ? selectedVariant.name : (product?.unit || "");

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Product not found...</p>
                <Button onClick={() => navigate("/")}>Go Home</Button>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity, selectedVariant || undefined);
            setIsCartOpen(true);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-muted/20">
                <div className="container py-8">
                    <Button
                        variant="ghost"
                        className="mb-6 -ml-4 hover:bg-transparent text-muted-foreground hover:text-primary"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Shop
                    </Button>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-card rounded-3xl p-6 md:p-10 shadow-soft">
                        {/* Product Image */}
                        <div className="relative group overflow-hidden rounded-2xl bbg-card aspect-square flex items-center justify-center">
                            <img
                                src={imageError ? "/placeholder.svg" : product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={() => setImageError(true)}
                            />
                            {mrp > standardPrice && (
                                <Badge className="absolute top-4 left-4 text-sm px-3 py-1 bg-cta text-cta-foreground hover:bg-cta">
                                    Save ₹{Math.floor(mrp - standardPrice)}
                                </Badge>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col text-foreground">
                            <div className="mb-6">
                                <Badge variant="outline" className="text-primary border-primary/20 mb-3">
                                    {product.category}
                                </Badge>
                                <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1 text-cta">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span className="font-bold text-foreground">{product.rating}</span>
                                        <span className="text-muted-foreground">({product.reviews} reviews)</span>
                                    </div>
                                    <span>•</span>
                                    <span className="text-fresh font-medium">In Stock</span>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex flex-col gap-1 mb-2">
                                    {/* MRP */}
                                    <span className="text-muted-foreground line-through text-lg">
                                        MRP: ₹{mrp}
                                    </span>

                                    {/* Final Price */}
                                    <div className="flex items-end gap-2 mt-2">
                                        <div className="text-4xl font-bold text-primary">
                                            ₹{standardPrice}
                                        </div>
                                        <span className="text-lg text-muted-foreground mb-1">/ {currentUnit}</span>
                                    </div>
                                </div>
                                <p className="text-muted-foreground leading-relaxed mt-4">
                                    {product.description}
                                </p>
                            </div>

                            {/* Variant Selection */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="mb-8 text-foreground">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                        Pack Sizes
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {product.variants.map((v) => (
                                            <button
                                                key={v.id}
                                                onClick={() => setSelectedVariantId(v.id)}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl border-2 transition-all duration-200 font-bold text-sm",
                                                    selectedVariantId === v.id
                                                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                        : "border-border/50 hover:border-primary/30 text-muted-foreground"
                                                )}
                                            >
                                                {v.name} - ₹{v.price}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity & Add to Cart */}
                            <div className="mt-auto space-y-4 md:space-y-6">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-6">
                                    <div className="flex items-center border-2 border-border/50 rounded-xl overflow-hidden bg-muted/20 w-full sm:w-auto">
                                        <button
                                            className="p-3 md:p-3 hover:bg-muted transition-colors flex-1 sm:flex-initial"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        >
                                            <Minus className="h-4 w-4 mx-auto text-foreground" />
                                        </button>
                                        <span className="w-16 sm:w-12 text-center font-bold text-foreground">{quantity}</span>
                                        <button
                                            className="p-3 md:p-3 hover:bg-muted transition-colors flex-1 sm:flex-initial"
                                            onClick={() => setQuantity(quantity + 1)}
                                        >
                                            <Plus className="h-4 w-4 mx-auto text-foreground" />
                                        </button>
                                    </div>

                                    <Button
                                        variant="cta"
                                        size="xl"
                                        className="flex-1 rounded-2xl shadow-lg shadow-primary/20 font-black text-base md:text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 group h-12 md:h-auto"
                                        onClick={handleAddToCart}
                                    >
                                        <ShoppingCart className="mr-2 h-5 w-5 md:h-6 md:w-6 group-hover:animate-bounce-soft" />
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetail;
