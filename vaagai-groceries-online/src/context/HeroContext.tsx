import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingService, HeroData } from '@/services/settingService';

interface HeroContextType {
    heroData: HeroData;
    updateHeroData: (data: Partial<HeroData>, formData?: FormData) => Promise<void>;
    isLoading: boolean;
}

const defaultHeroData: HeroData = {
    title: "Premium Meat & Organic Eggs",
    subtitle: "Fresh from the farm to your doorstep in 15 minutes. Quality you can trust.",
    badge: "10-MIN EXPRESS DELIVERY",
    buttonText: "Shop Meat",
    secondaryButtonText: "View Eggs",
    imageUrl: "/products/chicken_whole.png",
    backgroundImageUrl: "/hero-meat-background.jpg"
};

const HeroContext = createContext<HeroContextType | undefined>(undefined);

export const HeroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [heroData, setHeroData] = useState<HeroData>(defaultHeroData);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHeroData = async () => {
            try {
                const data = await settingService.getHero();
                setHeroData(data);
            } catch (error) {
                console.error("Failed to fetch hero data:", error);
                // Fallback to local storage if API fails, or keep default
                const saved = localStorage.getItem('hero_data');
                if (saved) setHeroData(JSON.parse(saved));
            } finally {
                setIsLoading(false);
            }
        };

        fetchHeroData();
    }, []);

    const updateHeroData = async (newData: Partial<HeroData>, formData?: FormData) => {
        try {
            if (formData) {
                const response = await settingService.updateHero(formData);
                setHeroData(response.data);
            } else {
                // If only text fields updated, we still need to send to backend or just update local
                // For completeness, let's assume updateHero can handle parts
                const fullData = { ...heroData, ...newData };
                const fd = new FormData();
                Object.entries(fullData).forEach(([key, value]) => {
                    fd.append(key, value as string);
                });
                const response = await settingService.updateHero(fd);
                setHeroData(response.data);
            }
            localStorage.setItem('hero_data', JSON.stringify(heroData));
        } catch (error) {
            console.error("Failed to update hero data:", error);
            // Optimistic update locally
            setHeroData(prev => ({ ...prev, ...newData }));
        }
    };

    return (
        <HeroContext.Provider value={{ heroData, updateHeroData, isLoading }}>
            {children}
        </HeroContext.Provider>
    );
};

export const useHero = () => {
    const context = useContext(HeroContext);
    if (context === undefined) {
        throw new Error('useHero must be used within a HeroProvider');
    }
    return context;
};
