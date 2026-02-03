import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, KeyRound, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { sendOtp, verifyOtp } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { login as staffLoginApi } from "@/services/authService";

const Auth = ({ mode, adminAccess = false, role }: { mode: "login" | "register", adminAccess?: boolean, role?: string }) => {
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [step, setStep] = useState<'phone' | 'otp' | 'credentials'>(
        (adminAccess || role === 'delivery_person') ? 'credentials' : 'phone'
    );
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (phone.length < 10) {
            toast({ title: "Invalid Phone", description: "Please enter a valid phone number", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            await sendOtp(phone);
            toast({ title: "OTP Sent", description: "Please check your WhatsApp for the code." });
            setStep('otp');
        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.response?.data?.error || "Failed to send OTP", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await staffLoginApi(email, password);
            authLogin(data.token, data.user);
            toast({ title: "Success", description: "Logged in successfully" });

            // Re-use the existing navigation logic
            handleNavigation(data.user);
        } catch (error: any) {
            console.error(error);
            toast({ title: "Login Failed", description: error.response?.data?.error || "Invalid credentials", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigation = (user: any) => {
        if (role === 'delivery_person') {
            if (user.role === 'delivery_person' || user.role === 'super_admin') {
                navigate("/delivery");
            } else {
                toast({ title: "Access Denied", description: "You are not a delivery partner.", variant: "destructive" });
            }
        } else if (adminAccess) {
            if (['admin', 'super_admin', 'shop_admin'].includes(user.role)) {
                if (user.role === 'shop_admin') navigate("/shop/dashboard");
                else navigate("/admin");
            } else {
                toast({ title: "Access Denied", description: "You are not an admin.", variant: "destructive" });
            }
        } else {
            if (user.role === 'shop_admin') navigate("/shop/dashboard");
            else if (['admin', 'super_admin'].includes(user.role)) navigate("/admin");
            else navigate("/");
        }
    };

    const handleVerifyOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (otp.length !== 4) {
            toast({ title: "Invalid OTP", description: "Please enter the 4-digit code", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const data = await verifyOtp(phone, otp);
            authLogin(data.token, data.user);
            toast({ title: "Success", description: "Logged in successfully" });

            // Navigation Logic based on Role
            handleNavigation(data.user);

        } catch (error: any) {
            console.error(error);
            toast({ title: "Verification Failed", description: error.response?.data?.error || "Invalid OTP", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
            <Link
                to="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Home
            </Link>

            <div className="w-full max-w-md bg-card rounded-3xl shadow-soft p-8 md:p-10">
                <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden mx-auto mb-4 border-2 border-primary/10 shadow-sm bg-white p-2">
                        <img src="/logo.jpg" alt="Meato Logo" className="h-full w-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold font-display text-foreground">
                        {step === 'phone' ? "Welcome" : step === 'credentials' ? "Sign In" : "Verify OTP"}
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-[280px] mx-auto text-sm">
                        {role === 'delivery_person'
                            ? "Delivery Partner Login"
                            : (adminAccess ? "Admin Portal" : "Enter your details below")
                        }
                    </p>
                </div>

                {/* Offer Banner for Register mock (optional visual) */}
                {mode === "register" && step === 'phone' && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-700">
                        <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-black text-amber-800 uppercase tracking-wider leading-none mb-1">New User?</p>
                            <p className="text-[12px] font-bold text-amber-700 leading-tight">Enter your phone to get started instantly!</p>
                        </div>
                    </div>
                )}

                {step === 'credentials' ? (
                    <form onSubmit={handleCredentialsLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="h-11 rounded-xl"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="h-11 rounded-xl"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20"
                            disabled={isLoading}
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>

                        <div className="text-center mt-4">
                            <button type="button" onClick={() => setStep('phone')} className="text-sm text-primary hover:underline">
                                Use OTP Login
                            </button>
                        </div>
                    </form>
                ) : step === 'phone' ? (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="phone">WhatsApp Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter WhatsApp Number"
                                    className="pl-10 h-11 rounded-xl"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl text-lg font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending OTP..." : "Send OTP"}
                        </Button>

                        {(adminAccess || role === 'delivery_person') && (
                            <div className="text-center mt-4">
                                <button type="button" onClick={() => setStep('credentials')} className="text-sm text-primary hover:underline">
                                    Use Password Login
                                </button>
                            </div>
                        )}
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div className="space-y-2 flex flex-col items-center">
                            <Label htmlFor="otp" className="mb-2">Enter 4-digit Code</Label>
                            <div className="flex justify-center">
                                <Input
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="0000"
                                    className="h-12 w-40 text-center text-2xl tracking-widest rounded-xl font-mono"
                                    maxLength={4}
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Sent to {phone}. <button type="button" onClick={() => setStep('phone')} className="text-primary underline">Change?</button>
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl text-lg font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "Verifying..." : "Verify & Login"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Auth;
