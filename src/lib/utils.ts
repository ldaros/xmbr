import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function withBase(path: string) {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const p = path.replace(/^\//, "");
    return `${base}/${p}`;
}
