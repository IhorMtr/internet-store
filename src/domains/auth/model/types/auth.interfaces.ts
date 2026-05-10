// ===================== TYPES =====================
export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}
