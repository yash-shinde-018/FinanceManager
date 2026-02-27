import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import { AuthState, User } from '../../types';

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Login with email/password using Supabase Auth
export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    // Get user profile from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Create user object from Supabase auth + profile
    const user: User = {
      id: data.user.id,
      name: profileData?.name || data.user.email?.split('@')[0] || 'User',
      email: data.user.email || '',
      mobileNumber: profileData?.mobile || '',
      kycStatus: profileData?.kyc_status || 'pending',
      isVerified: true,
      role: profileData?.role || 'user',
      isActive: true,
      createdAt: data.user.created_at || new Date().toISOString(),
      updatedAt: data.user.updated_at || new Date().toISOString(),
    };

    return {
      user,
      token: data.session?.access_token || '',
      refreshToken: data.session?.refresh_token || '',
    };
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  }
);

// Check auth status
export const checkAuth = createAsyncThunk(
  'auth/check',
  async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    // Get user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const user: User = {
      id: session.user.id,
      name: profileData?.name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email || '',
      mobileNumber: profileData?.mobile || '',
      kycStatus: profileData?.kyc_status || 'pending',
      isVerified: true,
      role: profileData?.role || 'user',
      isActive: true,
      createdAt: session.user.created_at || new Date().toISOString(),
      updatedAt: session.user.updated_at || new Date().toISOString(),
    };

    return {
      user,
      token: session.access_token,
    };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login with Email
      .addCase(loginWithEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      // Check auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
