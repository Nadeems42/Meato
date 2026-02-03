import { useState, useEffect } from "react";
import RegistrationModal from "@/components/RegistrationModal";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const RegisterLanding = () => {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();

    // If modal is closed, redirect to login or home? 
    // Usually if they cancel registration, maybe go back to login.
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center p-4">
                {/* Background content or marketing text could go here */}
                <div className="text-center space-y-4 max-w-lg">
                    <h1 className="text-4xl font-black text-primary">Join Meato</h1>
                    <p className="text-muted-foreground">Select your registration type to get started.</p>
                </div>
            </div>
            <RegistrationModal open={open} onOpenChange={handleOpenChange} />
            <Footer />
        </div>
    );
};

export default RegisterLanding;
