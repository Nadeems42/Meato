import api from '@/lib/axios';

export interface Address {
    id: number;
    address_line: string;
    city: string;
    pincode: string;
    type: string;
    lat?: number;
    lng?: number;
}

export const getAddresses = async () => {
    const response = await api.get<Address[]>('/addresses');
    return response.data;
};

export const createAddress = async (data: any) => {
    const response = await api.post('/addresses', data);
    return response.data;
};

export const deleteAddress = async (id: number) => {
    await api.delete(`/addresses/${id}`);
};
