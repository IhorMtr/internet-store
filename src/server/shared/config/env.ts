// ===================== TYPES =====================
type ServerEnv = {
  accessTokenSecret: string;
  databaseUrl: string;
  nodeEnv: string;
  refreshTokenSecret: string;
};

// ===================== HELPERS =====================
function readRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

// ===================== EXPORTS =====================
export const serverEnv: ServerEnv = {
  accessTokenSecret: readRequiredEnv("ACCESS_TOKEN_SECRET"),
  databaseUrl: readRequiredEnv("DATABASE_URL"),
  nodeEnv: process.env.NODE_ENV ?? "development",
  refreshTokenSecret: readRequiredEnv("REFRESH_TOKEN_SECRET"),
};
