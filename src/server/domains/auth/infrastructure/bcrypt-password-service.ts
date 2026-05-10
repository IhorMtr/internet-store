import bcrypt from "bcrypt";
import type { PasswordService } from "@/server/domains/auth/application/auth-ports";

// ===================== CONSTANTS =====================
const SALT_ROUNDS = 12;

// ===================== SERVICES =====================
export const bcryptPasswordService: PasswordService = {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  verify(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  },
};
