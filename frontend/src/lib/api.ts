import { Glasses } from "@/types/glasses";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.20:8000/api";

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
