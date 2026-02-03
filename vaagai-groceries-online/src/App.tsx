import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Auth = lazy(() => import("./pages/Auth"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const Profile = lazy(() => import("./pages/Profile"));
const RegisterLanding = lazy(() => import("./pages/RegisterLanding"));
const Categories = lazy(() => import("./pages/Categories"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const FAQ = lazy(() => import("./pages/FAQ"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy Load Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const HeroSettings = lazy(() => import("./pages/admin/HeroSettings"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminSettings = lazy(() => import("./pages/admin/GeneralSettings"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const AdminShops = lazy(() => import("./pages/admin/Shops"));
const DeliveryZones = lazy(() => import("./pages/admin/DeliveryZones"));
const DeliveryDashboard = lazy(() => import("./pages/delivery/Dashboard"));
const OrderDetail = lazy(() => import("./pages/delivery/OrderDetail"));
const ShopDashboard = lazy(() => import("./pages/shop/Dashboard"));
const ShopInventory = lazy(() => import("./pages/shop/Inventory"));
const ShopSettings = lazy(() => import("./pages/shop/Settings"));
const ShopOrders = lazy(() => import("./pages/shop/Orders"));

const ShopRiders = lazy(() => import("./pages/shop/Riders"));

import { ScrollToTop } from "@/components/ScrollToTop";
import { HeroProvider } from "@/context/HeroContext";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { FloatingCart } from "@/components/FloatingCart";
import { CartSidebar } from "@/components/CartSidebar";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { DeliveryRoute } from "@/components/delivery/DeliveryRoute";
import { ShopRoute } from "@/components/shop/ShopRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";


const queryClient = new QueryClient();

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Wrapper to conditionally show customer UI components
const ConditionalCustomerUI = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDeliveryRoute = location.pathname.startsWith('/delivery');
  const isStaffRoute = isAdminRoute || isDeliveryRoute;

  return (
    <>
      <div className={isStaffRoute ? "flex flex-col min-h-screen" : "flex flex-col min-h-screen pb-16 md:pb-0"}>
        {children}
      </div>
      {!isStaffRoute && (
        <>

          <FloatingCart />
          <CartSidebar />
          <BottomNav />
        </>
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <HeroProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner position="top-center" />
                <BrowserRouter>
                  <ConditionalCustomerUI>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/track-order" element={<TrackOrder />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/login" element={<Auth mode="login" />} />
                        <Route path="/login" element={<Auth mode="login" />} />
                        <Route path="/register" element={<Auth mode="register" />} />
                        <Route path="/admin-login" element={<Auth mode="login" adminAccess={true} />} />

                        {/* Policy Pages */}
                        <Route path="/terms" element={<TermsConditions />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/refund-policy" element={<RefundPolicy />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                        <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
                        <Route path="/admin/delivery-zones" element={<AdminRoute><DeliveryZones /></AdminRoute>} />
                        <Route path="/admin/hero" element={<AdminRoute><HeroSettings /></AdminRoute>} />
                        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                        <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
                        <Route path="/admin/shops" element={<AdminRoute><AdminShops /></AdminRoute>} />

                        {/* Delivery Routes */}
                        <Route path="/delivery-login" element={<Auth mode="login" role="delivery_person" />} />
                        <Route path="/delivery" element={<DeliveryRoute><DeliveryDashboard /></DeliveryRoute>} />
                        <Route path="/delivery/order/:id" element={<DeliveryRoute><OrderDetail /></DeliveryRoute>} />

                        {/* Shop Routes */}
                        <Route path="/shop/dashboard" element={<ShopRoute><ShopDashboard /></ShopRoute>} />
                        <Route path="/shop/inventory" element={<ShopRoute><ShopInventory /></ShopRoute>} />
                        <Route path="/shop/settings" element={<ShopRoute><ShopSettings /></ShopRoute>} />
                        <Route path="/shop/orders" element={<ShopRoute><ShopOrders /></ShopRoute>} />
                        <Route path="/shop/riders" element={<ShopRoute><ShopRiders /></ShopRoute>} />
                        <Route path="/shop/manager" element={<Navigate to="/shop/dashboard" replace />} />

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>

                    <ScrollToTop />
                  </ConditionalCustomerUI>
                </BrowserRouter>
              </TooltipProvider>
            </HeroProvider>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </ErrorBoundary >
  </QueryClientProvider >
);

export default App;
