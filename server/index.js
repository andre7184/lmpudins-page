import express from 'express';
import session from 'express-session';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const { Pool } = pg;
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PgSession = connectPgSimple(session);
const port = Number(process.env.API_PORT || 3000);
const secureCookies = process.env.COOKIE_SECURE !== 'false';

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(session({
  store: new PgSession({ pool, tableName: 'admin_sessions', createTableIfMissing: true }),
  name: 'lm_admin_session',
  secret: process.env.SESSION_SECRET || 'development-only-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'strict', secure: secureCookies, maxAge: 8 * 60 * 60 * 1000 }
}));

const initialProducts = [
  { slug:'frutas-vermelhas', name:'Pudim de Frutas Vermelhas', short_description:'O encontro da cremosidade com o frescor das frutas.', description:'Textura cremosa, geleia caseira de frutas vermelhas e o toque delicado do leite em pó.', ingredients:'Caramelo, leite integral, creme de leite, ovos, açúcar, leite em pó, extrato de baunilha e geleia caseira de frutas vermelhas.', image:'/images/pudins/frutas-vermelhas.jfif', category:'Frutados', sort_order:1 },
  { slug:'laranja', name:'Pudim de Laranja', short_description:'Notas cítricas envolvidas por caramelo dourado.', description:'Um pudim aromático, equilibrando o doce do caramelo com o toque cítrico da laranja.', ingredients:'Caramelo, leite integral, creme de leite, ovos, açúcar, extrato de baunilha, raspas de laranja e geleia caseira de laranja.', image:'/images/pudins/laranja.jfif', category:'Frutados', sort_order:2 },
  { slug:'chocolate-cafe', name:'Pudim de Chocolate com Café', short_description:'Intensidade elegante para quem ama sabores marcantes.', description:'O café encontra a profundidade do chocolate em uma combinação intensa.', ingredients:'Caramelo, leite integral, creme de leite, ovos, açúcar, extrato de baunilha, chocolate em pó 70%, café solúvel e raspas de chocolate.', image:'/images/pudins/chocolate-cafe.jfif', category:'Intensos', sort_order:3 },
  { slug:'caldo-de-cana', name:'Pudim de Caldo de Cana', short_description:'Uma inspiração brasileira com notas de melaço e limão.', description:'Uma versão de inspiração brasileira, adoçada com redução de melaço caseiro.', ingredients:'Caramelo de melaço de cana, leite integral, creme de leite, ovos, melaço de cana, extrato de baunilha e raspas de limão.', image:'/images/pudins/caldo-de-cana.jfif', category:'Intensos', sort_order:4 },
  { slug:'maracuja', name:'Pudim de Maracujá', short_description:'O equilíbrio vibrante entre doçura e acidez tropical.', description:'Acidez suavizada pelo leite em pó, com contraste de textura das sementes de maracujá.', ingredients:'Caramelo, leite integral, creme de leite, ovos, açúcar, leite em pó integral, extrato de baunilha, sal, geleia caseira e sementes frescas de maracujá.', image:'/images/pudins/maracuja.jfif', category:'Frutados', sort_order:5 },
  { slug:'quatro-leites', name:'Pudim de 4 Leites', short_description:'Uma textura aveludada e uma cremosidade especial.', description:'Extremamente cremoso, doce na medida e finalizado com uma delicada cobertura em pó.', ingredients:'Caramelo, leite condensado, creme de leite, leite integral, leite em pó integral, ovos, extrato de baunilha e sal.', image:'/images/pudins/quatro-leites.jfif', category:'Cremosos', sort_order:6 },
  { slug:'romeu-julieta', name:'Pudim Romeu e Julieta', short_description:'A delicadeza do queijo com o sabor envolvente da goiabada.', description:'Pudim com cream cheese, contrastando com a doçura da goiabada.', ingredients:'Caramelo, leite integral, creme de leite, ovos, açúcar, cream cheese, extrato de baunilha, sal, geleia caseira de goiabada e queijo opcional para decoração.', image:'/images/pudins/romeu-julieta.jfif', category:'Frutados', sort_order:7 }
];

