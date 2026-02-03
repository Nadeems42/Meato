import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { checkLocation, findNearestShop } from "@/services/locationService";

interface LocationContextType {
    pincode: string;
    address: string;
    deliveryType: "fast" | "standard" | null;
    distance: number | null;
    shopId: number | null;
    setLocation: (pincode: string, address: string) => void;
    isLoading: boolean;
    detectLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [pincode, setPincode] = useState<string>(localStorage.getItem("meato_pincode") || "");
    const [address, setAddress] = useState<string>(localStorage.getItem("meato_address") || "Select Location");
    const [deliveryType, setDeliveryType] = useState<"fast" | "standard" | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [shopId, setShopId] = useState<number | null>(() => {
        const saved = localStorage.getItem("meato_shop_id");
        return saved ? parseInt(saved) : null;
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (pincode) {
            verifyLocation({ pincode });
        }
    }, []);

    const verifyLocation = async (params: { lat?: number; lng?: number; pincode?: string }) => {
        try {
            const data = await checkLocation(params);
            if (data.available && data.type) {
                setDeliveryType(data.type);
                setDistance(data.distance || 0);
            } else {
                setDeliveryType(null);
                setDistance(null);
                toast.error(data.message || "Delivery not available in this area");
            }
        } catch (error) {
            console.error(error);
            setDeliveryType(null);
        }
    };

    const setLocation = (pin: string, addr: string) => {
        setPincode(pin);
        setAddress(addr);
        localStorage.setItem("meato_pincode", pin);
        localStorage.setItem("meato_address", addr);
        verifyLocation({ pincode: pin });
        toast.success(`Location updated to ${pin}`);
    };

    const detectLocation = () => {
        setIsLoading(true);
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // 1. Find Nearest Shop
                try {
                    const shopData = await findNearestShop(latitude, longitude);
                    if (shopData.found && shopData.shop) {
                        setShopId(shopData.shop.id);
                        localStorage.setItem("meato_shop_id", shopData.shop.id.toString());
                        toast.success(`Connected to ${shopData.shop.name}`);
                    } else {
                        toast.error("No store found nearby. Showing default catalog.");
                        setShopId(1); // Default
                        localStorage.setItem("meato_shop_id", "1");
                    }
                } catch (e) {
                    console.error("Failed to find shop", e);
                    setShopId(1); // Default fallback
                }

                // 2. Reverse Geocoding via Nominatim (OpenStreetMap)
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();

                    const pin = data.address.postcode || "";
                    const addr = data.display_name || "Detected Location";

                    setPincode(pin);
                    setAddress(addr);
                    localStorage.setItem("meato_pincode", pin);
                    localStorage.setItem("meato_address", addr);

                    // 3. Check Delivery Availability
                    await verifyLocation({ lat: latitude, lng: longitude, pincode: pin });

                } catch (error) {
                    toast.error("Failed to fetch address details");
                } finally {
                    setIsLoading(false);
                }
            },
            () => {
                toast.error("Unable to retrieve your location");
                setIsLoading(false);
            }
        );
    };

    return (
        <LocationContext.Provider
            value={{
                pincode,
                address,
                deliveryType,
                distance,
                shopId,
                setLocation,
                isLoading,
                detectLocation,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error("useLocation must be used within a LocationProvider");
    }
    return context;
}
