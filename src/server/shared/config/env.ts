// ===================== TYPES =====================
type ServerEnv = {
  accessTokenSecret: string;
  cloudinaryApiKey: string | null;
  cloudinaryApiSecret: string | null;
  cloudinaryCloudName: string | null;
  cloudinaryFolder: string;
  cloudinaryIsConfigured: boolean;
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

function readOptionalEnv(name: string): string | null {
  const value = process.env[name]?.trim();

  return value && value.length > 0 ? value : null;
}

// ===================== EXPORTS =====================
const cloudinaryCloudName = readOptionalEnv('CLOUDINARY_CLOUD_NAME');
const cloudinaryApiKey = readOptionalEnv('CLOUDINARY_API_KEY');
const cloudinaryApiSecret = readOptionalEnv('CLOUDINARY_API_SECRET');

export const serverEnv: ServerEnv = {
  accessTokenSecret: readRequiredEnv('ACCESS_TOKEN_SECRET'),
  cloudinaryApiKey,
  cloudinaryApiSecret,
  cloudinaryCloudName,
  cloudinaryFolder: readOptionalEnv('CLOUDINARY_FOLDER') ?? 'shopcore/products',
  cloudinaryIsConfigured: Boolean(cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret),
  databaseUrl: readRequiredEnv('DATABASE_URL'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  refreshTokenSecret: readRequiredEnv('REFRESH_TOKEN_SECRET'),
};
