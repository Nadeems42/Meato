import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Package, Truck, CheckCircle, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveryLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const DeliveryLayout: React.FC<DeliveryLayoutProps> = ({ children, activeTab, onTabChange }) => {
    const tabs = [
        { id: "new", label: "New Orders", icon: Bell },
        { id: "progress", label: "In Progress", icon: Truck },
        { id: "completed", label: "Completed", icon: CheckCircle },
        { id: "profile", label: "Profile", icon: User },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b px-4 py-3 sticky top-0 z-10 flex justify-between items-center">
                <h1 className="text-xl font-bold text-primary">Meato Rider</h1>
                <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Online</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>

            {/* Sticky Bottom Action Bar (Navigation) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 flex justify-around items-center z-50 transition-all duration-300">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex flex-col items-center justify-center py-2 px-1 min-w-[70px] transition-all duration-200",
                                isActive ? "text-primary scale-110" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <div className={cn(
                                "relative p-1 rounded-xl transition-all duration-200",
                                isActive && "bg-primary/10"
                            )}>
                                <Icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                                {tab.id === 'new' && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                        3
                                    </span>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] mt-1 font-medium transition-all duration-200",
                                isActive ? "opacity-100" : "opacity-80"
                            )}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};
