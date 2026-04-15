import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { DashboardState } from '../../../types/dashboard';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

const initialState: DashboardState = {
  stats: null,
  latestSearches: [],
  alerts: [],
  loading: false,
  error: null,
};

// Configure an axios instance to automatically attach the token if available
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

apiClient.interceptors.request.use((config) => {
  // Assuming token is stored in localStorage, adjust based on your auth implementation
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard Data
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
      // Alerts Data
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload;
      });
  },
});

export default dashboardSlice.reducer;