import api from '@/lib/axios';

export interface Shop {
    id: number;
    name: string;
    address: string;
    lat: number;
    lng: number;
    delivery_radius_km: number;
    commission_percentage: number;
    base_delivery_fee: number;
    is_active: boolean;
    owner_id?: number;
    owner?: {
        id: number;
        name: string;
        email: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateShopData {
    name: string;
    address: string;
    lat: number;
    lng: number;
    delivery_radius_km: number;
    commission_percentage: number;
    base_delivery_fee: number;
    owner_id?: number | null;
}

export const getShops = async (): Promise<Shop[]> => {
    const response = await api.get('/shops');
    return response.data;
};

export const getShop = async (id: number): Promise<Shop> => {
    const response = await api.get(`/shops/${id}`);
    return response.data;
};

export const createShop = async (data: CreateShopData): Promise<Shop> => {
    const response = await api.post('/shops', data);
    return response.data;
};

export const updateShop = async (id: number, data: Partial<CreateShopData>): Promise<Shop> => {
    const response = await api.put(`/shops/${id}`, data);
    return response.data;
};

export const deleteShop = async (id: number): Promise<void> => {
    await api.delete(`/shops/${id}`);
};

// Inventory Types
export interface ShopProduct {
    id: number;
    franchise_id: number;
    product_id: number;
    is_enabled: boolean;
    price_override?: string | number | null;
    stock: number;
    Product?: {
        id: number;
        name: string;
        image: string;
        price: string; // Master Price
        mrp: string;
        category?: {
            name: string;
        }
    };
}

export const getShopInventory = async (shopId: number): Promise<ShopProduct[]> => {
    const response = await api.get(`/shops/${shopId}/inventory`);
    return response.data;
};

export const updateInventoryItem = async (shopId: number, productId: number, data: Partial<ShopProduct>): Promise<ShopProduct> => {
    const response = await api.put(`/shops/${shopId}/inventory/${productId}`, data);
    return response.data;
};
