import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Converts lowercase province codes to uppercase format
 * @param provinceCode - The lowercase province code (e.g., "on", "bc")
 * @returns The uppercase province code (e.g., "ON", "BC")
 */
export function formatProvinceCode(provinceCode: string): string {
  return provinceCode.toUpperCase()
} 