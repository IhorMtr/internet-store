import { categorySeed } from '../seed-data/categories.mjs';

// ========== Seeder ==========
export async function insertCategories(client) {
  const categoryIds = new Map();

  for (const category of categorySeed) {
    const result = await client.query(
      `
        insert into public.categories (
          category_name,
          description
        )
        values ($1, $2)
        returning category_id
      `,
      [category.name, category.description]
    );

    categoryIds.set(category.key, result.rows[0].category_id);
  }

  return categoryIds;
}
