import api from '@/lib/axios';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    wallet_balance?: string;
    createdAt?: string;
    created_at?: string; // Fallback
    shop_id?: number | null;
    franchise_id?: number | null;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export const register = async (data: any) => {
    const response = await api.post<AuthResponse>('/register', data);
    return response.data;
};

export const login = async (email: string, password?: string) => {
    const data = typeof email === 'object' ? email : { email, password };
    const response = await api.post<AuthResponse>('/login', data);
    return response.data;
};

export const sendOtp = async (phone: string) => {
    const response = await api.post<{ success: boolean, message: string }>('/send-otp', { phone });
    return response.data;
};

export const verifyOtp = async (phone: string, otp: string) => {
    const response = await api.post<AuthResponse>('/verify-otp', { phone, otp });
    return response.data;
};

export const logout = async () => {
    await api.post('/logout');
};

export const getUser = async () => {
    const response = await api.get<User>('/user');
    return response.data;
};

export const updateProfile = async (data: { name: string, email: string }) => {
    const response = await api.put<{ success: boolean, user: User, message: string }>('/user/profile', data);
    return response.data;
};



export const createShopAdmin = async (data: any) => {
    const response = await api.post('/admin/create-shop-admin', data);
    return response.data;
};

export const getAdmins = async () => {
    const response = await api.get<{ success: boolean, admins: User[] }>('/admin/admins');
    return response.data;
};

export const deleteAdmin = async (id: number) => {
    const response = await api.delete(`/admin/admins/${id}`);
    return response.data;
};

export const createDeliveryPartner = async (data: any) => {
    const response = await api.post('/admin/create-delivery-partner', data);
    return response.data;
};

export const getDeliveryPersons = async () => {
    const response = await api.get<{ success: boolean, delivery_persons: User[] }>('/admin/delivery-persons');
    return response.data;
};

export const getShopDeliveryPersonnel = async () => {
    const response = await api.get<{ success: boolean, delivery_persons: User[] }>('/admin/shop-delivery-persons');
    return response.data;
};

export const getCustomers = async () => {
    const response = await api.get<{ success: boolean, customers: User[] }>('/admin/customers');
    return response.data;
};
