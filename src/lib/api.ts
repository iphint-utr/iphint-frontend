import axios from 'axios';

const sanitizeBaseUrl = (value: string) =>
  value
    .trim()
    .replace(/^['"\s]+|['"\s]+$/g, '')
    .replace(/\/+$/g, '');

const readApiBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_BASE_URL;

  if (!value) {
    throw new Error('NEXT_PUBLIC_BASE_URL is not configured.');
  }

  return sanitizeBaseUrl(value);
};

export const getApiBaseUrl = () => readApiBaseUrl();

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
});

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('token');
};

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const parseLocaleFromPathname = (pathname: string) => {
  const segment = pathname.split('/').filter(Boolean)[0];
  return segment === 'kr' ? 'kr' : 'en';
};

const clearStoredSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status !== 401 || typeof window === 'undefined') {
      return Promise.reject(error);
    }

    const currentPath = window.location.pathname || '/';
    const locale = parseLocaleFromPathname(currentPath);
    const isAuthPage = /^\/(en|kr)\/(login|signup|forgot-password|reset-password)\/?$/.test(currentPath);

    clearStoredSession();

    if (!isAuthPage) {
      const redirectTarget = `${window.location.pathname}${window.location.search || ''}`;
      const loginPath = `/${locale}/login?redirect=${encodeURIComponent(redirectTarget)}`;
      window.location.replace(loginPath);
    }

    return Promise.reject(error);
  },
);

const extractApiErrorMessage = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (value && typeof value === 'object') {
    if ('message' in value) {
      return extractApiErrorMessage((value as { message?: unknown }).message);
    }

    if ('error' in value) {
      return extractApiErrorMessage((value as { error?: unknown }).error);
    }
  }

  return null;
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const responseMessage = extractApiErrorMessage(error.response?.data);

    if (responseMessage) {
      return responseMessage;
    }

    if (error.message) {
      return error.message;
    }
  }

  return fallback;
};