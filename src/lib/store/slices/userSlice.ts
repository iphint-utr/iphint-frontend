import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { DashboardState } from '../../../types/dashboard';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  credits: number;
  referralCode: string;
  referralCount: number;
}

interface AuthResponse {
  success: boolean;
  token: string;
  data: UserData;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface UserState extends DashboardState {
  // Auth
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;

  // User info
  id: string | null;
  name: string | null;
  email: string | null;
  role: string | null;

  // User dashboard fields
  credits: number;
  referralCode: string | null;
  referralCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const saveSession = (token: string, user: UserData): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const clearSession = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const loadSession = (): { token: string | null; user: UserData | null } => {
  try {
    return {
      token: localStorage.getItem('token') || null,
      user: JSON.parse(localStorage.getItem('user') || 'null'),
    };
  } catch {
    return { token: null, user: null };
  }
};

// ─── Initial State ────────────────────────────────────────────────────────────

const { token, user } = loadSession();

const initialState: UserState = {
  // ── Dashboard (untouched) ──────────────────────────────────────────────────
  stats: null,
  latestSearches: [],
  alerts: [],
  loading: false,
  error: null,

  // ── Auth ───────────────────────────────────────────────────────────────────
  token,
  isAuthenticated: !!token,
  authLoading: false,
  authError: null,

  // ── User info ──────────────────────────────────────────────────────────────
  id: user?.id || null,
  name: user?.name || null,
  email: user?.email || null,
  role: user?.role || null,

  // ── User dashboard fields ──────────────────────────────────────────────────
  credits: user?.credits ?? 0,
  referralCode: user?.referralCode || null,
  referralCount: user?.referralCount ?? 0,
};

// ─── Axios instance (untouched) ───────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Dashboard Thunks (untouched) ─────────────────────────────────────────────

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/user-details/dashboard');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load dashboard');
    }
  }
);

export const fetchAlerts = createAsyncThunk(
  'dashboard/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/user-details/alerts');
      return response.data.alerts;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load alerts');
    }
  }
);

// ─── Auth Thunks ──────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<AuthResponse>(`${BASE_URL}/api/v1/auth/login`, credentials);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
    return rejectWithValue('Network error');
  }
});

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  { rejectValue: string }
>('user/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<AuthResponse>(`${BASE_URL}/api/v1/auth/register`, userData);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
    return rejectWithValue('Network error');
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const userSlice = createSlice({
  name: 'user',
  initialState,

  reducers: {
    logout(state) {
      clearSession();
      Object.assign(state, {
        token: null,
        isAuthenticated: false,
        id: null,
        name: null,
        email: null,
        role: null,
        credits: 0,
        referralCode: null,
        referralCount: 0,
        authLoading: false,
        authError: null,
      });
    },

    clearError(state) {
      state.authError = null;
    },

    updateCredits(state, action: PayloadAction<number>) {
      state.credits = action.payload;
    },

    incrementReferralCount(state) {
      state.referralCount += 1;
    },
  },

  extraReducers: (builder) => {
    builder
      // ── Dashboard (untouched) ──────────────────────────────────────────────
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.latestSearches = action.payload.latestSearches;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload;
      })

      // ── Login ──────────────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { token, data } = action.payload;
        saveSession(token, data);
        state.authLoading = false;
        state.authError = null;
        state.token = token;
        state.isAuthenticated = true;
        state.id = data.id;
        state.name = data.name;
        state.email = data.email;
        state.role = data.role;
        state.credits = data.credits;
        state.referralCode = data.referralCode;
        state.referralCount = data.referralCount;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload ?? 'Something went wrong';
      })

      // ── Register ───────────────────────────────────────────────────────────
      .addCase(registerUser.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const { token, data } = action.payload;
        saveSession(token, data);
        state.authLoading = false;
        state.authError = null;
        state.token = token;
        state.isAuthenticated = true;
        state.id = data.id;
        state.name = data.name;
        state.email = data.email;
        state.role = data.role;
        state.credits = data.credits;
        state.referralCode = data.referralCode;
        state.referralCount = data.referralCount;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload ?? 'Something went wrong';
      });
  },
});

export const { logout, clearError, updateCredits, incrementReferralCount } =
  userSlice.actions;

export default userSlice.reducer;

// ─── RootState ────────────────────────────────────────────────────────────────

interface RootState {
  user: UserState;
}

// ─── Selectors ────────────────────────────────────────────────────────────────

// Auth
export const selectIsAuthenticated = (state: RootState): boolean => state.user.isAuthenticated;
export const selectToken = (state: RootState): string | null => state.user.token;
export const selectAuthLoading = (state: RootState): boolean => state.user.authLoading;
export const selectAuthError = (state: RootState): string | null => state.user.authError;

// User info
export const selectUserId = (state: RootState): string | null => state.user.id;
export const selectUserName = (state: RootState): string | null => state.user.name;
export const selectUserEmail = (state: RootState): string | null => state.user.email;
export const selectUserRole = (state: RootState): string | null => state.user.role;

// User dashboard fields
export const selectCredits = (state: RootState): number => state.user.credits;
export const selectReferralCode = (state: RootState): string | null => state.user.referralCode;
export const selectReferralCount = (state: RootState): number => state.user.referralCount;

// Dashboard (untouched)
export const selectDashboardStats = (state: RootState) => state.user.stats;
export const selectLatestSearches = (state: RootState) => state.user.latestSearches;
export const selectAlerts = (state: RootState) => state.user.alerts;
export const selectDashboardLoading = (state: RootState): boolean => state.user.loading;
export const selectDashboardError = (state: RootState): string | null => state.user.error;