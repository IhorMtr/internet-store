// ===================== TYPES =====================
export type BaseResponse<T> = {
  data: T;
  success: boolean;
  message: string | null;
};

// ===================== HELPERS =====================
export const backendResponse = {
  success<T>(data: T): BaseResponse<T> {
    return {
      data,
      success: true,
      message: null,
    };
  },

  error(message: string): BaseResponse<null> {
    return {
      data: null,
      success: false,
      message,
    };
  },
};
