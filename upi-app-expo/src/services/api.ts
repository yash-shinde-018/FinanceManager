import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { token } = response.data;
          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Clear tokens and redirect to login
        await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.REFRESH_TOKEN]);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (mobileNumber: string, otp: string) =>
    apiClient.post('/auth/login', { mobileNumber, otp }),
  
  register: (mobileNumber: string, name: string) =>
    apiClient.post('/auth/register', { mobileNumber, name }),
  
  sendOTP: (mobileNumber: string) =>
    apiClient.post('/auth/send-otp', { mobileNumber }),
  
  verifyToken: () =>
    apiClient.get('/auth/verify'),
  
  logout: () =>
    apiClient.post('/auth/logout'),
};

// Payment APIs
export const paymentAPI = {
  sendMoney: (data: { upiId: string; amount: number; note?: string; bankAccountId: string }) =>
    apiClient.post('/payments/send', data),
  
  validateUpi: (upiId: string) =>
    apiClient.get(`/payments/validate-upi/${upiId}`),
  
  getPaymentStatus: (transactionId: string) =>
    apiClient.get(`/payments/status/${transactionId}`),
};

// Transaction APIs
export const transactionAPI = {
  getTransactions: (page: number = 1, limit: number = 20, type?: 'sent' | 'received') =>
    apiClient.get('/transactions', { params: { page, limit, type } }),
  
  getTransactionById: (id: string) =>
    apiClient.get(`/transactions/${id}`),
};

// Bank Account APIs
export const bankAPI = {
  getAccounts: () =>
    apiClient.get('/bank-accounts'),
  
  addAccount: (data: { accountNumber: string; ifscCode: string; bankName: string; upiId: string }) =>
    apiClient.post('/bank-accounts', data),
  
  setDefault: (accountId: string) =>
    apiClient.patch(`/bank-accounts/${accountId}/set-default`),
  
  setMPIN: (accountId: string, mpin: string) =>
    apiClient.post(`/bank-accounts/${accountId}/set-mpin`, { mpin }),
};

export default apiClient;
