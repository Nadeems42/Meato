import api from '@/lib/axios';

export interface LocationCheckResponse {
    available: boolean;
    type?: 'fast' | 'standard';
    distance?: number;
    message?: string;
}

export const checkLocation = async (params: { lat?: number; lng?: number; pincode?: string }) => {
    const response = await api.post<LocationCheckResponse>('/check-location', params);
    return response.data;
};

export interface NearestShopResponse {
    found: boolean;
    shop?: {
        id: number;
        name: string;
        delivery_radius_km: number;
    };
    distance_km?: number;
    message?: string;
}

export const findNearestShop = async (lat: number, lng: number) => {
    const response = await api.get<NearestShopResponse>(`/shops/nearest?lat=${lat}&lng=${lng}`);
    return response.data;
};
