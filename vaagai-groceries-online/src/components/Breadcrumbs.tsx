import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbsProps {
    items: {
        label: string;
        path?: string;
    }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex items-center gap-2 py-4 px-4 overflow-x-auto no-scrollbar whitespace-nowrap bg-white">
            <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                <Home className="h-4 w-4" />
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                    {item.path ? (
                        <Link
                            to={item.path}
                            className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-sm font-bold text-gray-900">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
