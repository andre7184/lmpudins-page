import express from 'express';
import session from 'express-session';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const { Pool } = pg;
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PgSession = connectPgSimple(session);
const port = Number(process.env.API_PORT || 3000);
const secureCookies = process.env.COOKIE_SECURE !== 'false';

mkdirSync('/data/uploads', { recursive: true });
app.disable('x-powered-by');
app.set('trust proxy', 1);
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  console.error('SESSION_SECRET precisa ter pelo menos 32 caracteres.');
  process.exit(1);
}
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(session({
  store: new PgSession({ pool, tableName: 'admin_sessions', createTableIfMissing: true }),
  name: 'lm_admin_session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'strict', secure: secureCookies, maxAge: 8 * 60 * 60 * 1000 }
}));

const initialProducts = [
  {
    "slug": "frutas-vermelhas",
    "name": "Pudim de Frutas Vermelhas",
    "short_description": "O encontro da cremosidade com o frescor das frutas.",
    "description": "Pudim cremoso com o sabor marcante das frutas vermelhas.",
    "ingredients": "Leite integral, creme de leite, ovos, açúcar refinado, leite em pó integral, pó de frutas vermelhas liofilizado, baunilha em pasta, polpa de frutas vermelhas, amido de milho e manteiga.",
    "image": "/images/pudins/frutas-vermelhas.jfif",
    "category": "Frutados",
    "sort_order": 1,
    "nutrition": {
      "porcao": "140 g (1 unidade / pote)",
      "nutrientes": [
        [
          "Valor energético",
          "220 kcal = 924 kJ",
          "11%"
        ],
        [
          "Carboidratos",
          "37 g",
          "12%"
        ],
        [
          "Açúcares totais",
          "31 g",
          "—"
        ],
        [
          "Açúcares adicionados",
          "24 g",
          "48%"
        ],
        [
          "Proteínas",
          "4,6 g",
          "6%"
        ],
        [
          "Gorduras totais",
          "6,5 g",
          "10%"
        ],
        [
          "Gorduras saturadas",
          "3,5 g",
          "16%"
        ],
        [
          "Gorduras trans",
          "0 g",
          "**"
        ],
        [
          "Fibra alimentar",
          "0,8 g",
          "3%"
        ],
        [
          "Sódio",
          "65 mg",
          "3%"
        ]
      ],
      "alergenicos": "CONTÉM LACTOSE. CONTÉM DERIVADOS DE LEITE E OVO. PODE CONTER TRAÇOS DE GLÚTEN.",
      "conservantes": "NÃO CONTÉM CONSERVANTES.",
      "nota_vd": "* Percentual de valores diários fornecidos pela porção. ** VD não estabelecido."
    }
  },
  {
    "slug": "laranja",
    "name": "Pudim de Laranja",
    "short_description": "Notas cítricas envolvidas por caramelo dourado.",
    "description": "Pudim aromático com raspas e suco de laranja.",
    "ingredients": "Leite integral, creme de leite, ovos, açúcar refinado, leite em pó integral, baunilha em pasta, raspas de laranja Bahia, suco de laranja e amido de milho.",
    "image": "/images/pudins/laranja.jfif",
    "category": "Frutados",
    "sort_order": 2,
    "nutrition": {
      "porcao": "140 g (1 unidade / pote)",
      "nutrientes": [
        [
          "Valor energético",
          "205 kcal = 861 kJ",
          "10%"
        ],
        [
          "Carboidratos",
          "36 g",
          "12%"
        ],
        [
          "Açúcares totais",
          "30 g",
          "—"
        ],
        [
          "Açúcares adicionados",
          "24 g",
          "48%"
        ],
        [
          "Proteínas",
          "4,5 g",
          "6%"
        ],
        [
          "Gorduras totais",
          "5,5 g",
          "8%"
        ],
        [
          "Gorduras saturadas",
          "3,0 g",
          "14%"
        ],
        [
          "Gorduras trans",
          "0 g",
          "**"
        ],
        [
          "Fibra alimentar",
          "0,5 g",
          "2%"
        ],
        [
          "Sódio",
          "60 mg",
          "3%"
        ]
      ],
      "alergenicos": "CONTÉM LACTOSE. CONTÉM DERIVADOS DE LEITE E OVO. PODE CONTER TRAÇOS DE GLÚTEN.",
      "conservantes": "NÃO CONTÉM CONSERVANTES.",
      "nota_vd": "* Percentual de valores diários fornecidos pela porção. ** VD não estabelecido."
    }
  },
  {
    "slug": "chocolate-cafe",
    "name": "Pudim de Chocolate com Café",
    "short_description": "Intensidade elegante para quem ama sabores marcantes.",
    "description": "Chocolate e café em uma combinação intensa e sofisticada.",
    "ingredients": "Leite integral, creme de leite, ovos, açúcar refinado, cacau em pó 50%, café solúvel e baunilha em pasta.",
    "image": "/images/pudins/chocolate-cafe.jfif",
    "category": "Intensos",
    "sort_order": 3,
    "nutrition": {
      "porcao": "140 g (1 unidade / pote)",
      "nutrientes": [
        [
          "Valor energético",
          "200 kcal = 840 kJ",
          "10%"
        ],
        [
          "Carboidratos",
          "32 g",
          "11%"
        ],
        [
          "Açúcares totais",
          "26 g",
          "—"
        ],
        [
          "Açúcares adicionados",
          "22 g",
          "44%"
        ],
        [
          "Proteínas",
          "5,0 g",
          "7%"
        ],
        [
          "Gorduras totais",
          "6,0 g",
          "9%"
        ],
        [
          "Gorduras saturadas",
          "3,5 g",
          "16%"
        ],
        [
          "Gorduras trans",
          "0 g",
          "**"
        ],
        [
          "Fibra alimentar",
          "1,5 g",
          "6%"
        ],
        [
          "Sódio",
          "60 mg",
          "3%"
        ]
      ],
      "alergenicos": "CONTÉM LACTOSE. CONTÉM DERIVADOS DE LEITE E OVO. PODE CONTER TRAÇOS DE GLÚTEN.",
      "conservantes": "NÃO CONTÉM CONSERVANTES.",
      "nota_vd": "* Percentual de valores diários fornecidos pela porção. ** VD não estabelecido."
    }
  },
  {
    "slug": "caldo-de-cana",
    "name": "Pudim Caldo de Cana",
    "short_description": "Uma inspiração brasileira com notas de melaço e limão.",
    "description": "Pudim com melaço de cana reduzido e toque de limão.",
    "ingredients": "Leite integral, creme de leite, ovos, melaço de cana reduzido, suco de limão e baunilha em pasta.",
    "image": "/images/pudins/caldo-de-cana.jfif",
    "category": "Intensos",
    "sort_order": 4,
    "nutrition": {
      "porcao": "140 g (1 unidade / pote)",
      "nutrientes": [
        [
          "Valor energético",
          "205 kcal = 861 kJ",
          "10%"
        ],
        [
          "Carboidratos",
          "36 g",
          "12%"
        ],
        [
          "Açúcares totais",
          "32 g",
          "—"
        ],
        [
          "Açúcares adicionados",
          "25 g",
          "50%"
        ],
        [
          "Proteínas",
          "4,0 g",
          "5%"
        ],
        [
          "Gorduras totais",
          "5,0 g",
          "8%"
        ],
        [
          "Gorduras saturadas",
          "2,8 g",
          "13%"
        ],
        [
          "Gorduras trans",
          "0 g",
          "**"
        ],
        [
          "Fibra alimentar",
          "0 g",
          "0%"
        ],
        [
          "Sódio",
          "55 mg",
          "2%"
        ]
      ],
      "alergenicos": "CONTÉM LACTOSE. CONTÉM DERIVADOS DE LEITE E OVO. PODE CONTER TRAÇOS DE GLÚTEN.",
      "conservantes": "NÃO CONTÉM CONSERVANTES.",
      "nota_vd": "* Açúcares adicionados provenientes do melaço de cana reduzido. ** VD não estabelecido."
    }
  },
  {
    "slug": "maracuja",
    "name": "Pudim de Maracujá",
    "short_description": "O equilíbrio vibrante entre doçura e acidez tropical.",
    "description": "Pudim com polpa de maracujá e equilíbrio entre doçura e acidez.",
    "ingredients": "Leite integral, creme de leite, ovos, açúcar refinado, leite em pó integral, baunilha em pasta, polpa de maracujá, amido de milho e manteiga.",
    "image": "/images/pudins/maracuja.jfif",
    "category": "Frutados",
    "sort_order": 5,
    "nutrition": {
      "porcao": "140 g (1 unidade / pote)",
      "nutrientes": [
        [
          "Valor energético",
          "215 kcal = 903 kJ",
          "11%"
        ],
        [
          "Carboidratos",
          "35 g",
          "12%"
        ],
        [
          "Açúcares totais",
          "29 g",
          "—"
        ],
        [
          "Açúcares adicionados",
          "23 g",
          "46%"
        ],
        [
          "Proteínas",
          "4,5 g",
          "6%"
        ],
        [
          "Gorduras totais",
          "6,0 g",
          "9%"
        ],
        [
          "Gorduras saturadas",
          "3,2 g",
          "15%"
        ],
        [
          "Gorduras trans",
          "0 g",
          "**"
        ],
        [
          "Fibra alimentar",
          "0,6 g",
          "2%"
        ],
        [
          "Sódio",
          "60 mg",
          "3%"
        ]
      ],
      "alergenicos": "CONTÉM LACTOSE. CONTÉM DERIVADOS DE LEITE E OVO. PODE CONTER TRAÇOS DE GLÚTEN.",
      "conservantes": "NÃO CONTÉM CONSERVANTES.",
      "nota_vd": "* Percentual de valores diários fornecidos pela porção. ** VD não estabelecido."
    }
  },
  {
    "slug": "quatro-leites",
    "name": "Pudim de 4 Leites",
    "short_description": "Uma textura aveludada e uma cremosidade especial.",
    "description": "Uma receita muito cremosa que combina quatro formas de leite.",
    "ingredients": "Leite condensado, creme de leite, leite integral, leite em pó integral, ovos e baunilha em pasta.",
    "image": "/images/pudins/quatro-leites.jfif",
    "category": "Cremosos",
    "sort_order": 6,
    "nutrition": {
      "porcao": "140 g (1 unidade / pote)",
      "nutrientes": [
        [
          "Valor energético",
          "245 kcal = 1029 kJ",
          "12%"
        ],
        [
          "Carboidratos",
          "37 g",
          "12%"
        ],
        [
          "Açúcares totais",
          "32 g",
          "—"
        ],
        [
          "Açúcares adicionados",
          "26 g",
          "52%"
        ],
        [
          "Proteínas",
          "7,0 g",
          "10%"
        ],
        [
          "Gorduras totais",
          "8,0 g",
          "12%"
        ],
        [
          "Gorduras saturadas",
          "4,5 g",
          "20%"
        ],
        [
          "Gorduras trans",
          "0 g",
          "**"
        ],
        [
          "Fibra alimentar",
          "0 g",
          "0%"
        ],
        [
          "Sódio",
          "95 mg",
          "4%"
        ]
      ],
      "alergenicos": "CONTÉM LACTOSE. CONTÉM DERIVADOS DE LEITE E OVO. PODE CONTER TRAÇOS DE GLÚTEN.",
      "conservantes": "NÃO CONTÉM CONSERVANTES.",
      "nota_vd": "* Percentual de valores diários fornecidos pela porção. ** VD não estabelecido."
    }
  },
  {
    "slug": "romeu-julieta",
    "name": "Pudim Romeu e Julieta",
    "short_description": "A delicadeza do queijo com o sabor envolvente da goiabada.",
    "description": "A combinação clássica de cream cheese e goiaba em uma versão cremosa.",
    "ingredients": "Leite integral, creme de leite, ovos, açúcar refinado, cream cheese, baunilha em pasta, polpa de goiaba e amido de milho.",
    "image": "/images/pudins/romeu-julieta.jfif",
    "category": "Frutados",
    "sort_order": 7,
    "nutrition": {
      "porcao": "140 g (1 unidade / pote)",
      "nutrientes": [
        [
          "Valor energético",
          "240 kcal = 1008 kJ",
          "12%"
        ],
        [
          "Carboidratos",
          "28 g",
          "9%"
        ],
        [
          "Açúcares totais",
          "23 g",
          "—"
        ],
        [
          "Açúcares adicionados",
          "18 g",
          "36%"
        ],
        [
          "Proteínas",
          "6,0 g",
          "8%"
        ],
        [
          "Gorduras totais",
          "12 g",
          "18%"
        ],
        [
          "Gorduras saturadas",
          "7,0 g",
          "32%"
        ],
        [
          "Gorduras trans",
          "0 g",
          "**"
        ],
        [
          "Fibra alimentar",
          "0,3 g",
          "1%"
        ],
        [
          "Sódio",
          "110 mg",
          "5%"
        ]
      ],
      "alergenicos": "CONTÉM LACTOSE. CONTÉM DERIVADOS DE LEITE E OVO. PODE CONTER TRAÇOS DE GLÚTEN.",
      "conservantes": "NÃO CONTÉM CONSERVANTES.",
      "nota_vd": "* Percentual de valores diários fornecidos pela porção. ** VD não estabelecido."
    }
  }
];

