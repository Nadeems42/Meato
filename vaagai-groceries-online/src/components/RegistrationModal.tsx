import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RegistrationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SOURCES = [
    "Telegram",
    "Facebook",
    "Instagram",
    "WhatsApp",
    "LinkedIn",
    "Existing Customer", // Triggers referral ID
    "Others"
];

const RegistrationModal = ({ open, onOpenChange }: RegistrationModalProps) => {
    const navigate = useNavigate();
    const [source, setSource] = useState("");
    const [referralId, setReferralId] = useState("");
    const [regType, setRegType] = useState<"standard" | "">("");

    const handleContinue = () => {
        if (!source || !regType) return;
        if (source === "Existing Customer" && !referralId) return;

        const params = new URLSearchParams();
        params.append("source", source);
        params.append("type", regType);
        if (referralId) params.append("ref", referralId);

        const targetPath = "/login"; // Simplified: just send to login/register
        const fullPath = `${targetPath}?${params.toString()}`;

        navigate("/login"); // For now, just send to login page or a simple register page if we had one
        onOpenChange(false);
        // Do not close modal here, navigation will unmount the page
    };

    const isReferralRequired = source === "Existing Customer";
    const isValid = source && regType && (!isReferralRequired || referralId.length > 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Join Meato</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">

                    {/* Source Selection */}
                    <div className="space-y-2">
                        <Label>From where did you come to know about us?</Label>
                        <Select onValueChange={setSource} value={source}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Source" />
                            </SelectTrigger>
                            <SelectContent>
                                {SOURCES.map((src) => (
                                    <SelectItem key={src} value={src}>{src}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Referral ID Field (Conditional) */}
                    {isReferralRequired && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label>Referral ID <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="Enter Referral ID"
                                value={referralId}
                                onChange={(e) => setReferralId(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the referral ID provided by your referrer.
                            </p>
                        </div>
                    )}

                    {/* Registration Type Simplified */}
                    <div className="space-y-3">
                        <Label>Choose registration type</Label>
                        <RadioGroup onValueChange={(val) => setRegType(val as "standard")} value={regType}>
                            <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition">
                                <RadioGroupItem value="standard" id="r-standard" />
                                <Label htmlFor="r-standard" className="flex-1 cursor-pointer">Standard Registration</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleContinue}
                        disabled={!isValid}
                    >
                        Continue
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RegistrationModal;
