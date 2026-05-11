import type { AxiosInstance } from "axios";
import { apiError } from "@/shared/api/errors";
import { apiLocale } from "@/shared/api/locale";

// ========== Interceptors ==========

export const apiInterceptors = {
  attach(client: AxiosInstance): void {
    client.interceptors.request.use((config) => {
      config.headers.set("Accept-Language", apiLocale.getCurrent());

      return config;
    });

    client.interceptors.response.use(
      (response) => response,
      (error: unknown) => Promise.reject(apiError.normalize(error)),
    );
  },
};
