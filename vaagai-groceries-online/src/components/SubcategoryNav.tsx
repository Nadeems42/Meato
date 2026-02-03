import { cn } from "@/lib/utils";

interface Subcategory {
    id: string;
    name: string;
    image?: string;
}

interface SubcategoryNavProps {
    items: Subcategory[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export function SubcategoryNav({ items, selectedId, onSelect }: SubcategoryNavProps) {
    return (
        <div className="flex items-center gap-4 py-4 px-4 overflow-x-auto no-scrollbar bg-white sticky top-16 z-20 border-b border-gray-100">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={cn(
                        "flex flex-col items-center gap-2 flex-shrink-0 transition-all min-w-[70px]",
                        selectedId === item.id ? "scale-105" : "opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
                    )}
                >
                    <div className={cn(
                        "h-16 w-16 rounded-full overflow-hidden border-2 transition-all p-1 bg-gray-50",
                        selectedId === item.id ? "border-primary shadow-md bg-white" : "border-transparent"
                    )}>
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-400">
                                NO IMG
                            </div>
                        )}
                    </div>
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-tight text-center leading-tight whitespace-normal max-w-[80px]",
                        selectedId === item.id ? "text-primary" : "text-gray-600"
                    )}>
                        {item.name}
                    </span>
                </button>
            ))}
        </div>
    );
}
