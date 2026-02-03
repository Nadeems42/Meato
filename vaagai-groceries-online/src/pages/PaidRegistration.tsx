import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { register } from "@/services/authService";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const PaidRegistration = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const source = searchParams.get("source");
    const referralCode = searchParams.get("ref");
    const regType = searchParams.get("type");

    useEffect(() => {
        if (!source || regType !== "paid") {
            navigate("/");
        }
    }, [source, regType, navigate]);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        amount: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
            return;
        }
        if (!formData.amount) {
            toast({ title: "Error", description: "Please select a registration amount", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                source: source || "Direct",
                referral_code: referralCode || undefined,
                registration_type: 'paid',
                registration_amount: parseFloat(formData.amount)
            });

            toast({ title: "Success", description: "Paid Registration successful! Proceeding to Payment." });
            // In a real app, integrate payment gateway here.
            // For now, redirect to login or dashboard
            navigate("/login");
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.response?.data?.error || "An error occurred",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md mx-auto shadow-lg border-none">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center text-primary">Paid Registration</CardTitle>
                        <CardDescription className="text-center">
                            Become a Premium Member
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" placeholder="John Doe" required value={formData.name} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" placeholder="9876543210" required value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Login ID (Email)</Label>
                                <Input id="email" type="email" placeholder="john@example.com" required value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" required value={formData.password} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} />
                            </div>

                            {/* Registration Amount Input */}
                            <div className="space-y-2">
                                <Label htmlFor="amount">Registration Amount (₹)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Enter amount (e.g., 1000)"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    min="0"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Amount must be equal to or greater than your referrer’s registration amount.
                                </p>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Proceed to Payment & Register"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
};

export default PaidRegistration;
