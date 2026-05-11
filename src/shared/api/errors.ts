import axios, { type AxiosError } from "axios";
import type { BaseResponse } from "@/shared/api/types";

// ========== Types ==========
export type AppErrorCode =
  | "BACKEND_ERROR"
  | "NETWORK_ERROR"
  | "UNAUTHORIZED"
  | "UNKNOWN_ERROR";

export type AppError = Error & {
  code: AppErrorCode;
  data: unknown;
  isAppError: true;
  status: number | null;
};

// ========== Constants ==========
const fallbackStatusMessages: Record<number, string> = {
  400: "Bad request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not found",
  409: "Conflict",
  422: "Validation failed",
  500: "Internal server error",
};

// ========== Helpers ==========
function isBaseResponse(value: unknown): value is BaseResponse<unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    "success" in value &&
    "data" in value &&
    "message" in value
  );
}

function getStatusFallbackMessage(status: number | null): string {
  if (!status) {
    return "Unexpected error";
  }

  return fallbackStatusMessages[status] ?? `Request failed with status ${status}`;
}

// ========== Exports ==========
export const apiError = {
  create({
    code,
    data = null,
    message,
    status = null,
  }: {
    code: AppErrorCode;
    data?: unknown;
    message: string;
    status?: number | null;
  }): AppError {
    return Object.assign(new Error(message), {
      code,
      data,
      isAppError: true as const,
      name: "AppError",
      status,
    });
  },

  is(error: unknown): error is AppError {
    return (
      error instanceof Error &&
      "isAppError" in error &&
      error.isAppError === true
    );
  },

  normalize(error: unknown): AppError {
    if (apiError.is(error)) {
      return error;
    }

    if (!axios.isAxiosError(error)) {
      return apiError.create({
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    }

    const axiosError = error as AxiosError<unknown>;

    if (!axiosError.response) {
      return apiError.create({
        code: "NETWORK_ERROR",
        message: "Network error. Please check your connection.",
      });
    }

    const status = axiosError.response.status;
    const responseData = axiosError.response.data;
    const message =
      isBaseResponse(responseData) && responseData.message
        ? responseData.message
        : getStatusFallbackMessage(status);

    return apiError.create({
      code: status === 401 ? "UNAUTHORIZED" : "BACKEND_ERROR",
      data: isBaseResponse(responseData) ? responseData.data : responseData,
      message,
      status,
    });
  },
};
