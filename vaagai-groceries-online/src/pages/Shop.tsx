import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Search, Loader2 } from "lucide-react";
import { getProducts, getCategories, Category } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SubcategoryNav } from "@/components/SubcategoryNav";
import { CategoryBanner } from "@/components/CategoryBanner";

import { useLocation } from "@/context/LocationContext";

const Shop = () => {
    const { shopId } = useLocation();
    const [searchParams] = useSearchParams();
    const catParam = searchParams.get("category");
    const [selectedCategory, setSelectedCategory] = useState(catParam || "all");
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [prodData, catData] = await Promise.all([
                    getProducts(shopId),
                    getCategories()
                ]);

                // Transform API products to Frontend Product shape
                const mappedProducts = prodData.map((p: any) => ({
                    id: String(p.id),
                    name: p.name,
                    category: p.category?.name || 'Uncategorized',
                    categoryId: String(p.category_id),
                    price: Number(p.price),
                    mrp: Number(p.mrp) || (Number(p.price) * 1.2),
                    originalPrice: Number(p.mrp) || (Number(p.price) * 1.2),
                    unit: '1 kg',
                    image: p.image || '/products/chicken_whole.png',
                    description: p.description || '',
                    inStock: p.stock > 0,
                    rating: 4.5,
                    reviews: 24
                }));

                setProducts(mappedProducts);
                setCategories(catData);
            } catch (error) {
                console.error("Failed to fetch shop data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        fetchData();
    }, [shopId]);

    useEffect(() => {
        if (catParam) {
            setSelectedCategory(catParam);
        }
    }, [catParam]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            return selectedCategory === "all" || product.categoryId === selectedCategory;
        });
    }, [products, selectedCategory]);

    const activeCategory = useMemo(() => {
        return categories.find(c => String(c.id) === selectedCategory);
    }, [categories, selectedCategory]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-bold text-gray-500 animate-pulse">Loading Fresh Products...</p>
                </div>
            </div>
        );
    }

    const breadcrumbItems = [
        { label: "Home", path: "/" },
        { label: activeCategory?.name || "All Products" }
    ];

    const subNavItems = [
        { id: "all", name: "All", image: "/products/hero_banner.png" },
        ...categories.map(c => ({
            id: String(c.id),
            name: c.name,
            image: c.image || undefined
        }))
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full bg-white shadow-sm overflow-x-hidden">
                <Breadcrumbs items={breadcrumbItems} />

                {/* Category Header */}
                <div className="px-4 py-2">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        {activeCategory?.name || "All Products"}
                    </h1>
                </div>

                {/* Subcategory Navigation */}
                <SubcategoryNav
                    items={subNavItems}
                    selectedId={selectedCategory}
                    onSelect={setSelectedCategory}
                />

                {/* Promotional Banner */}
                <CategoryBanner
                    image="/products/hero_banner.png"
                    title={activeCategory?.name}
                />

                {/* Product Grid */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {filteredProducts.length} Items Found
                        </span>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-gray-50 rounded-3xl mx-4">
                            <Search className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">No products found in this category.</p>
                            <button
                                onClick={() => setSelectedCategory("all")}
                                className="mt-4 text-primary font-black text-sm underline underline-offset-4"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* SEO Section (Mimicking Zepto Footer Content) */}
                <section className="mt-12 p-8 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-4xl space-y-8 text-gray-600">
                        <div>
                            <h2 className="text-lg font-black text-gray-900 mb-4">
                                Buy <span className="text-primary">{activeCategory?.name || "Groceries"}</span> Online - Fast & Instant Delivery!
                            </h2>
                            <p className="text-sm leading-relaxed">
                                Why step out when you can buy <b>{activeCategory?.name || "Groceries"}</b> online and get it delivered straight to your doorstep? At Meato, we bring you the widest selection of groceries, sourced with strict quality checks to ensure authenticity, reliability, and quality.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-gray-800 mb-3">Why Shop with Meato?</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <li className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    <span><b>Unmatched Quality:</b> Best brands and fresh produce.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    <span><b>Widest Variety:</b> Everything from daily essentials to special picks.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    <span><b>Lightning-Fast Delivery:</b> No more waiting—get it in minutes!</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    <span><b>Top Brands:</b> Local favorites and global standards.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default Shop;
