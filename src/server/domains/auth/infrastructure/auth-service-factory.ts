import { createAuthService } from "@/server/domains/auth/application/auth-service";
import { bcryptPasswordService } from "@/server/domains/auth/infrastructure/bcrypt-password-service";
import { joseTokenService } from "@/server/domains/auth/infrastructure/jose-token-service";
import { postgresAuthRepository } from "@/server/domains/auth/infrastructure/postgres-auth-repository";

// ===================== SERVICES =====================
export const authService = createAuthService({
  repository: postgresAuthRepository,
  passwordService: bcryptPasswordService,
  tokenService: joseTokenService,
});
