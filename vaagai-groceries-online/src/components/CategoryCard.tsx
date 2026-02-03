import * as React from "react";
import { Category } from "@/data/products";
import { cn } from "@/lib/utils";
import {
  Wheat,
  Bean,
  Droplets,
  Flame,
  Coffee,
  Cookie,
  Nut,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

const iconMap: Record<string, React.ElementType> = {
  staples: Wheat,
  pulses: Bean,
  oils: Droplets,
  spices: Flame,
  beverages: Coffee,
  snacks: Cookie,
  dryfruits: Nut,
  household: Sparkles,
};

interface CategoryCardProps {
  category: Category;
  index: number;
}

export function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <Link
      to={`/shop?category=${category.id}`}
      className="group relative overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500"
        />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t opacity-50 group-hover:opacity-70 transition-opacity",
          category.color === "from-amber-400 to-orange-500" && "from-amber-400/30 to-orange-500/30",
          category.color === "from-yellow-400 to-amber-500" && "from-yellow-400/30 to-amber-500/30",
          category.color === "from-lime-400 to-green-500" && "from-lime-400/30 to-green-500/30",
          category.color === "from-red-400 to-orange-500" && "from-red-400/30 to-orange-500/30",
          category.color === "from-amber-600 to-brown-600" && "from-amber-600/30 to-amber-800/30",
          category.color === "from-orange-400 to-red-400" && "from-orange-400/30 to-red-400/30",
          category.color === "from-amber-500 to-yellow-600" && "from-amber-500/30 to-yellow-600/30",
          category.color === "from-blue-400 to-cyan-500" && "from-blue-400/30 to-cyan-500/30",
        )} />
      </div>

      {/* Content */}
      <div className="relative p-5 flex flex-col items-center text-center min-h-[140px] justify-center">
        <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
          {(() => {
            const Icon = iconMap[category.slug] || Sparkles;
            return <Icon className="h-10 w-10 text-foreground group-hover:text-primary transition-colors" />;
          })()}
        </div>
        <h3 className="font-bold text-foreground text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60">
          {category.productCount}+ Products
        </p>
      </div>
    </Link>
  );
}
