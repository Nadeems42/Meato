import api from '@/lib/axios';

export interface OrderItem {
    product_id: number;
    quantity: number;
}

export interface CreateOrderPayload {
    items: OrderItem[];
    delivery_type: 'standard' | 'fast';
    delivery_address: {
        name: string;
        phone: string;
        address_line: string;
        city: string;
        pincode: string;
    };
    address_id?: number;
    shop_id?: number | null;
    franchise_id?: number | null;
}

export const createOrder = async (data: CreateOrderPayload) => {
    const response = await api.post('/orders', data);
    return response.data;
};

export const getAdminOrders = async () => {
    const response = await api.get('/admin/orders');
    return response.data;
};

export const updateOrderStatus = async (id: number, status: string) => {
    const response = await api.put(`/admin/orders/${id}`, { status });
    return response.data;
};

export const assignOrder = async (orderId: number, deliveryPersonId: number) => {
    const response = await api.put(`/admin/orders/${orderId}/assign`, { delivery_person_id: deliveryPersonId });
    return response.data;
};

export const getOrders = async () => {
    const response = await api.get('/orders');
    return response.data;
};
