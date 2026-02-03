import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepTrackerProps {
    currentStatus: string;
    reachedConfirmed?: boolean;
    cashCollected?: boolean;
}

export const StepTracker: React.FC<StepTrackerProps> = ({ currentStatus, reachedConfirmed, cashCollected }) => {
    // Steps for the tracker
    const steps = [
        { id: "assigned", label: "Assigned" },
        { id: "out_for_delivery", label: "Out for Delivery" },
        { id: "reached", label: "Reached" },
        { id: "cash_collected", label: "Cash Collected" },
        { id: "delivered", label: "Delivered" },
    ];

    // Map backend status to step index
    const getStepIndex = (status: string) => {
        if (status === 'assigned' || status === 'processing' || status === 'accepted' || status === 'pending') return 0;

        if (status === 'out_for_delivery') {
            if (cashCollected) return 3;
            if (reachedConfirmed) return 2;
            return 1;
        }

        if (status === 'delivered') return 4;

        return 0;
    };

    const currentIndex = getStepIndex(currentStatus);

    return (
        <div className="w-full py-8 px-4">
            <div className="relative flex justify-between items-center w-full">
                {/* Background Connecting Line */}
                <div className="absolute top-[10px] left-0 right-0 h-[2px] bg-gray-100 z-0" />

                {/* Active Connecting Line */}
                <div
                    className="absolute top-[10px] left-0 h-[2px] bg-primary z-0 transition-all duration-700 ease-in-out"
                    style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isFuture = index > currentIndex;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                            {/* Step Indicator Dot */}
                            <div className={cn(
                                "h-[20px] w-[20px] rounded-full flex items-center justify-center transition-all duration-500 ring-[6px] ring-white shadow-sm",
                                isCompleted ? "bg-primary" : isCurrent ? "bg-primary" : "bg-white border-2 border-gray-200"
                            )}>
                                {isCompleted ? (
                                    <Check className="h-3 w-3 text-white stroke-[3px]" />
                                ) : isCurrent ? (
                                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                ) : null}
                            </div>

                            {/* Step Label */}
                            <span className={cn(
                                "text-[9px] font-black uppercase text-center absolute -bottom-1 w-16 tracking-tighter transition-all duration-300",
                                isCurrent ? "text-primary opacity-100" : isCompleted ? "text-gray-800 opacity-80" : "text-gray-300"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
