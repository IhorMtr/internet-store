import fs from 'node:fs';
import path from 'node:path';

// ========== Helpers ==========
export async function runSqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');

  if (!sql.trim()) {
    return;
  }

  await client.query(sql);
}

// ========== Migrations ==========
export async function applyMigrations(client, migrationsDirectoryPath) {
  const migrationFiles = fs
    .readdirSync(migrationsDirectoryPath)
    .filter(fileName => fileName.endsWith('.sql'))
    .sort((first, second) => first.localeCompare(second));

  for (const migrationFile of migrationFiles) {
    const migrationPath = path.join(migrationsDirectoryPath, migrationFile);
    await runSqlFile(client, migrationPath);
    console.info(`[db:reset-seed] applied migration ${migrationFile}`);
  }
}
