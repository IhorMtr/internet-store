import type { AxiosInstance } from 'axios';
import { useAuthSessionStore } from '@/domains/auth/model/stores/auth-session-store';
import { apiError } from '@/shared/api/errors';
import { apiLocale } from '@/shared/api/locale';

// ========== Helpers ==========

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
      const accessToken = useAuthSessionStore.getState().accessToken;

      config.headers.set('Accept-Language', apiLocale.getCurrent());

      if (accessToken) {
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
      (error: unknown) => Promise.reject(apiError.normalize(error))
    );
  },
};
