import { Glasses } from "@/types/glasses";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.20:8000/api";

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    return response;
};

export async function getProducts(): Promise<Glasses[]> {
    const response = await fetch(`${API_BASE_URL}/products/`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return response.json();
}

export async function getProduct(id: string | number): Promise<Glasses> {
    const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch product with id ${id}`);
    }

    return response.json();
}

export function getProxyMediaUrl(url: string) {
    if (!url) return url;
    if (url.includes(':8000/media/')) {
        return url.replace(/http:\/\/[^\/]+:8000\/media\//, '/django-media/');
    }
    return url;
}
