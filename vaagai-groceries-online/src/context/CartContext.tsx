import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, Variant } from "@/data/products";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { useLocation } from "./LocationContext";
import api from "@/lib/axios";

export interface CartItem {
  product: Product;
  variant?: Variant;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: Variant) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { shopId } = useLocation();

  // Store which shop the current cart belongs to
  const [cartShopId, setCartShopId] = useState<number | null>(() => {
    const saved = localStorage.getItem("cart_shop_id");
    return saved ? parseInt(saved) : null;
  });

  // Clear cart if shop changes and we have items
  useEffect(() => {
    if (shopId && cartShopId && shopId !== cartShopId && items.length > 0) {
      clearCart();
      toast.warning("Cart cleared because you switched store location");
      setCartShopId(shopId);
      localStorage.setItem("cart_shop_id", shopId.toString());
    } else if (shopId && !cartShopId) {
      // Initialize
      setCartShopId(shopId);
      localStorage.setItem("cart_shop_id", shopId.toString());
    }
  }, [shopId]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      const data = response.data;

      const itemsToMap = Array.isArray(data) ? data : (data?.items || []);

      const mappedItems: CartItem[] = itemsToMap.map((item: any) => ({
        product: {
          ...item.product,
          id: item.product.id.toString(),
          mrp: Number(item.product.mrp) || (Number(item.product.price) * 1.2),
        },
        variant: item.variant ? {
          ...item.variant,
          id: item.variant.id.toString(),
          name: item.variant.variant_name,
          stockQty: item.variant.stock_qty
        } : undefined,
        quantity: item.quantity,
      }));
      setItems(mappedItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1, variant?: Variant) => {
    // If cart is empty, ensure we lock to current shop
    if (items.length === 0 && shopId) {
      setCartShopId(shopId);
      localStorage.setItem("cart_shop_id", shopId.toString());
    }

    const itemName = variant ? `${product.name} (${variant.name})` : product.name;

    if (isAuthenticated) {
      try {
        const existing = items.find(
          (item) => item.product.id === product.id && item.variant?.id === variant?.id
        );
        const newQuantity = existing ? existing.quantity + quantity : quantity;

        const response = await api.post("/cart", {
          product_id: typeof product.id === 'string' ? parseInt(product.id.replace("p", "")) : product.id,
          variant_id: variant ? (typeof variant.id === 'string' ? parseInt(variant.id.replace("v", "")) : variant.id) : null,
          quantity: newQuantity,
        });

        await fetchCart();
        toast.success(existing ? `Increased ${itemName} quantity` : `${itemName} added to cart`);
      } catch (error) {
        toast.error("Failed to update cart");
      }
    } else {
      setItems((prev) => {
        const existing = prev.find(
          (item) => item.product.id === product.id && item.variant?.id === variant?.id
        );

        if (existing) {
          toast.success(`Increased ${itemName} quantity`);
          return prev.map((item) =>
            item.product.id === product.id && item.variant?.id === variant?.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        toast.success(`${itemName} added to cart`);
        return [...prev, { product, variant, quantity }];
      });
    }
  };

  const removeFromCart = async (productId: string, variantId?: string) => {
    if (isAuthenticated) {
      try {
        const pId = typeof productId === 'string' ? parseInt(productId.replace("p", "")) : productId;
        const vIdParam = variantId ? `?variant_id=${typeof variantId === 'string' ? variantId.replace("v", "") : variantId}` : "";
        await api.delete(`/cart/${pId}${vIdParam}`);
        await fetchCart();
        toast.info("Removed from cart");
      } catch (error) {
        toast.error("Failed to remove item");
      }
    } else {
      setItems((prev) => {
        const item = prev.find(
          (i) => i.product.id === productId && i.variant?.id === variantId
        );
        if (item) {
          const itemName = item.variant ? `${item.product.name} (${item.variant.name})` : item.product.name;
          toast.info(`${itemName} removed from cart`);
        }
        return prev.filter(
          (item) => !(item.product.id === productId && item.variant?.id === variantId)
        );
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    if (isAuthenticated) {
      try {
        const pId = typeof productId === 'string' ? parseInt(productId.replace("p", "")) : productId;
        const vId = variantId ? (typeof variantId === 'string' ? parseInt(variantId.replace("v", "")) : variantId) : null;
        await api.post("/cart", {
          product_id: pId,
          variant_id: vId,
          quantity: quantity,
        });
        await fetchCart();
      } catch (error) {
        toast.error("Failed to update quantity");
      }
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId && item.variant?.id === variantId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.post("/cart/clear");
        setItems([]);
      } catch (error) {
        console.error("Failed to clear cart", error);
      }
    } else {
      setItems([]);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      return sum + price * item.quantity;
    },
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
