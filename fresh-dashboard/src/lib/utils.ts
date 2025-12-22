import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyMUR(amount: number): string {
  return `Rs ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// VAT calculation functions
export const DEFAULT_VAT_RATE = 15; // 15% VAT rate for Mauritius

export function calculateVAT(amount: number, vatRate: number = DEFAULT_VAT_RATE): number {
  return (amount * vatRate) / 100;
}

export function calculateTotalWithVAT(amount: number, vatRate: number = DEFAULT_VAT_RATE): number {
  const vatAmount = calculateVAT(amount, vatRate);
  return amount + vatAmount;
}

export function formatVATRate(vatRate: number): string {
  return `${vatRate}%`;
}

export function parseVATRate(vatRateString: string): number {
  return parseFloat(vatRateString.replace('%', '')) || DEFAULT_VAT_RATE;
}

// Financial calculations
export function calculateNetAmount(totalAmount: number, vatRate: number = DEFAULT_VAT_RATE): number {
  return totalAmount / (1 + vatRate / 100);
}

export function calculateVATFromTotal(totalAmount: number, vatRate: number = DEFAULT_VAT_RATE): number {
  const netAmount = calculateNetAmount(totalAmount, vatRate);
  return totalAmount - netAmount;
}