// ========== Types ==========
export type BaseResponse<T> = {
  data: T;
  success: boolean;
  message: string | null;
};
