import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Lock, User as UserIcon, Phone, Share2, HelpCircle, Sparkles, Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { register, upgradeToPremium } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { settingService } from "@/services/settingService";
import { CreditCard, CheckCircle2 } from "lucide-react";

const PremiumRegistration = () => {
    const navigate = useNavigate();
    const { user, login: authLogin } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<"info" | "payment">("info");
    const [premiumFee, setPremiumFee] = useState("...");

    // Registration Fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    // Common Fields
    const [referralCode, setReferralCode] = useState("");
    const [source, setSource] = useState("");
    const [otherSource, setOtherSource] = useState("");

    useEffect(() => {
        if (user && user.is_premium) {
            navigate("/profile");
        }
        // Fetch fee
        settingService.getSettings().then(settings => {
            setPremiumFee(settings.premium_membership_fee || "99");
        }).catch(console.error);
    }, [user, navigate]);

    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            if (password !== passwordConfirmation) {
                toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
                return;
            }
        }

        setStep("payment");
    };

    const handlePayment = async () => {
        setIsLoading(true);

        try {
            const finalSource = source === "Others" ? otherSource : source;

            // Mocking payment gateway redirect
            toast({ title: "Redirecting...", description: "Connecting to secure payment gateway..." });
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (!user) {
                // New User Registration
                const payload = {
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                    phone,
                    referral_code: referralCode,
                    source: finalSource
                };

                const data = await register(payload);
                localStorage.setItem('auth_token', data.token);
                const upgradeData = await upgradeToPremium({ source: finalSource, referral_code: referralCode });

                authLogin(data.token, upgradeData.user);
                toast({ title: "Payment Successful!", description: "Account created and upgraded!" });
            } else {
                // Existing User Upgrade
                const data = await upgradeToPremium({ source: finalSource, referral_code: referralCode });

                if (data.success) {
                    const token = localStorage.getItem('auth_token');
                    if (token) authLogin(token, data.user);
                    toast({ title: "Payment Successful!", description: "You are now a Premium Member!" });
                }
            }
            navigate("/profile");
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "Process failed";
            toast({ title: "Error", description: msg, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative pt-20">
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold z-10"
            >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back to Home</span>
            </Link>

            <div className="w-full max-w-lg bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 md:p-12 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg shadow-orange-200 animate-in zoom-in duration-500">
                        <Crown className="h-8 w-8 md:h-10 md:w-10 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight px-2">
                        {user ? "Upgrade Your Membership" : "Premium Member Registration"}
                    </h1>
                    <p className="text-slate-500 mt-3 max-w-[320px] mx-auto text-xs md:text-sm font-medium leading-relaxed px-4">
                        Join our exclusive circle for member-only pricing, free delivery, and premium rewards.
                    </p>
                </div>

                {step === "info" ? (
                    <form onSubmit={handleInfoSubmit} className="space-y-6">
                        {!user && (
                            <div className="grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="pl-11 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-amber-500/20"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="9876543210"
                                            className="pl-11 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-amber-500/20"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="pl-11 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-amber-500/20"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="pl-11 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-amber-500/20"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="confirm"
                                            type="password"
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            placeholder="••••••••"
                                            className="pl-11 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-amber-500/20"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="referralCode" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Referral Code (Optional)</Label>
                                <div className="relative group">
                                    <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                    <Input
                                        id="referralCode"
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value)}
                                        placeholder="REF-123456"
                                        className="pl-11 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-amber-500/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="source" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">How did you hear about us?</Label>
                                <div className="relative group">
                                    <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                    <select
                                        id="source"
                                        value={source}
                                        onChange={(e) => setSource(e.target.value)}
                                        className="flex h-12 w-full rounded-2xl bg-slate-50 border-none pl-11 pr-4 py-2 text-sm focus:ring-2 focus:ring-amber-500/20 outline-none appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="" disabled>Select an option</option>
                                        <option value="Instagram">📸 Instagram</option>
                                        <option value="WhatsApp">💬 WhatsApp</option>
                                        <option value="Telegram">✈️ Telegram</option>
                                        <option value="Others">🧩 Others</option>
                                    </select>
                                </div>
                            </div>

                            {source === "Others" && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <Label htmlFor="otherSource" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Please Specify</Label>
                                    <Input
                                        id="otherSource"
                                        value={otherSource}
                                        onChange={(e) => setOtherSource(e.target.value)}
                                        placeholder="Friend, Flyer, etc."
                                        className="h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-amber-500/20"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 rounded-2xl text-lg font-black bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-200 mt-4 border-none"
                        >
                            Continue to Payment
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-8 animate-in zoom-in duration-500">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center">
                            <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                                <CreditCard className="h-8 w-8 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">Payment Summary</h3>
                            <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-bold">Premium Gold Membership</p>

                            <div className="w-full h-px bg-slate-200 my-6" />

                            <div className="w-full flex justify-between items-center text-sm mb-2">
                                <span className="text-slate-500 font-bold">Subscription Fee</span>
                                <span className="text-slate-900 font-black">₹{premiumFee}</span>
                            </div>
                            <div className="w-full flex justify-between items-center text-sm mb-4">
                                <span className="text-slate-500 font-bold">GST (Included)</span>
                                <span className="text-slate-900 font-black">₹0</span>
                            </div>

                            <div className="w-full bg-amber-500/10 p-4 rounded-xl flex justify-between items-center">
                                <span className="text-amber-700 font-black text-lg">Total Payable</span>
                                <span className="text-amber-700 font-black text-2xl">₹{premiumFee}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={handlePayment}
                                disabled={isLoading}
                                className="w-full h-14 rounded-2xl text-lg font-black bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-200 border-none"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Redirecting...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5" />
                                        Pay ₹{premiumFee} & Activate
                                    </div>
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setStep("info")}
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl text-slate-400 font-bold hover:bg-slate-50"
                            >
                                Go Back
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-6 opacity-30">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" className="h-6" alt="Mastercard" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" className="h-4" alt="Visa" />
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-4">
                        Instant Activation • Cancel Anytime
                    </p>
                    {!user && (
                        <p className="text-sm text-slate-500 font-medium">
                            Already have an account?{" "}
                            <Link to="/login" className="text-amber-600 font-bold hover:underline">Log In</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PremiumRegistration;
