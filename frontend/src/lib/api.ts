import { Glasses } from "@/types/glasses";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getCSRFToken(): string | null {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const csrfToken = getCSRFToken();
    const headers: HeadersInit = {
        ...options.headers,
    };
    
    if (csrfToken) {
        (headers as Record<string, string>)['X-CSRFToken'] = csrfToken;
    }
    
    if (!(options.body instanceof FormData)) {
        (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }
    
    return fetch(url, {
        ...options,
        credentials: 'include',
        headers,
    });
}

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    is_admin: boolean;
}

export async function login(username: string, password: string): Promise<User> {
    const response = await fetchWithAuth(`${API_BASE_URL}/accounts/login/`, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error de autenticación' }));
        throw new Error(error.error || 'Error de autenticación');
    }

    return response.json();
}

export async function logout(): Promise<void> {
    await fetchWithAuth(`${API_BASE_URL}/accounts/logout/`, {
        method: 'POST',
    });
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/accounts/me/`, {
            method: 'GET',
        });

        if (!response.ok) {
            return null;
        }

        return response.json();
    } catch {
        return null;
    }
}

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

export async function createGlasses(data: FormData): Promise<Glasses> {
    const response = await fetchWithAuth(`${API_BASE_URL}/products/admin/`, {
        method: 'POST',
        body: data,
    });

    if (!response.ok) {
        throw new Error("Failed to create glasses");
    }

    return response.json();
}

export async function updateGlasses(id: number, data: FormData): Promise<Glasses> {
    const response = await fetchWithAuth(`${API_BASE_URL}/products/admin/${id}/`, {
        method: 'PATCH',
        body: data,
    });

    if (!response.ok) {
        throw new Error("Failed to update glasses");
    }

    return response.json();
}

export async function deleteGlasses(id: number): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/products/admin/${id}/`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error("Failed to delete glasses");
    }
}
