import { useState } from "react";
import { Search, ShoppingCart, User, Menu, X, MapPin, ChevronDown, Mic, Apple, Carrot, Milk, CupSoda, Sparkles, Home, Egg, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import { LocationModal } from "./LocationModal";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Crown } from "lucide-react";

export function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { address, deliveryType } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = [
    { name: "Milk", category: "Dairy" },
    { name: "Bread", category: "Bakery" },
    { name: "Banana", category: "Fruits" },
    { name: "Tomato", category: "Vegetables" },
    { name: "Saffola Oil", category: "Grocery" },
  ];

  const filteredSuggestions = searchQuery.length > 0
    ? suggestions.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <header className="w-full bg-primary text-primary-foreground">
      {/* Top Section - Logo & Navigation (Not Sticky) */}
      <div className="bg-primary border-b border-white/10">
        <div className="container py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg overflow-hidden bg-white p-0.5 group-hover:scale-105 transition-transform">
                <img src="/logo.jpg" alt="Meato Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tight drop-shadow-sm">Meato</span>
            </Link>

            <Link to="/categories" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs font-bold uppercase tracking-wider">
              <Grid className="h-4 w-4" />
              Categories
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 ml-4">
              <Link to="/orders" className="text-xs font-black uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">My Orders</Link>
              <Link to="/orders" className="text-xs font-black uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">Buy Again</Link>
              <Link to="/profile" className="text-xs font-black uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">Account</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative h-10 md:h-12 px-3 md:px-4 rounded-xl bg-cta text-cta-foreground hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-primary group"
            >
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:-rotate-12" />
              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-[10px] font-black uppercase opacity-80 tracking-widest">My Cart</span>
                <span className="text-sm font-black">{totalItems > 0 ? `${totalItems} Items` : "Empty"}</span>
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 md:h-6 md:w-6 bg-white text-primary rounded-full flex items-center justify-center text-[10px] md:text-xs font-black shadow-lg animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </button>

            <div className="flex flex-col items-end">
              <span className="text-[10px] opacity-80 uppercase font-black tracking-wider">
                {deliveryType === "fast" ? "⚡ Superfast" : "Standard"}
              </span>
              <div className="bg-white/10 px-2 md:px-3 py-1 rounded-md text-xs md:text-sm font-black border border-white/10">
                {deliveryType === "fast" ? "10 min" : "45 min"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Section - Location & Search */}
      <div className="sticky top-0 z-50 bg-primary shadow-md">
        <div className="container py-3 flex flex-col gap-3">
          <LocationModal>
            <button className="flex items-center gap-2 text-xs md:text-sm text-left group">
              <MapPin className="h-4 w-4 flex-shrink-0 group-hover:animate-bounce" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold flex items-center gap-1">
                  <span className="hidden sm:inline">Deliver to</span>
                  <span className="sm:hidden">To</span>
                  <span className="opacity-90 underline decoration-white/30 truncate max-w-[100px] sm:max-w-[150px]">{address}</span>
                  <ChevronDown className="h-3 w-3 flex-shrink-0" />
                </span>
              </div>
            </button>
          </LocationModal>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <Input
              type="search"
              placeholder='Search "Banana"'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 md:pl-12 pr-10 md:pr-12 h-11 md:h-12 rounded-xl border-none bg-white text-foreground focus:ring-2 focus:ring-accent/50 text-sm md:text-base font-medium transition-all shadow-inner"
            />
            <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mic className="h-4 w-4 md:h-5 md:w-5" />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-elevated border border-slate-100 overflow-hidden z-[60]">
                {filteredSuggestions.map((item, idx) => (
                  <Link
                    key={idx}
                    to="/shop"
                    className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 text-foreground transition-colors border-b border-slate-50 last:border-0"
                    onClick={() => {
                      setSearchQuery(item.name);
                      setShowSuggestions(false);
                    }}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black">{item.category}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-300 -rotate-90" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}

