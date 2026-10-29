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
       VALUES ($1,$2,$3,$4,$5,$6,'[]'::jsonb,$7,'{}'::jsonb,TRUE,$8)
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
  const expectedSlugs = products.map((product) => product.id || product.slug);
  const verification = await pool.query(
    'SELECT slug, active FROM products WHERE slug = ANY($1::text[]) ORDER BY sort_order, slug',
    [expectedSlugs],
  );
  const activeSlugs = new Set(verification.rows.filter((row) => row.active).map((row) => row.slug));
  const missing = expectedSlugs.filter((slug) => !activeSlugs.has(slug));
  const total = await pool.query('SELECT COUNT(*)::int AS total FROM products');
  console.log(`Verificação PostgreSQL: ${verification.rowCount}/${expectedSlugs.length} produtos padrão encontrados; ${activeSlugs.size} ativos; total geral: ${total.rows[0].total}.`);
  console.log('Slugs encontrados:', verification.rows.map((row) => `${row.slug} (ativo=${row.active})`).join(', '));
  if (missing.length) {
    throw new Error(`Produtos ausentes ou inativos no banco: ${missing.join(', ')}`);
  }
  console.log(`Carga do catálogo concluída: ${inserted} inserido(s); banco validado.`);
}

seedProducts()
  .catch((error) => {
    console.error('Falha ao importar produtos do catálogo:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
