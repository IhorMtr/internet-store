import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ========== Paths ==========
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);

export const ROOT_DIR = path.resolve(currentDirectoryPath, '..', '..');
export const ENV_FILE = path.join(ROOT_DIR, '.env.local');
export const MIGRATIONS_DIR = path.join(ROOT_DIR, 'db-migration', 'migrations');
export const BASE_SCHEMA_FILE = path.join(ROOT_DIR, 'db-migration', 'schema', 'shopcore_base_schema.sql');
