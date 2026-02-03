import { useState, useEffect } from "react";
import { Search, Heart, ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories, Category } from "@/services/productService";
import { cn } from "@/lib/utils";

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                console.log("Fetching categories...");
                const data = await getCategories();
                console.log("Categories data:", data);
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);


    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1">
                        <ChevronLeft className="h-6 w-6 text-gray-800" />
                    </button>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">All Categories</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Heart className="h-6 w-6 text-gray-800" />
                    <Search className="h-6 w-6 text-gray-800" />
                </div>
            </header>

            <main className="container max-w-7xl mx-auto py-6 px-4 space-y-8">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/shop?category=${category.id}`}
                                className="flex flex-col items-center gap-3 group"
                            >
                                <div className="w-full aspect-square rounded-3xl bg-white shadow-card border border-slate-100 overflow-hidden flex items-center justify-center p-3 group-active:scale-95 transition-transform">
                                    <img
                                        src={category.image || (
                                            category.name.toLowerCase().includes('chicken') ? "/products/chicken_whole.png" :
                                                category.name.toLowerCase().includes('mutton') ? "/products/mutton_curry.png" :
                                                    "/products/chicken_whole.png"
                                        )}
                                        alt={category.name}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                </div>
                                <span className="text-sm font-black text-center leading-tight text-gray-800 tracking-tight">
                                    {category.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Categories;
