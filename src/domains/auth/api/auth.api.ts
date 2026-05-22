import { apiClient } from '@/shared/api/client';
import { useAuthSessionStore } from '@/domains/auth/model/stores/auth-session-store';
import type { LoginRequest, RegisterRequest } from '@/domains/auth/model/types/auth.interfaces';
import type {
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  RegisterResponse,
} from '@/domains/auth/model/types/auth.types';

// ===================== HELPERS =====================

let refreshRequest: Promise<RefreshResponse> | null = null;

function applySession(
  accessToken: string,
  user: RefreshResponse['data']['user'],
  expectedSessionVersion?: number
): boolean {
  const authSessionStore = useAuthSessionStore.getState();

  if (expectedSessionVersion != null && authSessionStore.sessionVersion !== expectedSessionVersion) {
    return false;
  }

  authSessionStore.setSession({ accessToken, user });
  return true;
}

// ===================== REQUESTS =====================

export const authApi = {
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', payload);

    applySession(response.data.data.accessToken, response.data.data.user);

    return response.data;
  },

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);

    applySession(response.data.data.accessToken, response.data.data.user);

    return response.data;
  },

  async refresh(): Promise<RefreshResponse> {
    const expectedSessionVersion = useAuthSessionStore.getState().sessionVersion;

    refreshRequest ??= apiClient
      .post<RefreshResponse>('/auth/refresh')
      .then(response => {
        applySession(response.data.data.accessToken, response.data.data.user, expectedSessionVersion);

        return response.data;
      })
      .finally(() => {
        refreshRequest = null;
      });

    return refreshRequest;
  },

  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>('/auth/logout');

    return response.data;
  },
};
