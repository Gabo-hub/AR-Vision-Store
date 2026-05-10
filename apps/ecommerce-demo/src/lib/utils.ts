import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getProxyMediaUrl(url: string): string {
    if (!url) return '';
    if (url.includes(':8000/media/')) {
        return url.replace(/http:\/\/[^/]+:8000\/media\//, '/django-media/');
    }
    return url;
}
