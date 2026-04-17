import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Configure axios instance
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const apiClient = axios.create({
  baseURL: `${BASE_URL}`,
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const performScan = createAsyncThunk(
  'scan/performScan',
  async (payload: File | string, { rejectWithValue }) => {
    try {
      let requestData;
      
      if (payload instanceof File) {
        requestData = new FormData();
        requestData.append('image', payload);
      } else {
        requestData = { imageUrl: payload };
      }

      const response = await apiClient.post('/serp/search', requestData);
      
      // Accessing the 'results' array from your JSON structure
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      
      return [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to perform image scan.'
      );
    }
  }
);

const scanSlice = createSlice({
  name: 'scan',
  initialState: {
    results: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performScan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performScan.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(performScan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as any;
      });
  },
});

export const { clearResults } = scanSlice.actions;
export default scanSlice.reducer;