import { Star, Plus, Minus, Bell } from "lucide-react";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const [imageError, setImageError] = useState(false);

  const standardPrice = product.price;
  const mrp = product.mrp || product.originalPrice || standardPrice * 1.2;
  const discount = mrp > standardPrice
    ? Math.round(((mrp - standardPrice) / mrp) * 100)
    : 0;

  const savingAmount = mrp - standardPrice;

  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' dy='50%25' dx='50%25' text-anchor='middle' dominant-baseline='middle'%3E" + encodeURIComponent(product.name) + "%3C/text%3E%3C/svg%3E";

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden flex flex-col p-2 h-full transition-all duration-300 hover:shadow-md border border-transparent hover:border-gray-100"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image Wrapper */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 group-hover:bg-gray-100 transition-colors">
        <Link
          to={`/product/${product.id}`}
          className="block h-full w-full"
        >
          <img
            src={imageError ? fallbackImage : product.image}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 p-2"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </Link>

        {/* ADD Button Overlay */}
        <div className="absolute bottom-2 right-2 z-10">
          {!product.inStock ? (
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-destructive border-destructive hover:bg-destructive hover:text-white px-3 py-1 h-8 text-[10px] font-bold shadow-sm"
            >
              <Bell className="h-3 w-3 mr-1" />
              NOTIFY
            </Button>
          ) : quantity === 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-primary border-primary hover:bg-primary hover:text-white px-4 py-1 h-8 text-[11px] font-bold shadow-sm transition-all"
              onClick={() => {
                addToCart(product);
                setIsCartOpen(true);
              }}
            >
              ADD
            </Button>
          ) : (
            <div className="flex items-center bg-primary text-white rounded-lg shadow-sm h-8 overflow-hidden">
              <button
                className="px-2 h-full hover:bg-primary/90 transition-colors"
                onClick={() => updateQuantity(product.id, quantity - 1)}
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-xs font-bold">{quantity}</span>
              <button
                className="px-2 h-full hover:bg-primary/90 transition-colors"
                onClick={() => updateQuantity(product.id, quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {!product.inStock && (
          <div className="absolute inset-x-0 bottom-0 py-1 bg-gray-800/80 text-center">
            <span className="text-[10px] text-white font-bold uppercase tracking-wider">Sold out</span>
          </div>
        )}
      </div>

      {/* Pricing Info */}
      <div className="px-1 space-y-1">
        <div className="flex flex-col gap-0.5">
          {mrp > standardPrice && (
            <span className="text-[11px] text-gray-400 line-through font-medium">MRP ₹{mrp}</span>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-foreground">
              ₹{standardPrice}
            </span>
          </div>
        </div>

        {/* Savings Badge */}
        {savingAmount > 0 && (
          <div className="flex items-center mt-1">
            <div className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-1">
              <span>₹{Math.floor(savingAmount)}</span>
              <span className="opacity-70">OFF</span>
            </div>
          </div>
        )}

        {/* Product Name */}
        <Link
          to={`/product/${product.id}`}
          title={product.name}
          className="block mt-1"
        >
          <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight h-8 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Pack Size / Unit */}
        <div className="text-[10px] text-gray-500 font-medium">
          {product.unit}
        </div>
      </div>
    </div>
  );
}
