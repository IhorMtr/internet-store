"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { apiError } from "@/shared/api/errors";

// ===================== TYPES =====================

type ApiQueryProviderProps = {
  children: ReactNode;
};

type QueryMeta = {
  suppressToast?: boolean;
};

type ErrorTranslator = ReturnType<typeof useTranslations<"common.errors">>;

// ===================== HELPERS =====================

function shouldShowToast(meta: unknown): boolean {
  return !(meta as QueryMeta | undefined)?.suppressToast;
}

function getApiErrorToastMessage(error: unknown, t: ErrorTranslator): string {
  const normalizedError = apiError.normalize(error);

  if (normalizedError.code === "NETWORK_ERROR") {
    return t("network");
  }

  if (normalizedError.code === "UNKNOWN_ERROR") {
    return t("unexpected");
  }

  return normalizedError.message || t("unexpected");
}

function showApiErrorToast(error: unknown, t: ErrorTranslator): void {
  toast.error(getApiErrorToastMessage(error, t));
}

// ===================== COMPONENT =====================

export function ApiQueryProvider({ children }: ApiQueryProviderProps) {
  // ===================== TRANSLATIONS =====================

  const t = useTranslations("common.errors");

  // ===================== STATE =====================

  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError(error, _variables, _context, mutation) {
            if (shouldShowToast(mutation.meta)) {
              showApiErrorToast(error, t);
            }
          },
        }),
        queryCache: new QueryCache({
          onError(error, query) {
            if (shouldShowToast(query.meta)) {
              showApiErrorToast(error, t);
            }
          },
        }),
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  // ===================== RENDER =====================

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
