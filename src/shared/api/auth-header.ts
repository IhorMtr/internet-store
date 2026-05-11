import type { AxiosInstance } from "axios";

// ========== Helpers ==========

export const apiAuthHeader = {
  setAccessToken(client: AxiosInstance, token: string): void {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  },

  clear(client: AxiosInstance): void {
    delete client.defaults.headers.common.Authorization;
  },

  apply(client: AxiosInstance, token?: string | null): void {
    if (token) {
      apiAuthHeader.setAccessToken(client, token);
      return;
    }

    apiAuthHeader.clear(client);
  },
};
