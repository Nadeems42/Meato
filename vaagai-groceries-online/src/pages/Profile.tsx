import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, Package, LogOut, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { updateProfile } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Pencil } from "lucide-react";

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout, login: authLogin } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: user?.name || "", email: user?.email || "" });
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const res = await updateProfile(editData);
            authLogin(localStorage.getItem('token') || "", res.user);
            toast({ title: "Success", description: "Profile updated successfully" });
            setIsEditing(false);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to update profile",
                variant: "destructive"
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user) {
        return <div className="p-8 text-center">Please login to view profile. <Link to="/login">Login</Link></div>;
    }

    const menuItems = [
        { icon: Package, label: "My Orders", href: "/orders" },
        { icon: ShoppingBag, label: "Buy Again", href: "/orders" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 container py-8 pb-24 max-w-4xl mx-auto">
                <div className="space-y-6">
                    {/* User Profile Header */}
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-white p-6 rounded-3xl shadow-sm">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-sm">
                            <UserIcon className="h-10 w-10 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-gray-900">{user.name}</h1>
                            <p className="text-gray-500">{user.email}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {user.phone && <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-medium">{user.phone}</span>}
                                <span className="text-xs bg-green-100 px-3 py-1 rounded-full text-green-700 font-bold flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" /> Wallet: ₹{user.wallet_balance || "0.00"}
                                </span>
                            </div>
                        </div>

                        <Dialog open={isEditing} onOpenChange={setIsEditing}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="rounded-xl border-primary text-primary font-bold">
                                    <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-3xl">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black">Edit Profile</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpdate} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-name">Full Name</Label>
                                        <Input
                                            id="edit-name"
                                            value={editData.name}
                                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-email">Email Address</Label>
                                        <Input
                                            id="edit-email"
                                            type="email"
                                            value={editData.email}
                                            onChange={e => setEditData({ ...editData, email: e.target.value })}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                    <DialogFooter className="pt-4">
                                        <Button type="submit" size="xl" className="w-full rounded-2xl font-black" disabled={isUpdating}>
                                            {isUpdating ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Menu Items */}
                        <Card className="rounded-3xl border-none shadow-sm overflow-hidden h-fit text-foreground bg-card">
                            <CardHeader>
                                <CardTitle className="text-lg">Account</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 pt-0">
                                {menuItems.map((item, idx) => (
                                    <Link
                                        key={idx}
                                        to={item.href}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group rounded-2xl"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <span className="flex-1 font-bold text-gray-700">{item.label}</span>
                                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                                    </Link>
                                ))}
                                <button
                                    className="w-full flex items-center gap-4 p-4 hover:bg-red-50 transition-colors group rounded-2xl text-left"
                                    onClick={handleLogout}
                                >
                                    <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                                        <LogOut className="h-5 w-5" />
                                    </div>
                                    <span className="flex-1 font-bold text-red-600">Log Out</span>
                                </button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default Profile;
