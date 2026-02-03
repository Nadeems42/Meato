import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

export function CartSidebar() {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalAmount,
    totalItems,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-foreground/50 z-50 transition-opacity duration-300",
          isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[420px] bg-card z-50 shadow-elevated transition-transform duration-300 flex flex-col",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold font-display">Your Cart</h2>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {totalItems} items
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCartOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Your cart is empty
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add some fresh groceries to get started
              </p>
              <Button variant="default" onClick={() => setIsCartOpen(false)}>
                Start Shopping
              </Button>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={`${item.product.id}-${item.variant?.id || 'base'}`}
                className="flex gap-3 bg-muted/30 rounded-xl p-3 animate-slide-in-right"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm line-clamp-1">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-primary font-bold mt-0.5">
                    {item.variant ? item.variant.name : item.product.unit}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold text-foreground">
                      ₹{(item.variant ? item.variant.price : item.product.price) * item.quantity}
                    </span>
                    <div className="flex items-center gap-1 bg-card rounded-lg border border-border">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-destructive hover:bg-destructive/10"
                  onClick={() => removeFromCart(item.product.id, item.variant?.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium text-primary">
                  {totalAmount >= 500 ? "FREE" : "₹40"}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{totalAmount + (totalAmount >= 500 ? 0 : 40)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="cta"
                size="lg"
                className="w-full font-black text-lg h-14 rounded-2xl shadow-primary"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>

            {/* Free Delivery Banner */}
            {totalAmount < 500 && (
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <p className="text-sm text-primary font-medium">
                  Add ₹{500 - totalAmount} more for FREE delivery!
                </p>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
