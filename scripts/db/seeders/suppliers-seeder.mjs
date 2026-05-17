import { supplierSeed } from '../seed-data/suppliers.mjs';

// ========== Seeder ==========
export async function insertSuppliers(client) {
  const supplierIds = new Map();

  for (const supplier of supplierSeed) {
    const result = await client.query(
      `
        insert into public.suppliers (
          name,
          phone_number,
          email
        )
        values ($1, $2, $3)
        returning supplier_id
      `,
      [supplier.name, supplier.phone, supplier.email]
    );

    supplierIds.set(supplier.key, result.rows[0].supplier_id);
  }

  return supplierIds;
}
