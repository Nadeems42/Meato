import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Search, Check } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { cn } from "@/lib/utils";

export function LocationModal({ children }: { children: React.ReactNode }) {
    const { pincode, address, setLocation, detectLocation, isLoading } = useLocation();
    const [open, setOpen] = useState(false);
    const [inputPin, setInputPin] = useState(pincode);
    const [tempAddress, setTempAddress] = useState(address);

    const handleSave = () => {
        if (inputPin.length === 6) {
            setLocation(inputPin, tempAddress === "Select Location" ? "Chennai, Tamil Nadu" : tempAddress);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Change Location</DialogTitle>
                    <DialogDescription>
                        Enter your pincode to see products available in your area.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <Button
                        variant="outline"
                        className="h-14 rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold flex items-center justify-start gap-3 px-4"
                        onClick={detectLocation}
                        disabled={isLoading}
                    >
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                            <Navigation className="h-4 w-4" />
                        </div>
                        {isLoading ? "Detecting..." : "Use Current Location"}
                    </Button>

                    <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Enter 6-digit Pincode"
                                value={inputPin}
                                onChange={(e) => setInputPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                className="pl-10 h-12 rounded-xl focus-visible:ring-primary"
                            />
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={inputPin.length !== 6}
                            className="h-12 rounded-xl px-6"
                        >
                            Apply
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Nearby Localities</h4>
                        <div className="grid gap-2">
                            {[
                                { name: "Anna Salai", pin: "600002" },
                                { name: "T. Nagar", pin: "600017" },
                                { name: "Adyar", pin: "600020" },
                                { name: "Mylapore", pin: "600004" }
                            ].map((loc) => (
                                <button
                                    key={loc.pin}
                                    onClick={() => {
                                        setInputPin(loc.pin);
                                        setTempAddress(`${loc.name}, Chennai`);
                                    }}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all text-left",
                                        inputPin === loc.pin && "border-primary bg-primary/5"
                                    )}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold">{loc.name}</span>
                                        <span className="text-xs text-muted-foreground">{loc.pin}</span>
                                    </div>
                                    {inputPin === loc.pin && <Check className="h-4 w-4 text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
