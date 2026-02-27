import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TransactionState, Transaction } from '../../types';

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
  hasMore: true,
  page: 1,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetch',
  async ({ page, limit }: { page: number; limit: number }) => {
    const response = await fetch(`/api/transactions?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  }
);

export const sendMoney = createAsyncThunk(
  'transactions/send',
  async (data: { upiId: string; amount: number; note?: string }) => {
    const response = await fetch('/api/payments/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Payment failed');
    return response.json();
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetTransactions: (state) => {
      state.transactions = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = [...state.transactions, ...action.payload.data];
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page + 1;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(sendMoney.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMoney.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload.transaction);
      })
      .addCase(sendMoney.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Payment failed';
      });
  },
});

export const { clearError, resetTransactions } = transactionSlice.actions;
export default transactionSlice.reducer;
