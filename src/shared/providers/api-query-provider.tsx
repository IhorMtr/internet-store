"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
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

// ===================== HELPERS =====================

function shouldShowToast(meta: unknown): boolean {
  return !(meta as QueryMeta | undefined)?.suppressToast;
}

function showApiErrorToast(error: unknown): void {
  const normalizedError = apiError.normalize(error);

  toast.error(normalizedError.message || "Unexpected error");
}

// ===================== COMPONENT =====================

export function ApiQueryProvider({ children }: ApiQueryProviderProps) {
  // ===================== STATE =====================

  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError(error, _variables, _context, mutation) {
            if (shouldShowToast(mutation.meta)) {
              showApiErrorToast(error);
            }
          },
        }),
        queryCache: new QueryCache({
          onError(error, query) {
            if (shouldShowToast(query.meta)) {
              showApiErrorToast(error);
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