async function initDb() {
  await pool.query(`CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
    short_description TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
    ingredients TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Cremosos', nutrition JSONB NOT NULL DEFAULT '{}'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  for (const p of initialProducts) {
    await pool.query(`INSERT INTO products (slug,name,short_description,description,ingredients,image,category,sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (slug) DO NOTHING`,
      [p.slug,p.name,p.short_description,p.description,p.ingredients,p.image,p.category,p.sort_order]);
  }
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await pool.query(`INSERT INTO admin_users (username,password_hash) VALUES ($1,$2)
      ON CONFLICT (username) DO NOTHING`, [process.env.ADMIN_USERNAME, hash]);
  }
}
const isAdmin = (req,res,next) => req.session?.adminId ? next() : res.status(401).json({ error:'Sessão administrativa necessária.' });
const publicProduct = p => ({...p, nutrition: p.nutrition || {}});

app.get('/api/health', async (_req,res) => {
  try { await pool.query('SELECT 1'); res.json({status:'ok', database:'ok'}); }
  catch { res.status(503).json({status:'error', database:'unavailable'}); }
});
app.post('/api/auth/login', rateLimit({windowMs:15*60*1000, limit:10, standardHeaders:true, legacyHeaders:false}), async (req,res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');
  const result = await pool.query('SELECT id, username, password_hash FROM admin_users WHERE username=$1', [username]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({error:'Usuário ou senha inválidos.'});
  req.session.adminId = user.id;
  req.session.username = user.username;
  res.json({user:{username:user.username}});
});
app.get('/api/auth/me', (req,res) => req.session?.adminId ? res.json({user:{username:req.session.username}}) : res.status(401).json({error:'Não autenticado.'}));
app.post('/api/auth/logout', (req,res) => req.session.destroy(() => {res.clearCookie('lm_admin_session');res.status(204).end();}));
app.get('/api/products', async (_req,res) => {
  const result = await pool.query('SELECT * FROM products WHERE active=TRUE ORDER BY sort_order, id');
  res.json(result.rows.map(publicProduct));
});
app.get('/api/admin/products', isAdmin, async (_req,res) => {
  const result = await pool.query('SELECT * FROM products ORDER BY sort_order, id');
  res.json(result.rows.map(publicProduct));
});
app.post('/api/admin/products', isAdmin, async (req,res) => {
  const p = req.body || {};
  if (!String(p.slug||'').match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) || !String(p.name||'').trim()) return res.status(400).json({error:'Informe nome e identificador (slug) válido, usando letras minúsculas, números e hífens.'});
  try {
    const result = await pool.query(`INSERT INTO products (slug,name,short_description,description,ingredients,image,category,nutrition,active,sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [p.slug,p.name,p.short_description||'',p.description||'',p.ingredients||'',p.image||'',p.category||'Cremosos',JSON.stringify(p.nutrition||{}),p.active!==false,Number(p.sort_order)||0]);
    res.status(201).json(publicProduct(result.rows[0]));
  } catch (e) { if(e.code==='23505') return res.status(409).json({error:'Já existe um produto com esse identificador.'}); throw e; }
});
app.put('/api/admin/products/:id', isAdmin, async (req,res) => {
  const p = req.body || {};
  if (!String(p.name||'').trim()) return res.status(400).json({error:'O nome do produto é obrigatório.'});
  try {
    const result = await pool.query(`UPDATE products SET slug=$1,name=$2,short_description=$3,description=$4,ingredients=$5,image=$6,category=$7,nutrition=$8,active=$9,sort_order=$10,updated_at=NOW()
      WHERE id=$11 RETURNING *`, [p.slug,p.name,p.short_description||'',p.description||'',p.ingredients||'',p.image||'',p.category||'Cremosos',JSON.stringify(p.nutrition||{}),p.active!==false,Number(p.sort_order)||0,req.params.id]);
    if (!result.rowCount) return res.status(404).json({error:'Produto não encontrado.'});
    res.json(publicProduct(result.rows[0]));
  } catch (e) { if(e.code==='23505') return res.status(409).json({error:'Já existe um produto com esse identificador.'}); throw e; }
});
app.delete('/api/admin/products/:id', isAdmin, async (req,res) => {
  const result = await pool.query('DELETE FROM products WHERE id=$1 RETURNING id', [req.params.id]);
  if (!result.rowCount) return res.status(404).json({error:'Produto não encontrado.'});
  res.status(204).end();
});
app.use((err,_req,res,_next) => { console.error('API error:',err); res.status(500).json({error:'Erro interno do servidor.'}); });

initDb().then(() => app.listen(port,'0.0.0.0',() => console.log(`LM Pudins API ouvindo na porta ${port}`)))
  .catch(err => { console.error('Falha ao inicializar banco:',err); process.exit(1); });
