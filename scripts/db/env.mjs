import dotenv from 'dotenv';

// ========== Environment ==========
export function loadEnvFile(filePath) {
  dotenv.config({ path: filePath });
}