async function initDb() {
  await pool.query(`CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
    short_description TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
    ingredients TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', images JSONB NOT NULL DEFAULT '[]'::jsonb,
    category TEXT NOT NULL DEFAULT 'Cremosos', nutrition JSONB NOT NULL DEFAULT '{}'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb`);
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS catalog_seed_versions (
    version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const seedVersion = 'catalogo-nutricional-2026-10-v1';
  const seedCheck = await pool.query('SELECT 1 FROM catalog_seed_versions WHERE version=$1', [seedVersion]);
  if (seedCheck.rowCount === 0) {
    for (const p of initialProducts) {
      await pool.query(`INSERT INTO products (slug,name,short_description,description,ingredients,image,category,sort_order,nutrition)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
        ON CONFLICT (slug) DO UPDATE SET
          name=EXCLUDED.name, short_description=EXCLUDED.short_description,
          description=EXCLUDED.description, ingredients=EXCLUDED.ingredients,
          image=EXCLUDED.image, category=EXCLUDED.category, sort_order=EXCLUDED.sort_order,
          nutrition=EXCLUDED.nutrition, updated_at=NOW()`,
        [p.slug,p.name,p.short_description,p.description,p.ingredients,p.image,p.category,p.sort_order,JSON.stringify(p.nutrition)]);
    }
    await pool.query('INSERT INTO catalog_seed_versions (version) VALUES ($1) ON CONFLICT DO NOTHING', [seedVersion]);
  }
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await pool.query(`INSERT INTO admin_users (username,password_hash) VALUES ($1,$2)
      ON CONFLICT (username) DO NOTHING`, [process.env.ADMIN_USERNAME, hash]);
  }
}
const isAdmin = (req,res,next) => req.session?.adminId ? next() : res.status(401).json({ error:'Sessão administrativa necessária.' });
app.use('/uploads', express.static('/data/uploads', { maxAge: '1d', immutable: true, dotfiles: 'deny' }));
const allowedImageTypes = { 'image/jpeg':'jpg', 'image/png':'png', 'image/webp':'webp', 'image/avif':'avif' };
const imageUpload = multer({ storage: multer.diskStorage({ destination: '/data/uploads', filename: (_req,file,cb) => cb(null, randomUUID() + '.' + (allowedImageTypes[file.mimetype] || 'bin')) }), fileFilter: (_req,file,cb) => allowedImageTypes[file.mimetype] ? cb(null,true) : cb(new Error('Formato não permitido. Use JPG, PNG, WebP ou AVIF.')), limits: { fileSize: 5 * 1024 * 1024 } });
app.post('/api/admin/uploads', isAdmin, imageUpload.single('image'), (req,res) => {
  if (!req.file) return res.status(400).json({ error:'Selecione uma imagem.' });
  res.status(201).json({ url:'/uploads/' + req.file.filename, filename:req.file.filename, size:req.file.size });
});
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
    const result = await pool.query(`INSERT INTO products (slug,name,short_description,description,ingredients,image,images,category,nutrition,active,sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9::jsonb,$10,$11) RETURNING *`,
      [p.slug,p.name,p.short_description||'',p.description||'',p.ingredients||'',p.image||'',JSON.stringify(Array.isArray(p.images)?p.images:[]),p.category||'Cremosos',JSON.stringify(p.nutrition||{}),p.active!==false,Number(p.sort_order)||0]);
    res.status(201).json(publicProduct(result.rows[0]));
  } catch (e) { if(e.code==='23505') return res.status(409).json({error:'Já existe um produto com esse identificador.'}); throw e; }
});
app.put('/api/admin/products/:id', isAdmin, async (req,res) => {
  const p = req.body || {};
  if (!String(p.slug||'').match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) || !String(p.name||'').trim()) return res.status(400).json({error:'Informe nome e identificador (slug) válido.'});
  try {
    const result = await pool.query(`UPDATE products SET slug=$1,name=$2,short_description=$3,description=$4,ingredients=$5,image=$6,images=$7::jsonb,category=$8,nutrition=$9::jsonb,active=$10,sort_order=$11,updated_at=NOW()
      WHERE id=$12 RETURNING *`, [p.slug,p.name,p.short_description||'',p.description||'',p.ingredients||'',p.image||'',JSON.stringify(Array.isArray(p.images)?p.images:[]),p.category||'Cremosos',JSON.stringify(p.nutrition||{}),p.active!==false,Number(p.sort_order)||0,req.params.id]);
    if (!result.rowCount) return res.status(404).json({error:'Produto não encontrado.'});
    res.json(publicProduct(result.rows[0]));
  } catch (e) { if(e.code==='23505') return res.status(409).json({error:'Já existe um produto com esse identificador.'}); throw e; }
});
app.delete('/api/admin/products/:id', isAdmin, async (req,res) => {
  const result = await pool.query('DELETE FROM products WHERE id=$1 RETURNING id', [req.params.id]);
  if (!result.rowCount) return res.status(404).json({error:'Produto não encontrado.'});
  res.status(204).end();
});
app.use((err,_req,res,_next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'A imagem deve ter no máximo 5 MB.' : 'Não foi possível receber o arquivo.' });
  if (err.message?.startsWith('Formato não permitido.')) return res.status(400).json({ error: err.message });
  console.error('API error:',err);
  res.status(500).json({error:'Erro interno do servidor.'});
});

initDb().then(() => app.listen(port,'0.0.0.0',() => console.log(`LM Pudins API ouvindo na porta ${port}`)))
  .catch(err => { console.error('Falha ao inicializar banco:',err); process.exit(1); });
