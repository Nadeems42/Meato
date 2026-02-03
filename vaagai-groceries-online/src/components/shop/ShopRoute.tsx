import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export const ShopRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, isShopAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated || !isShopAdmin) {
        return <Navigate to="/admin-login" replace />;
    }

    return children;
};
