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

/**
 * Formats a number as currency with exactly 2 decimal places and comma separators
 * @param value - The number to format
 * @returns Formatted currency string (e.g., "1,234.56")
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats a number as currency with dollar sign, 2 decimal places, and comma separators
 * @param value - The number to format
 * @returns Formatted currency string with dollar sign (e.g., "$1,234.56")
 */
export function formatCurrencyWithSymbol(value: number): string {
  return `$${formatCurrency(value)}`;
}

/**
 * Parses a currency string back to a number, handling commas and decimal places
 * @param value - The string to parse (e.g., "1,234.56" or "$1,234.56")
 * @returns The parsed number
 */
export function parseCurrency(value: string): number {
  // Remove dollar sign and commas, then parse
  const cleanValue = value.replace(/[$,]/g, '');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Rounds a number to exactly 2 decimal places
 * @param value - The number to round
 * @returns The rounded number
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
} 