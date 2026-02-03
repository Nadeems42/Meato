import api from '@/lib/axios';

export interface ProductVariant {
    id: number;
    product_id: number;
    variant_name: string;
    price: number;
    discount_price: number;
    stock_qty: number;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    is_approved?: boolean;
    shop_id?: number | null;
    franchise_id?: number | null;
}

export interface Product {
    id: number;
    category_id: number;
    name: string;
    description: string;
    price: number;
    mrp: number;
    stock: number;
    image: string | null;
    category?: Category;
    variants?: ProductVariant[];
    gst_percentage?: number;
    is_approved?: boolean;
    shop_id?: number | null;
    franchise_id?: number | null;
}

export const getCategories = async () => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
};

export const createCategory = async (data: FormData) => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
};

export const updateCategory = async (id: number, data: FormData) => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id: number) => {
    await api.delete(`/categories/${id}`);
};

export const approveCategory = async (id: number) => {
    const response = await api.put(`/categories/${id}/approve`);
    return response.data;
};

export const getProducts = async (shopId?: number | null) => {
    const response = await api.get<Product[]>('/products', {
        params: { shop_id: shopId }
    });
    return response.data;
};

export const getProduct = async (id: number) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
};

export const createProduct = async (data: FormData) => {
    const response = await api.post<Product>('/products', data);
    return response.data;
};

export const updateProduct = async (id: number, data: FormData) => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id: number) => {
    await api.delete(`/products/${id}`);
};

export const approveProduct = async (id: number) => {
    const response = await api.put(`/products/${id}/approve`);
    return response.data;
};
