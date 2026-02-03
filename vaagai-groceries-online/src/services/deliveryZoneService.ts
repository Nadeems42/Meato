import api from "@/lib/axios";

export interface DeliveryZone {
    id?: number;
    name: string;
    pincode: string;
    radius_km?: number;
    active?: boolean;
    fast_delivery: boolean;
    is_approved?: boolean;
    franchise_id?: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface DeliveryZoneCheckResponse {
    available: boolean;
    fast_delivery: boolean;
    zone_name?: string;
    message: string;
}

// Get all active delivery zones (public)
export const getDeliveryZones = async (): Promise<DeliveryZone[]> => {
    const response = await api.get('/delivery-zones');
    return response.data;
};

// Check if a pincode is in a delivery zone
export const checkDeliveryZone = async (pincode: string): Promise<DeliveryZoneCheckResponse> => {
    const response = await api.post('/check-delivery-zone', { pincode });
    return response.data;
};

// Admin: Get all delivery zones
export const getAdminDeliveryZones = async (): Promise<DeliveryZone[]> => {
    const response = await api.get('/admin/delivery-zones');
    return response.data;
};

// Shop Admin: Get my zones
export const getShopZones = async (): Promise<DeliveryZone[]> => {
    const response = await api.get('/admin/my-delivery-zones');
    return response.data;
};

// Admin: Create a new delivery zone
export const createDeliveryZone = async (data: Omit<DeliveryZone, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryZone> => {
    const response = await api.post('/admin/delivery-zones', data);
    return response.data;
};

// Admin: Update a delivery zone
export const updateDeliveryZone = async (id: number, data: Partial<DeliveryZone>): Promise<DeliveryZone> => {
    const response = await api.put(`/admin/delivery-zones/${id}`, data);
    return response.data;
};

// Admin: Delete a delivery zone
export const deleteDeliveryZone = async (id: number): Promise<void> => {
    await api.delete(`/admin/delivery-zones/${id}`);
};

// Admin: Approve a delivery zone
export const approveDeliveryZone = async (id: number): Promise<any> => {
    const response = await api.put(`/admin/delivery-zones/${id}/approve`);
    return response.data;
};
