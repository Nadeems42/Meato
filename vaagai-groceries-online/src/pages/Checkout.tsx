import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Truck, MapPin, ChevronLeft, Loader2, Zap, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from "@/services/orderService";
import { checkDeliveryZone } from "@/services/deliveryZoneService";

const Checkout = () => {
    const { items, totalAmount, clearCart } = useCart();
    const { pincode: locPincode, address: locAddress, deliveryType, shopId } = useLocation();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [submitting, setSubmitting] = useState(false);
    const [checkingZone, setCheckingZone] = useState(false);
    const [isFastDeliveryZone, setIsFastDeliveryZone] = useState(false);
    const [deliveryZoneName, setDeliveryZoneName] = useState("");

    // Form State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [houseNo, setHouseNo] = useState("");
    const [street, setStreet] = useState("");
    const [landmark, setLandmark] = useState("");
    const [city, setCity] = useState("Buldhana");
    const [pincode, setPincode] = useState("");
    const [coords, setCoords] = useState<{ lat: number | null, lng: number | null }>({ lat: null, lng: null });
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setPhone(user.phone || "");
        }
    }, [user]);

    useEffect(() => {
        if (locPincode) {
            setPincode(locPincode);
            checkZone(locPincode);
        }
        if (locAddress && locAddress !== "Select Location") setStreet(locAddress);
    }, [locPincode, locAddress]);

    const checkZone = async (pincodeValue: string) => {
        if (!pincodeValue || pincodeValue.length < 6) {
            setIsFastDeliveryZone(false);
            setDeliveryZoneName("");
            return;
        }

        setCheckingZone(true);
        try {
            const result = await checkDeliveryZone(pincodeValue);
            setIsFastDeliveryZone(result.fast_delivery);
            setDeliveryZoneName(result.zone_name || "");

            if (result.fast_delivery) {
                toast({
                    title: "⚡ Fast Delivery Available!",
                    description: "Instant delivery for your location"
                });
            }
        } catch (error) {
            console.error('Error checking delivery zone:', error);
            setIsFastDeliveryZone(false);
            setDeliveryZoneName("");
        } finally {
            setCheckingZone(false);
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast({ title: "Error", description: "Geolocation is not supported by your browser", variant: "destructive" });
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });
                toast({ title: "Success", description: "Location captured successfully!" });
                setIsLocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                toast({ title: "Location Error", description: "Please enable location permissions", variant: "destructive" });
                setIsLocating(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const totalGst = items.reduce((sum, item) => {
        const gst = item.product.gst_percentage || 0;
        const price = item.variant ? item.variant.price : item.product.price;
        return sum + (Number(price) * item.quantity * Number(gst)) / 100;
    }, 0);

    const deliveryFee = isFastDeliveryZone ? 25 : 15;
    const handlingFee = 5;
    const total = totalAmount + totalGst + deliveryFee + handlingFee;

    const handlePlaceOrder = async () => {
        if (!name || !phone || !houseNo || !street || !pincode) {
            toast({ title: "Error", description: "Please fill all delivery details", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            const deliveryAddress = {
                name,
                phone,
                house_no: houseNo,
                street: street,
                landmark: landmark,
                city,
                pincode,
                lat: coords.lat,
                lng: coords.lng
            };

            const orderItems = items.map(item => ({
                product_id: parseInt(item.product.id),
                quantity: item.quantity
            }));

            await createOrder({
                items: orderItems,
                delivery_type: deliveryType || 'standard',
                delivery_address: deliveryAddress,
                shop_id: shopId
            } as any);

            toast({ title: "Success", description: "Order placed successfully!" });
            clearCart();
            navigate("/orders");
        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.response?.data?.message || "Failed to place order", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="text-center space-y-4">
                        <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <Truck className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-black">Your cart is empty</h2>
                        <p className="text-muted-foreground text-foreground">Add some items to checkout</p>
                        <Button onClick={() => navigate("/shop")}>Go Shopping</Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 container py-8 pb-24">
                <Button
                    variant="ghost"
                    className="mb-6 -ml-2 text-muted-foreground hover:text-primary"
                    onClick={() => navigate(-1)}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="rounded-3xl border-none shadow-soft text-foreground bg-card">
                            <CardHeader className="bg-white border-b border-slate-100">
                                <CardTitle className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        Delivery Address
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-primary text-primary font-bold h-9"
                                        onClick={handleUseCurrentLocation}
                                        disabled={isLocating}
                                    >
                                        {isLocating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
                                        Use my location
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" className="rounded-xl h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" className="rounded-xl h-12" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="houseNo">Flat / House No / Floor</Label>
                                        <Input
                                            id="houseNo"
                                            value={houseNo}
                                            onChange={e => setHouseNo(e.target.value)}
                                            placeholder="e.g. Flat 101, 1st Floor"
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="street">Street / Area</Label>
                                        <Input
                                            id="street"
                                            value={street}
                                            onChange={e => setStreet(e.target.value)}
                                            placeholder="e.g. Main Street, Green Park"
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                                    <Input
                                        id="landmark"
                                        value={landmark}
                                        onChange={e => setLandmark(e.target.value)}
                                        placeholder="e.g. Near City Hospital"
                                        className="rounded-xl h-12"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="rounded-xl h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pincode">Pincode</Label>
                                        <Input
                                            id="pincode"
                                            value={pincode}
                                            onChange={e => setPincode(e.target.value)}
                                            onBlur={e => checkZone(e.target.value)}
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                </div>

                                {pincode.length >= 6 && !checkingZone && (
                                    <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${isFastDeliveryZone
                                        ? 'border-primary/30 bg-primary/5'
                                        : 'border-muted bg-muted/30'
                                        }`}>
                                        {isFastDeliveryZone ? (
                                            <>
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <Zap className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-primary">⚡ Instant Fast Delivery</h4>
                                                    <p className="text-sm text-muted-foreground">Your location is eligible for super-fast delivery!</p>
                                                </div>
                                                <span className="text-xl font-black text-primary">₹25</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-2 rounded-lg bg-muted">
                                                    <Package className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold">Standard Delivery</h4>
                                                    <p className="text-sm text-muted-foreground">Regular delivery for your location</p>
                                                </div>
                                                <span className="text-xl font-black">₹15</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-none shadow-soft text-foreground bg-card">
                            <CardHeader className="bg-white border-b border-slate-100">
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    Payment Method
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <RadioGroup defaultValue="cod" className="grid gap-4">
                                    <div className="flex items-center space-x-3 p-4 rounded-2xl border border-primary/20 bg-primary/5 cursor-pointer">
                                        <RadioGroupItem value="cod" id="cod" />
                                        <Label htmlFor="cod" className="flex-1 font-bold cursor-pointer">Cash on Delivery</Label>
                                    </div>
                                    <div className="opacity-50 pointer-events-none flex items-center space-x-3 p-4 rounded-2xl border border-slate-100">
                                        <RadioGroupItem value="online" id="online" disabled />
                                        <Label className="flex-1 font-bold">Online Payment (Coming Soon)</Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-3xl border-none shadow-soft sticky top-32 text-foreground bg-card">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item.product.id} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {item.product.name} <span className="font-bold text-foreground">x {item.quantity}</span>
                                            </span>
                                            <span className="font-medium">
                                                ₹{(item.variant ? item.variant.price : item.product.price) * item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Item Total</span>
                                        <span>₹{totalAmount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Delivery Fee</span>
                                        <div className="text-right">
                                            {isFastDeliveryZone ? (
                                                <span className="text-primary font-bold">₹25 (Instant)</span>
                                            ) : (
                                                <span>₹15</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">GST</span>
                                        <span className="font-medium text-green-600">+₹{totalGst.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Handling Charge</span>
                                        <span>₹{handlingFee}</span>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-black">Grand Total</span>
                                    <span className="text-2xl font-black text-primary">₹{total.toFixed(2)}</span>
                                </div>
                                <Button
                                    className="w-full h-14 rounded-2xl text-lg font-black mt-4 shadow-primary"
                                    onClick={handlePlaceOrder}
                                    disabled={submitting}
                                >
                                    {submitting ? <Loader2 className="animate-spin mr-2" /> : "Place Order"}
                                </Button>
                                <p className="text-[10px] text-center text-muted-foreground px-4">
                                    By placing the order, you agree to Meato's Terms and Conditions.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Checkout;
