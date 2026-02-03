import { ArrowRight, ShoppingBag, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHero } from "@/context/HeroContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";

export function Hero() {
  const { heroData } = useHero();
  const [api, setApi] = useState<CarouselApi>();

  // Auto-play functionality
  useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [api]);

  return (
    <section className="relative w-full bg-white overflow-hidden pb-8">
      {/* Curved Background / Banner Container */}
      <div className="relative h-[480px] md:h-[520px] lg:h-[600px] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 hover:scale-105"
          style={{
            backgroundImage: `url(${heroData.backgroundImageUrl})`,
          }}
        >
          {/* Enhanced Overlay for readability but keeping freshness */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>

        <div className="container relative z-10 h-full flex flex-col justify-center text-white px-6">
          <div className="max-w-2xl space-y-6">
            {/* Express Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-white/20 text-white text-xs font-black tracking-widest uppercase animate-in fade-in slide-in-from-left-4 duration-500">
              <Clock className="h-4 w-4 text-accent" />
              <span>{heroData.badge}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-[1.1] animate-in fade-in slide-in-from-left-6 duration-700 delay-100">
              {heroData.title.split('&').map((part, idx) => (
                <span key={idx} className="block">
                  {idx > 0 && <span className="text-accent">&</span>}
                  {part}
                </span>
              ))}
            </h1>

            <p className="text-lg md:text-xl text-white/90 max-w-lg font-medium leading-relaxed animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
              {heroData.subtitle}
            </p>

            <div className="flex flex-wrap gap-4 pt-4 animate-in fade-in slide-in-from-left-10 duration-700 delay-300">
              <Link to="/shop">
                <Button variant="cta" size="xl" className="h-14 md:h-16 px-8 md:px-10 rounded-2xl shadow-elevated text-lg font-black group">
                  {heroData.buttonText}
                  <ShoppingBag className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                </Button>
              </Link>
              <Link to="/categories#eggs">
                <Button variant="outline" size="xl" className="h-14 md:h-16 px-8 md:px-10 rounded-2xl border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm shadow-lg text-lg font-black">
                  {heroData.secondaryButtonText}
                </Button>
              </Link>
            </div>

            {/* Micro-Features */}
            <div className="flex items-center gap-8 pt-8 animate-in fade-in duration-1000 delay-500">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30 backdrop-blur-sm">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Quality</p>
                  <p className="text-sm font-bold text-white">Certified Fresh</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-fresh/20 flex items-center justify-center border border-fresh/30 backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-fresh" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Delivery</p>
                  <p className="text-sm font-bold text-white">Express Service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Banner Carousel */}
      <div className="container mt-8 relative z-20">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {[
              {
                name: "Fresh Chicken",
                tagline: "Premium Quality, Farm Fresh",
                img: "/banner-chicken.jpg",
                gradient: "from-orange-900/80 via-orange-800/60 to-transparent"
              },
              {
                name: "Farm Fresh Eggs",
                tagline: "Organic & Nutritious",
                img: "/banner-eggs.jpg",
                gradient: "from-amber-900/80 via-amber-800/60 to-transparent"
              },
              {
                name: "Premium Mutton",
                tagline: "Tender & Delicious Cuts",
                img: "/banner-mutton.jpg",
                gradient: "from-red-900/80 via-red-800/60 to-transparent"
              },
            ].map((cat, i) => (
              <CarouselItem key={i}>
                <Link to="/shop" className="block group">
                  <div className="relative h-[280px] md:h-[320px] rounded-3xl overflow-hidden shadow-elevated">
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${cat.img})` }}
                    />

                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${cat.gradient}`} />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-center px-8 md:px-12 text-white">
                      <div className="max-w-xl space-y-3">
                        <div className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                          <span className="text-xs font-black tracking-widest uppercase">Premium Selection</span>
                        </div>

                        <h3 className="text-4xl md:text-5xl font-black leading-tight">
                          {cat.name}
                        </h3>

                        <p className="text-lg md:text-xl text-white/90 font-medium">
                          {cat.tagline}
                        </p>

                        <Button
                          variant="default"
                          size="lg"
                          className="mt-4 rounded-xl font-black group-hover:scale-105 transition-transform shadow-lg bg-white text-slate-900 hover:bg-white/90"
                        >
                          Shop Now
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:flex">
            <CarouselPrevious className="left-4 bg-white/90 backdrop-blur-sm border-2 border-white/20 text-slate-900 hover:bg-white transition-all h-12 w-12" />
            <CarouselNext data-carousel="next" className="right-4 bg-white/90 backdrop-blur-sm border-2 border-white/20 text-slate-900 hover:bg-white transition-all h-12 w-12" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
