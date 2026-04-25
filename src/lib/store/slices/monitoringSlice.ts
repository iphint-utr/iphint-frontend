import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

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

export type ReviewStatus =
  | 'not_reviewed'
  | 'reviewed'
  | 'rights_given'
  | 'dispute'
  | 'escalated';

export interface MonitoringSearch {
  searchId: string;
  image: string;
  status: string;
  time: string;
  folderId?: string | null;
  fileName: string;
  totalResults: number;
  reviewedResults: number;
  analysisStatus: 'pending_review' | 'monitoring' | 'analysis_complete';
}

export interface MonitoringResult {
  _id: string;
  image: string;
  isLocked?: boolean;
  details?: {
    title?: string;
    link?: string;
    source?: string;
  };
  reviewStatus: ReviewStatus;
  reviewedAt?: string | null;
}

interface MonitoringState {
  searches: MonitoringSearch[];
  selectedSearch: {
    searchId: string;
    image: string;
    status: string;
    time: string;
    fileName: string;
  } | null;
  results: MonitoringResult[];
  planLimits: {
    tier: 'starter' | 'pro' | 'premium';
    maxResults: number;
    pdfEnabled: boolean;
    lockedCount: number;
  } | null;
  loading: boolean;
  resultsLoading: boolean;
  updatingResultId: string | null;
  deletingResultId: string | null;
  bulkDeleting: boolean;
  error: string | null;
  page: number;
  pages: number;
  total: number;
}

const initialState: MonitoringState = {
  searches: [],
  selectedSearch: null,
  results: [],
  planLimits: null,
  loading: false,
  resultsLoading: false,
  updatingResultId: null,
  deletingResultId: null,
  bulkDeleting: false,
  error: null,
  page: 1,
  pages: 1,
  total: 0,
};

export const fetchMonitoringSearches = createAsyncThunk(
  'monitoring/fetchSearches',
  async (
    params: { name?: string; date?: string; folderId?: string; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiClient.get('/user-details/monitoring', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load monitoring data');
    }
  },
);

export const fetchMonitoringSearchResults = createAsyncThunk(
  'monitoring/fetchSearchResults',
  async (searchId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/user-details/monitoring/${searchId}/results`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load search results');
    }
  },
);

export const updateMonitoringResultStatus = createAsyncThunk(
  'monitoring/updateResultStatus',
  async (
    payload: { resultId: string; reviewStatus: ReviewStatus },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiClient.patch(
        `/user-details/monitoring/result/${payload.resultId}/status`,
        { reviewStatus: payload.reviewStatus },
      );

      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  },
);

export const deleteMonitoringResult = createAsyncThunk(
  'monitoring/deleteResult',
  async (resultId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/user-details/monitoring/result/${resultId}`);
      return resultId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete result');
    }
  },
);

export const bulkDeleteMonitoringResults = createAsyncThunk(
  'monitoring/bulkDeleteResults',
  async (resultIds: string[], { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/user-details/monitoring/results/bulk-delete', {
        resultIds,
      });
      return response.data.deletedIds as string[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk delete results');
    }
  },
);

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    clearMonitoringState(state) {
      state.selectedSearch = null;
      state.results = [];
      state.planLimits = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonitoringSearches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonitoringSearches.fulfilled, (state, action) => {
        state.loading = false;
        state.searches = action.payload.data || [];
        state.page = action.payload.pagination?.page || 1;
        state.pages = action.payload.pagination?.pages || 1;
        state.total = action.payload.pagination?.total || 0;
      })
      .addCase(fetchMonitoringSearches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMonitoringSearchResults.pending, (state) => {
        state.resultsLoading = true;
        state.error = null;
      })
      .addCase(fetchMonitoringSearchResults.fulfilled, (state, action) => {
        state.resultsLoading = false;
        state.selectedSearch = action.payload.search || null;
        state.results = action.payload.results || [];
        state.planLimits = action.payload.planLimits || null;
      })
      .addCase(fetchMonitoringSearchResults.rejected, (state, action) => {
        state.resultsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateMonitoringResultStatus.pending, (state, action) => {
        state.updatingResultId = action.meta.arg.resultId;
        state.error = null;
      })
      .addCase(updateMonitoringResultStatus.fulfilled, (state, action) => {
        state.updatingResultId = null;

        const index = state.results.findIndex((item) => item._id === action.payload._id);
        if (index >= 0) {
          state.results[index] = {
            ...state.results[index],
            reviewStatus: action.payload.reviewStatus,
            reviewedAt: action.payload.reviewedAt,
          };
        }
      })
      .addCase(updateMonitoringResultStatus.rejected, (state, action) => {
        state.updatingResultId = null;
        state.error = action.payload as string;
      })
      .addCase(deleteMonitoringResult.pending, (state, action) => {
        state.deletingResultId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteMonitoringResult.fulfilled, (state, action) => {
        state.deletingResultId = null;
        state.results = state.results.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteMonitoringResult.rejected, (state, action) => {
        state.deletingResultId = null;
        state.error = action.payload as string;
      })
      .addCase(bulkDeleteMonitoringResults.pending, (state) => {
        state.bulkDeleting = true;
        state.error = null;
      })
      .addCase(bulkDeleteMonitoringResults.fulfilled, (state, action) => {
        state.bulkDeleting = false;
        const deletedSet = new Set(action.payload);
        state.results = state.results.filter((item) => !deletedSet.has(item._id));
      })
      .addCase(bulkDeleteMonitoringResults.rejected, (state, action) => {
        state.bulkDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMonitoringState } = monitoringSlice.actions;
export default monitoringSlice.reducer;
