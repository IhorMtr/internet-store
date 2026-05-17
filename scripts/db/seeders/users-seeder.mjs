import bcrypt from 'bcrypt';
import { customerSeed } from '../seed-data/customers.mjs';
import { getAdminSeedAccount } from '../seed-data/accounts.mjs';

// ========== Helpers ==========
async function createCustomer(client, customer) {
  const result = await client.query(
    `
      insert into public.customers (
        full_name,
        phone_number,
        email,
        address
      )
      values ($1, $2, $3, $4)
      returning customer_id
    `,
    [customer.fullName, customer.phoneNumber, customer.email, customer.address]
  );

  return result.rows[0].customer_id;
}

async function upsertAuthUser(client, user) {
  const passwordHash = await bcrypt.hash(user.password, 12);

  const result = await client.query(
    `
      insert into public.auth_users (
        email,
        password_hash,
        full_name,
        role_name,
        customer_id
      )
      values ($1, $2, $3, $4, $5)
      on conflict (email) do update
      set
        password_hash = excluded.password_hash,
        full_name = excluded.full_name,
        role_name = excluded.role_name,
        customer_id = excluded.customer_id,
        updated_at = now()
      returning user_id
    `,
    [user.email, passwordHash, user.fullName, user.roleName, user.customerId]
  );

  return result.rows[0].user_id;
}

// ========== Seeder ==========
export async function seedUserRoles(client) {
  await client.query(
    `
      insert into public.user_roles (
        role_name,
        description
      )
      values
        ('admin', 'Administrator account with full access'),
        ('user', 'Regular customer account')
      on conflict (role_name) do update
      set description = excluded.description
    `
  );
}

export async function seedCustomersAndUsers(client) {
  const customerIds = new Map();

  for (const customer of customerSeed) {
    const customerId = await createCustomer(client, customer);
    customerIds.set(customer.key, customerId);
  }

  await upsertAuthUser(client, getAdminSeedAccount());

  return customerIds;
}
