import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { AuthUser, RefreshResponse } from '@/domains/auth/model/types/auth.types';
import { useAuthSessionStore } from '@/domains/auth/model/stores/auth-session-store';
import { apiError } from '@/shared/api/errors';
import { apiLocale } from '@/shared/api/locale';

// ========== Helpers ==========

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

type RefreshPayload = {
  accessToken: string;
  user: AuthUser;
};

const AUTH_ENDPOINTS = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout', '/auth/session']);

let refreshPromise: Promise<string> | null = null;

function normalizeApiPath(url: string | undefined): string {
  if (!url) {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.replace(/^\/api/, '');
  }

  return url.replace(/^\/api/, '');
}

function isAuthEndpoint(url: string | undefined): boolean {
  const normalizedPath = normalizeApiPath(url);
  return AUTH_ENDPOINTS.has(normalizedPath);
}

function readRefreshPayload(response: RefreshResponse): RefreshPayload {
  return {
    accessToken: response.data.accessToken,
    user: response.data.user,
  };
}

function setMemorySession(payload: RefreshPayload): void {
  useAuthSessionStore.getState().setSession({
    accessToken: payload.accessToken,
    user: payload.user,
  });
}

function refreshAccessToken(client: AxiosInstance): Promise<string> {
  refreshPromise ??= client
    .post<RefreshResponse>('/auth/refresh', undefined, {
      skipAuthRefresh: true,
    } as RetriableRequestConfig)
    .then(response => {
      const payload = readRefreshPayload(response.data);
      setMemorySession(payload);
      return payload.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function isFormDataBody(data: unknown): data is FormData {
  return typeof FormData !== 'undefined' && data instanceof FormData;
}

function shouldUseJsonContentType(method: string | undefined, data: unknown): boolean {
  if (!method) {
    return false;
  }

  const normalizedMethod = method.toLowerCase();

  if (normalizedMethod !== 'post' && normalizedMethod !== 'put' && normalizedMethod !== 'patch') {
    return false;
  }

  if (data == null || isFormDataBody(data)) {
    return false;
  }

  return true;
}

// ========== Interceptors ==========

export const apiInterceptors = {
  attach(client: AxiosInstance): void {
    client.interceptors.request.use(config => {
      const retriableConfig = config as RetriableRequestConfig;
      const accessToken = useAuthSessionStore.getState().accessToken;

      config.headers.set('Accept-Language', apiLocale.getCurrent());

      if (retriableConfig.skipAuthRefresh) {
        config.headers.delete('Authorization');
      } else if (accessToken) {
        config.headers.set('Authorization', `Bearer ${accessToken}`);
      } else {
        config.headers.delete('Authorization');
      }

      if (isFormDataBody(config.data)) {
        config.headers.delete('Content-Type');
      } else if (shouldUseJsonContentType(config.method, config.data) && !config.headers.has('Content-Type')) {
        config.headers.set('Content-Type', 'application/json');
      }

      return config;
    });

    client.interceptors.response.use(
      response => response,
      async (error: unknown) => {
        if (!axios.isAxiosError(error)) {
          return Promise.reject(apiError.normalize(error));
        }

        const originalRequest = error.config as RetriableRequestConfig | undefined;

        if (!originalRequest) {
          return Promise.reject(apiError.normalize(error));
        }

        const isUnauthorized = error.response?.status === 401;
        const canRetry =
          isUnauthorized &&
          !originalRequest._retry &&
          !originalRequest.skipAuthRefresh &&
          !isAuthEndpoint(originalRequest.url);

        if (!canRetry) {
          return Promise.reject(apiError.normalize(error));
        }

        originalRequest._retry = true;

        try {
          const refreshedAccessToken = await refreshAccessToken(client);

          if (originalRequest.headers && 'set' in originalRequest.headers) {
            originalRequest.headers.set('Authorization', `Bearer ${refreshedAccessToken}`);
          }

          return client(originalRequest);
        } catch (refreshError) {
          useAuthSessionStore.getState().clearSession();
          return Promise.reject(apiError.normalize(refreshError));
        }
      }
    );
  },
};
