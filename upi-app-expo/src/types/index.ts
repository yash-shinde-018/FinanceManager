export interface User {
  id: string;
  mobileNumber: string;
  email?: string;
  name?: string;
  profileImage?: string;
  isVerified: boolean;
  kycStatus: 'pending' | 'in_progress' | 'verified' | 'rejected';
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface BankAccount {
  id: string;
  userId: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  accountHolderName: string;
  upiId: string;
  vpa: string;
  isDefault: boolean;
  isVerified: boolean;
  dailyLimit: number;
  perTransactionLimit: number;
  currentDaySpent: number;
  status: 'active' | 'inactive' | 'blocked' | 'suspended';
  mpinSet: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'sent' | 'received';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  fromUpiId: string;
  toUpiId: string;
  fromName: string;
  toName: string;
  description?: string;
  date: string;
  category: string;
  referenceId: string;
  bankAccountId?: string;
}

export interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

export interface PaymentData {
  upiId: string;
  amount: number;
  note?: string;
  bankAccountId: string;
}

export interface QRData {
  vpa: string;
  pn?: string;
  am?: string;
  tn?: string;
  tr?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
