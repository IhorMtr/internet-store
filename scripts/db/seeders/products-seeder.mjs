import { productSeed } from '../seed-data/products.mjs';

// ========== Seeder ==========
export async function insertProducts(client, categoryIds) {
  const productIds = new Map();

  for (const product of productSeed) {
    const categoryId = categoryIds.get(product.category);

    const result = await client.query(
      `
        insert into public.products (
          category_id,
          name,
          price,
          stock_quantity,
          discount,
          description
        )
        values ($1, $2, $3, $4, $5, $6)
        returning product_id
      `,
      [categoryId, product.name, product.price, product.stock, product.discount, product.description]
    );

    productIds.set(product.name, result.rows[0].product_id);
  }

  return productIds;
}
