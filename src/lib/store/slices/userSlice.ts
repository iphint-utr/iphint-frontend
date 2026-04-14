import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  userId: string;
  name: string;
  email: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  isAdult: boolean;
}

export interface SignInPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  user: UserProfile;
  token: string;
}

type AsyncStatus = "idle" | "loading" | "success" | "error";

interface UserState {
  user: UserProfile | null;
  token: string | null;
  signupStatus: AsyncStatus;
  signinStatus: AsyncStatus;
  emailVerifyStatus: AsyncStatus;
  error: string | null;
}

// ─── API layer (swap base URL / headers for your real backend) ────────────────
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.code ?? res.status.toString());
  }
  return res.json();
}

// ─── Async Thunks ─────────────────────────────────────────────────────────────
/*export const verifyEmailThunk = createAsyncThunk<void, string>(
  "user/verifyEmail",
  async (email, { rejectWithValue }) => {
    try {
      await apiFetch("/api/auth/verify-email", { email });
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);*/

export const signUpThunk = createAsyncThunk<
  AuthResponse,
  SignUpPayload,
  { rejectValue: string }
>(
  "user/signUp",
  async (payload, { rejectWithValue }) => {
    try {
      return await apiFetch<AuthResponse>("/api/auth/signup", payload);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const signInThunk = createAsyncThunk<
  AuthResponse,
  SignInPayload,
  { rejectValue: string }
>(
  "user/signIn",
  async (payload, { rejectWithValue }) => {
    try {
      return await apiFetch<AuthResponse>("/api/auth/signin", payload);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const googleAuthThunk = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: string }
>(
  "user/googleAuth",
  async (_, { rejectWithValue }) => {
    try {
      return await apiFetch<AuthResponse>("/api/auth/google", {});
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const initialState: UserState = {
  user: null,
  token: null,
  signupStatus: "idle",
  signinStatus: "idle",
  emailVerifyStatus: "idle",
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: () => initialState,
    resetAuthStatus(state) {
      state.signupStatus = "idle";
      state.signinStatus = "idle";
      state.emailVerifyStatus = "idle";
      state.error = null;
    },
    resetEmailVerify(state) {
      state.emailVerifyStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    

    // signUp
    builder
      .addCase(signUpThunk.pending, (s) => { s.signupStatus = "loading"; s.error = null; })
      .addCase(signUpThunk.fulfilled, (s, a) => {
        s.signupStatus = "success";
        s.user = a.payload.user;
        s.token = a.payload.token;
      })
      .addCase(signUpThunk.rejected, (s, a) => {
        s.signupStatus = "error";
        s.error = a.payload ?? "Unknown error";
      });

    // signIn
    builder
      .addCase(signInThunk.pending, (s) => { s.signinStatus = "loading"; s.error = null; })
      .addCase(signInThunk.fulfilled, (s, a) => {
        s.signinStatus = "success";
        s.user = a.payload.user;
        s.token = a.payload.token;
      })
      .addCase(signInThunk.rejected, (s, a) => {
        s.signinStatus = "error";
        s.error = a.payload ?? "Unknown error";
      });

    // googleAuth (reuses signinStatus)
    builder
      .addCase(googleAuthThunk.pending, (s) => { s.signinStatus = "loading"; s.error = null; })
      .addCase(googleAuthThunk.fulfilled, (s, a) => {
        s.signinStatus = "success";
        s.user = a.payload.user;
        s.token = a.payload.token;
      })
      .addCase(googleAuthThunk.rejected, (s, a) => {
        s.signinStatus = "error";
        s.error = a.payload ?? "Unknown error";
      });
  },
});

export const { logout, resetAuthStatus, resetEmailVerify } = userSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectUser              = (s: RootState) => s.user.user;
export const selectToken             = (s: RootState) => s.user.token;
export const selectIsAuthenticated   = (s: RootState) => !!s.user.token;
export const selectSignupStatus      = (s: RootState) => s.user.signupStatus;
export const selectSigninStatus      = (s: RootState) => s.user.signinStatus;
export const selectEmailVerifyStatus = (s: RootState) => s.user.emailVerifyStatus;
export const selectAuthError         = (s: RootState) => s.user.error;

export default userSlice.reducer;