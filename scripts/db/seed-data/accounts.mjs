// ========== Accounts ==========
export function getAdminSeedAccount() {
  const email = process.env.SHOPCORE_ADMIN_EMAIL;
  const password = process.env.SHOPCORE_ADMIN_PASSWORD;
  const fullName = process.env.SHOPCORE_ADMIN_FULL_NAME;

  if (!email || !password || !fullName) {
    throw new Error(
      'SHOPCORE_ADMIN_EMAIL, SHOPCORE_ADMIN_PASSWORD and SHOPCORE_ADMIN_FULL_NAME are required for db:reset-seed'
    );
  }

  return {
    email,
    password,
    fullName,
    roleName: 'admin',
    customerId: null,
  };
}
