import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BankAccount } from '../../types';

interface BankAccountState {
  accounts: BankAccount[];
  selectedAccount: BankAccount | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BankAccountState = {
  accounts: [],
  selectedAccount: null,
  isLoading: false,
  error: null,
};

export const fetchBankAccounts = createAsyncThunk(
  'bankAccounts/fetch',
  async () => {
    const response = await fetch('/api/bank-accounts');
    if (!response.ok) throw new Error('Failed to fetch bank accounts');
    return response.json();
  }
);

const bankAccountSlice = createSlice({
  name: 'bankAccounts',
  initialState,
  reducers: {
    selectAccount: (state, action) => {
      state.selectedAccount = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBankAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBankAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload.data;
        state.selectedAccount = action.payload.data.find((acc: BankAccount) => acc.isDefault) || action.payload.data[0];
      })
      .addCase(fetchBankAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch bank accounts';
      });
  },
});

export const { selectAccount, clearError } = bankAccountSlice.actions;
export default bankAccountSlice.reducer;
