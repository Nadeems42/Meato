import api from '@/lib/axios';

export interface HeroData {
    title: string;
    subtitle: string;
    badge: string;
    buttonText: string;
    secondaryButtonText: string;
    imageUrl: string;
    backgroundImageUrl: string;
}

export const settingService = {
    getHero: async (): Promise<HeroData> => {
        const response = await api.get<HeroData>('/hero');
        return response.data;
    },

    updateHero: async (formData: FormData): Promise<{ message: string; data: HeroData }> => {
        const response = await api.post<{ message: string; data: HeroData }>('/hero', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    getSettings: async (): Promise<Record<string, string>> => {
        const response = await api.get<Record<string, string>>('/settings');
        return response.data;
    },

    updateGeneralSettings: async (settings: Record<string, string>): Promise<{ success: boolean; message: string }> => {
        const response = await api.post<{ success: boolean; message: string }>('/settings', { settings });
        return response.data;
    }
};
