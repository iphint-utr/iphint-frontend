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

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

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