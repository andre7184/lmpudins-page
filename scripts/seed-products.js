import pg from 'pg';
import { products } from '../src/products.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const categoryByTone = {
  berry: 'Frutados',
  orange: 'Frutados',
  passion: 'Frutados',
  guava: 'Frutados',
  coffee: 'Intensos',
  cane: 'Intensos',
  cream: 'Cremosos',
};

async function seedProducts() {
  let inserted = 0;
  for (const [index, product] of products.entries()) {
    const result = await pool.query(
      `INSERT INTO products
        (slug, name, short_description, description, ingredients, image, images, category, nutrition, active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,'[]'::jsonb,'$7','{}'::jsonb,TRUE,$8)
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`,
      [
        product.id || product.slug,
        product.name,
        product.short || '',
        product.description || '',
        product.ingredients || '',
        product.image || '',
        categoryByTone[product.tone] || 'Cremosos',
        index + 1,
      ],
    );
    if (result.rowCount) inserted += 1;
  }
  const total = await pool.query('SELECT COUNT(*)::int AS total FROM products');
  console.log(`Carga do catálogo concluída: ${inserted} inserido(s); ${total.rows[0].total} produto(s) no banco.`);
}

seedProducts()
  .catch((error) => {
    console.error('Falha ao importar produtos do catálogo:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
