import { z } from 'zod';

// UPI ID validation regex
const UPI_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;

// Validation schemas
export const upiValidationSchema = z.object({
  upiId: z.string()
    .min(3, 'UPI ID is too short')
    .max(50, 'UPI ID is too long')
    .regex(UPI_REGEX, 'Invalid UPI ID format. Example: username@upi'),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(100000, 'Maximum transaction limit is ₹1,00,000'),
  note: z.string().max(50, 'Note cannot exceed 50 characters').optional(),
});

export const sendMoneySchema = z.object({
  upiId: z.string()
    .min(3, 'UPI ID is too short')
    .regex(UPI_REGEX, 'Invalid UPI ID format'),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .min(1, 'Minimum amount is ₹1'),
    .max(100000, 'Maximum amount is ₹1,00,000'),
  note: z.string().max(50).optional(),
  bankAccountId: z.string().min(1, 'Please select a bank account'),
});

export const mobileNumberSchema = z.string()
  .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number');

export const otpSchema = z.string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// Mask account number
export const maskAccountNumber = (accountNumber: string): string => {
  const last4 = accountNumber.slice(-4);
  return 'XXXX' + last4;
};

// Parse UPI QR code
export const parseUpiQR = (qrString: string): { vpa: string; name?: string; amount?: number; note?: string } | null => {
  try {
    const url = new URL(qrString);
    if (url.protocol !== 'upi:') return null;
    
    const params = url.searchParams;
    return {
      vpa: params.get('pa') || '',
      name: params.get('pn') || undefined,
      amount: params.get('am') ? parseFloat(params.get('am')!) : undefined,
      note: params.get('tn') || undefined,
    };
  } catch {
    return null;
  }
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Generate transaction reference ID
export const generateReferenceId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXN${timestamp}${random}`;
};
