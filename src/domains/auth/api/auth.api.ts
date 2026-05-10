import { apiAuthHeader } from "@/shared/api/auth-header";
import { apiClient } from "@/shared/api/client";
import type {
  LoginRequest,
  RegisterRequest,
} from "@/domains/auth/model/types/auth.interfaces";
import type {
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  RegisterResponse,
} from "@/domains/auth/model/types/auth.types";

// ===================== HELPERS =====================

let refreshRequest: Promise<RefreshResponse> | null = null;

function applyAccessToken(accessToken: string): void {
  apiAuthHeader.setAccessToken(apiClient, accessToken);
}

// ===================== REQUESTS =====================

export const authApi = {
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      "/auth/register",
      payload,
    );

    applyAccessToken(response.data.data.accessToken);

    return response.data;
  },

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", payload);

    applyAccessToken(response.data.data.accessToken);

    return response.data;
  },

  async refresh(): Promise<RefreshResponse> {
    refreshRequest ??= apiClient
      .post<RefreshResponse>("/auth/refresh")
      .then((response) => {
        applyAccessToken(response.data.data.accessToken);

        return response.data;
      })
      .finally(() => {
        refreshRequest = null;
      });

    return refreshRequest;
  },

  async logout(): Promise<LogoutResponse> {
    try {
      const response = await apiClient.post<LogoutResponse>("/auth/logout");

      return response.data;
    } finally {
      apiAuthHeader.clear(apiClient);
    }
  },
};
