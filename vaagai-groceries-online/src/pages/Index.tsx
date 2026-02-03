import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { products as mockProducts, Product as FrontendProduct } from "@/data/products";
import { ArrowRight, Sparkles, ChevronRight, Loader2, Search, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getProducts, getCategories, Product as BackendProduct, Category as BackendCategory } from "@/services/productService";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollToTop } from "@/components/ScrollToTop";

interface BestsellerData {
  id: string;
  title: string;
  moreCount: number;
  images: string[];
}

import { useLocation } from "@/context/LocationContext";

const Index = () => {
  const { shopId } = useLocation();
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [bestsellers, setBestsellers] = useState<BestsellerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(shopId),
          getCategories()
        ]);

        const mapped: FrontendProduct[] = productsData.map(p => ({
          id: p.id.toString(),
          name: p.name,
          category: p.category?.name || "General",
          categoryId: p.category_id.toString(),
          price: Number(p.price),
          mrp: Number(p.mrp) || (Number(p.price) * 1.2),
          unit: "500 g",
          image: p.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
          description: p.description,
          inStock: p.stock > 0,
          rating: 4.5 + Math.random() * 0.5,
          reviews: Math.floor(Math.random() * 200) + 50,
        }));
        setProducts(mapped);

        // Group bestsellers by category
        const bestsellersMapped: BestsellerData[] = categoriesData.map(cat => {
          const categoryProducts = productsData.filter(p => p.category_id === cat.id);
          const images = categoryProducts
            .map(p => p.image)
            .filter(img => !!img)
            .slice(0, 4) as string[];

          // Fallback images based on category name
          const defaultImage = cat.name.toLowerCase().includes('chicken')
            ? "/products/chicken_whole.png"
            : cat.name.toLowerCase().includes('mutton')
              ? "/products/mutton_curry.png"
              : "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80";

          while (images.length < 4) {
            images.push(defaultImage);
          }

          return {
            id: cat.id.toString(),
            title: cat.name,
            moreCount: Math.max(0, categoryProducts.length - 4),
            images
          };
        }).filter(b => b.images.length > 0);

        setBestsellers(bestsellersMapped);
      } catch (error) {
        console.error("Error fetching home data:", error);
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [shopId]);

  const featuredLocal = products.filter(p => p.rating > 4.8 || p.id.includes("1"));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Quick Order Track Section */}
        <section className="relative z-30 -mt-10 md:-mt-14 mb-12 max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-elevated border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Truck className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-black">Where's my order?</h3>
                <p className="text-sm text-muted-foreground">Track your fresh meat delivery in real-time.</p>
              </div>
            </div>
            <Link to="/track-order" className="w-full md:w-auto">
              <Button size="xl" className="w-full md:w-auto rounded-2xl h-14 px-10 font-black shadow-lg shadow-primary/20 hover:scale-105 transition-transform group">
                Track Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Categories Section (Small horizontal icons are already in Header) */}

        {/* Bestselling Section - Custom Layout Matching Image */}
        <section className="py-8 md:py-12 bg-white">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                Bestselling
              </h2>
              <Button variant="ghost" className="text-primary font-bold flex items-center gap-1">
                See All <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {(loading ? Array(3).fill(0) : bestsellers).map((item, index) => (
                    <CarouselItem key={index} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                      {loading ? (
                        <div className="h-[400px] bg-slate-100 animate-pulse rounded-3xl" />
                      ) : (
                        <BestsellerCard
                          id={item.id}
                          title={item.title}
                          moreCount={item.moreCount}
                          images={item.images}
                        />
                      )}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:flex">
                  <CarouselPrevious className="-left-12 bg-white border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary transition-all h-12 w-12" />
                  <CarouselNext className="-right-12 bg-white border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary transition-all h-12 w-12" />
                </div>
              </Carousel>
            </div>
          </div>
        </section>

        {/* Today's Best Deals */}
        <section className="py-12 bg-muted/20">
          <div className="container">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                Today's Best Deals
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {loading ? (
                Array(5).fill(0).map((_, i) => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />)
              ) : featuredLocal.length > 0 ? (
                featuredLocal.slice(0, 5).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))
              ) : (
                products.slice(0, 5).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Popular Products */}
        <section className="py-12 bg-white mb-10">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                Popular Products
              </h2>
              <Button variant="outline" className="rounded-xl border-primary text-primary font-bold px-6">
                Browse All
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {loading ? (
                Array(10).fill(0).map((_, i) => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />)
              ) : (
                products.slice(0, 10).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

// Internal component for Bestseller Card matching image 3
function BestsellerCard({ id, title, moreCount, images }: { id: string, title: string, moreCount: number, images: string[] }) {
  return (
    <Link to={`/shop?category=${id}`} className="block">
      <div className="bg-white border border-border/50 rounded-3xl p-5 flex flex-col gap-5 group cursor-pointer hover:shadow-elevated hover:-translate-y-2 transition-all duration-500 h-full">
        <div className="grid grid-cols-2 gap-3">
          {images.map((img, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-muted/30 shadow-sm border border-black/5 relative after:absolute after:inset-0 after:bg-primary/5 after:opacity-0 group-hover:after:opacity-100 transition-all">
              <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] bg-accent/20 text-accent-foreground px-4 py-1 rounded-full shadow-sm font-black mb-2 border border-accent/30 tracking-wider uppercase">
            +{moreCount} more
          </span>
          <h3 className="font-black text-xl leading-tight text-foreground group-hover:text-primary transition-colors">{title}</h3>
        </div>
      </div>
    </Link>
  );
}


export default Index;
