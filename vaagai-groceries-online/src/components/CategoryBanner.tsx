interface CategoryBannerProps {
    image: string;
    title?: string;
}

export function CategoryBanner({ image, title }: CategoryBannerProps) {
    return (
        <div className="px-4 py-2">
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-sm">
                <img
                    src={image}
                    alt={title || "Category Banner"}
                    className="w-full h-full object-cover"
                />
                {title && (
                    <div className="absolute inset-0 bg-black/20 flex items-center px-8">
                        <h2 className="text-white text-2xl md:text-3xl font-black">{title}</h2>
                    </div>
                )}
            </div>
        </div>
    );
}
