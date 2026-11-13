import express from 'express';
import session from 'express-session';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { randomUUID, randomBytes, timingSafeEqual } from 'node:crypto';

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
  cookie: { httpOnly: true, sameSite: 'lax', secure: secureCookies, maxAge: 8 * 60 * 60 * 1000 }
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
    presentations JSONB NOT NULL DEFAULT '[]'::jsonb, components JSONB NOT NULL DEFAULT '{}'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS presentations JSONB NOT NULL DEFAULT '[]'::jsonb`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS components JSONB NOT NULL DEFAULT '{}'::jsonb`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS integration_id TEXT`);
  await pool.query(`CREATE TABLE IF NOT EXISTS media_library (
    id BIGSERIAL PRIMARY KEY, url TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Institucional', active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`ALTER TABLE media_library ADD COLUMN IF NOT EXISTS destination TEXT NOT NULL DEFAULT 'geral'`);
  await pool.query(`ALTER TABLE media_library ADD COLUMN IF NOT EXISTS version_name TEXT NOT NULL DEFAULT ''`);
  await pool.query(`ALTER TABLE media_library ADD COLUMN IF NOT EXISTS version_description TEXT NOT NULL DEFAULT ''`);
  await pool.query(`ALTER TABLE media_library ADD COLUMN IF NOT EXISTS version_sizes JSONB NOT NULL DEFAULT '[]'::jsonb`);
  await pool.query(`ALTER TABLE media_library ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE`);
  await pool.query(`ALTER TABLE media_library ADD COLUMN IF NOT EXISTS placement_key TEXT NOT NULL DEFAULT ''`);
  await pool.query(`ALTER TABLE media_library ADD COLUMN IF NOT EXISTS show_in_gallery BOOLEAN NOT NULL DEFAULT TRUE`);
  const defaultSiteAssets = [
    ['Logo do cabeçalho','/images/Logo%20circular.png','header-logo'],
    ['Logo da seção inicial','/images/Logo%20circular.png','intro-logo'],
    ['Imagem principal do início','/images/campanha/hero-pudim.jfif','hero-image'],
    ['Imagem da seção de destaque','/images/campanha/detalhe-caramelo.jfif','feature-image'],
    ['Logo de Quem somos','/images/Logo%20circular.png','about-logo'],
    ['Logo da seção de contato','/images/Logo%20vertical.png','contact-logo'],
    ['Logo do rodapé','/images/Logo%20horizontal.png','footer-logo']
  ];
  for (const [description,url,placement] of defaultSiteAssets) {
    await pool.query(`INSERT INTO media_library(url,description,category,destination,placement_key,show_in_gallery)
      SELECT $1,$2,'Institucional','geral',$3,FALSE
      WHERE NOT EXISTS (SELECT 1 FROM media_library WHERE placement_key=$3)`,
      [url,description,placement]);
  }
  await pool.query(`CREATE TABLE IF NOT EXISTS product_versions (
    id BIGSERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
    short_description TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '', detail_image TEXT NOT NULL DEFAULT '',
    gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb, sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_product_versions_active_order ON product_versions(active,sort_order,id)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS catalog_seed_versions (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  // Apresentações padrão independentes dos sabores. Valores exibidos ao cliente, sem pesos de montagem.
  const defaultVersions = [
    { slug:'copo-americano', name:'Copo americano', short_description:'Uma apresentação prática e individual.', description:'Pudim servido em copo americano, pronto para apreciar.', sizes:[{name:'140 g',description:'Porção individual em copo americano.',bestUse:'Consumo individual'}], sort_order:1 },
    { slug:'forminha', name:'Forminha', short_description:'Pudim em forminha, com geleia acondicionada separadamente.', description:'A apresentação acompanha o pudim e sua geleia em embalagens separadas, acomodadas em uma caixa.', sizes:[
      {name:'Mini',description:'Pudim acompanhado de geleia em embalagem separada.',bestUse:'Porção individual'},
      {name:'Pequeno',description:'Pudim acompanhado de geleia em embalagem separada.',bestUse:'Porção individual'},
      {name:'Médio · 500 g',description:'Pudim e geleia acondicionados separadamente dentro da caixa.',bestUse:'Compartilhar'},
      {name:'Grande',description:'Pudim acompanhado de geleia em embalagem separada.',bestUse:'Compartilhar'}
    ], sort_order:2 }
  ];
  for (const version of defaultVersions) {
    await pool.query(`INSERT INTO product_versions(slug,name,short_description,description,sizes,active,sort_order)
      VALUES($1,$2,$3,$4,$5::jsonb,TRUE,$6) ON CONFLICT(slug) DO NOTHING`,
      [version.slug,version.name,version.short_description,version.description,JSON.stringify(version.sizes),version.sort_order]);
  }
  const publicVersionSeed = 'public-version-customer-display-v2';
  const publicVersionSeedApplied = await pool.query('SELECT 1 FROM catalog_seed_versions WHERE version=$1',[publicVersionSeed]);
  if (!publicVersionSeedApplied.rowCount) {
    for (const version of defaultVersions) {
      await pool.query(`UPDATE product_versions SET short_description=$1,description=$2,sizes=$3::jsonb,updated_at=NOW()
        WHERE slug=$4 AND updated_at=created_at`,
        [version.short_description,version.description,JSON.stringify(version.sizes),version.slug]);
    }
    await pool.query('INSERT INTO catalog_seed_versions(version) VALUES($1) ON CONFLICT DO NOTHING',[publicVersionSeed]);
  }

  await pool.query(`CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS api_integration_settings (
    id SMALLINT PRIMARY KEY CHECK (id = 1), api_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS catalog_seed_versions (
    version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const defaultPresentations = [
    { key:'copo', name:'Copo americano', sizes:[{ name:'150 g', nominalWeightG:150, finalWeightG:140, components:{ carameloG:{min:20,max:25}, massaG:115, geleiaG:{min:20,max:25} } }] },
    { key:'forminha', name:'Forminha', sizes:[
      { name:'Mini', nominalWeightG:80, finalWeightG:null, components:{ carameloG:10, massaG:75, geleiaG:20 } },
      { name:'Pequeno', nominalWeightG:120, finalWeightG:null, components:{ carameloG:15, massaG:110, geleiaG:30 } },
      { name:'Médio', nominalWeightG:380, finalWeightG:null, components:{ carameloG:40, massaG:380, geleiaG:80 } },
      { name:'Grande', nominalWeightG:800, finalWeightG:null, components:{ carameloG:80, massaG:800, geleiaG:160 } }
    ] }
  ];
  const emptyComponents = { massa:{ ingredients:[], nutritionPer100g:{} }, caramelo:{ ingredients:[], nutritionPer100g:{} }, geleia:{ ingredients:[], nutritionPer100g:{} } };
  // Reinsere apenas produtos-padrão ausentes, sem sobrescrever edições feitas pelo admin.
  for (const p of initialProducts) {
    await pool.query(`INSERT INTO products (slug,name,short_description,description,ingredients,image,category,sort_order,nutrition,integration_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10)
      ON CONFLICT (slug) DO NOTHING`,
      [p.slug,p.name,p.short_description,p.description,p.ingredients,p.image,p.category,p.sort_order,JSON.stringify(p.nutrition),randomUUID()]);
  }
  // Disponibiliza os modelos de apresentação para os sabores existentes sem sobrescrever configurações do admin.
  await pool.query("UPDATE products SET presentations=$1::jsonb WHERE presentations='[]'::jsonb", [JSON.stringify(defaultPresentations)]);
  await pool.query("UPDATE products SET components=$1::jsonb WHERE components='{}'::jsonb", [JSON.stringify(emptyComponents)]);
  const productsWithoutIntegrationId = await pool.query("SELECT id FROM products WHERE integration_id IS NULL OR integration_id = ''");
  for (const product of productsWithoutIntegrationId.rows) {
    await pool.query('UPDATE products SET integration_id=$1 WHERE id=$2', [randomUUID(), product.id]);
  }
  await pool.query('ALTER TABLE products ALTER COLUMN integration_id SET NOT NULL');
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS products_integration_id_uidx ON products(integration_id)');
  await pool.query(`INSERT INTO api_integration_settings (id,api_key) VALUES (1,$1) ON CONFLICT (id) DO NOTHING`, [randomBytes(32).toString('hex')]);
  const seedVersion = 'catalogo-nutricional-2026-10-v1';
  await pool.query('INSERT INTO catalog_seed_versions (version) VALUES ($1) ON CONFLICT DO NOTHING', [seedVersion]);
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
  // Garante uma sessão nova e persiste o cookie antes de confirmar o login.
  req.session.regenerate((regenerateError) => {
    if (regenerateError) {
      console.error('Falha ao criar sessão administrativa:', regenerateError);
      return res.status(500).json({error:'Não foi possível iniciar a sessão administrativa.'});
    }
    req.session.adminId = user.id;
    req.session.username = user.username;
    req.session.save((saveError) => {
      if (saveError) {
        console.error('Falha ao salvar sessão administrativa:', saveError);
        return res.status(500).json({error:'Não foi possível salvar a sessão administrativa.'});
      }
      res.json({user:{username:user.username}});
    });
  });
});
app.get('/api/auth/me', (req,res) => req.session?.adminId ? res.json({user:{username:req.session.username}}) : res.status(401).json({error:'Não autenticado.'}));
app.post('/api/admin/integration/rotate', isAdmin, async (_req,res) => {
  const apiKey = randomBytes(32).toString('hex');
  const result = await pool.query('UPDATE api_integration_settings SET api_key=$1,updated_at=NOW() WHERE id=1 RETURNING api_key', [apiKey]);
  if (!result.rowCount) return res.status(503).json({error:'A integração ainda não foi inicializada.'});
  res.json({success:true,apiKey:result.rows[0].api_key});
});
app.get('/api/admin/integration', isAdmin, async (_req,res) => {
  const result = await pool.query('SELECT api_key FROM api_integration_settings WHERE id=1');
  if (!result.rowCount) return res.status(503).json({error:'A integração ainda não foi inicializada.'});
  const publicBaseUrl = String(process.env.PUBLIC_SITE_URL || 'https://www.lmpudins.com.br').replace(/\/+$/, '');
  res.json({apiUrl: publicBaseUrl + '/api/integrations/products', apiKey: result.rows[0].api_key, headerName:'X-LM-API-Key'});
});
app.post('/api/auth/logout', (req,res) => req.session.destroy(() => {res.clearCookie('lm_admin_session');res.status(204).end();}));
const integrationRateLimit = rateLimit({windowMs:60*1000, limit:60, standardHeaders:true, legacyHeaders:false});
async function integrationKeyIsValid(req) {
  const suppliedKey = String(req.get('X-LM-API-Key') || '');
  const keyResult = await pool.query('SELECT api_key FROM api_integration_settings WHERE id=1');
  const expectedKey = keyResult.rows[0]?.api_key || '';
  const suppliedBuffer = Buffer.from(suppliedKey);
  const expectedBuffer = Buffer.from(expectedKey);
  return suppliedBuffer.length === expectedBuffer.length && suppliedBuffer.length > 0 && timingSafeEqual(suppliedBuffer, expectedBuffer);
}
app.post('/api/integrations/products/test', integrationRateLimit, async (req,res) => {
  if (!(await integrationKeyIsValid(req))) return res.status(401).json({success:false,code:'INVALID_TOKEN',message:'Token inválido ou não autorizado.'});
  res.json({success:true,code:'AUTHENTICATED',message:'Autenticação realizada com sucesso. API LM Pudins disponível.'});
});
app.get('/api/integrations/products/:integrationId/validate', integrationRateLimit, async (req,res) => {
  if (!(await integrationKeyIsValid(req))) return res.status(401).json({success:false,code:'INVALID_TOKEN',message:'Token inválido ou não autorizado.'});
  const result = await pool.query('SELECT integration_id,slug,name,active FROM products WHERE integration_id=$1', [req.params.integrationId]);
  if (!result.rowCount) return res.status(404).json({success:false,code:'PRODUCT_NOT_FOUND',message:'Token autenticado, mas o ID de integração não corresponde a nenhum produto.'});
  res.json({success:true,code:'PRODUCT_FOUND',message:'Autenticação e vínculo do produto confirmados.',product:result.rows[0]});
});
app.post('/api/integrations/products/:integrationId/nutrition', integrationRateLimit, async (req,res) => {
  if (!(await integrationKeyIsValid(req))) return res.status(401).json({error:'Chave de integração inválida.'});
  const nutrition = req.body?.nutrition;
  if (!nutrition || typeof nutrition !== 'object' || Array.isArray(nutrition) || !Object.keys(nutrition).length) {
    return res.status(400).json({error:'Envie a tabela nutricional no campo nutrition como um objeto JSON não vazio.'});
  }
  const result = await pool.query('UPDATE products SET nutrition=$1::jsonb,updated_at=NOW() WHERE integration_id=$2 RETURNING integration_id,slug,name,updated_at', [JSON.stringify(nutrition), req.params.integrationId]);
  if (!result.rowCount) return res.status(404).json({error:'Produto não encontrado para o ID de integração informado.'});
  res.json({success:true,message:'Tabela nutricional atualizada.',product:result.rows[0]});
});
app.get('/api/gallery', async (_req,res) => { const result=await pool.query('SELECT id,url,description,category,destination,version_name,version_description,version_sizes,is_primary FROM media_library WHERE active=TRUE AND show_in_gallery=TRUE ORDER BY id DESC'); res.json(result.rows); });
app.get('/api/site-assets', async (_req,res) => { const result=await pool.query("SELECT id,url,description,placement_key FROM media_library WHERE active=TRUE AND placement_key<>'' ORDER BY id DESC"); res.json(result.rows); });
app.get('/api/admin/gallery', isAdmin, async (_req,res) => { const result=await pool.query('SELECT * FROM media_library ORDER BY id DESC'); res.json(result.rows); });
app.post('/api/admin/gallery', isAdmin, async (req,res) => {
  const {url,description,category,destination,version_name,version_description,version_sizes,is_primary,placement_key,show_in_gallery}=req.body||{};
  if(!url) return res.status(400).json({error:'Envie uma imagem antes de salvar.'});
  const mediaDestination=['geral','versoes'].includes(destination)?destination:'geral';
  if(mediaDestination==='versoes'&&!String(version_name||'').trim()) return res.status(400).json({error:'Informe a versão/apresentação da imagem.'});
  const sizes=Array.isArray(version_sizes)?version_sizes:[];
  const client=await pool.connect();
  try{await client.query('BEGIN');if(mediaDestination==='versoes'&&is_primary)await client.query('UPDATE media_library SET is_primary=FALSE WHERE LOWER(version_name)=LOWER($1)',[String(version_name).trim()]);
    const result=await client.query('INSERT INTO media_library(url,description,category,destination,version_name,version_description,version_sizes,is_primary,placement_key,show_in_gallery) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10) RETURNING *',[url,String(description||''),String(category||'Institucional'),mediaDestination,mediaDestination==='versoes'?String(version_name).trim():'',mediaDestination==='versoes'?String(version_description||''):'',JSON.stringify(mediaDestination==='versoes'?sizes:[]),mediaDestination==='versoes'&&Boolean(is_primary),String(placement_key||''),show_in_gallery!==false]);
    await client.query('COMMIT');res.status(201).json(result.rows[0]);
  }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
});
app.put('/api/admin/gallery/:id', isAdmin, async (req,res) => { const {description,category,placement_key,show_in_gallery}=req.body||{}; const result=await pool.query('UPDATE media_library SET description=$1,category=$2,placement_key=$3,show_in_gallery=$4 WHERE id=$5 RETURNING *',[String(description||''),String(category||'Institucional'),String(placement_key||''),Boolean(show_in_gallery),req.params.id]); if(!result.rowCount)return res.status(404).json({error:'Imagem não encontrada.'}); res.json(result.rows[0]); });
app.delete('/api/admin/gallery/:id', isAdmin, async (req,res) => { const result=await pool.query('DELETE FROM media_library WHERE id=$1 RETURNING id',[req.params.id]); if(!result.rowCount)return res.status(404).json({error:'Imagem não encontrada.'}); res.status(204).end(); });
app.get('/api/versions', async (_req,res) => { const result=await pool.query('SELECT * FROM product_versions WHERE active=TRUE ORDER BY sort_order,id'); res.json(result.rows); });
app.get('/api/admin/versions', isAdmin, async (_req,res) => { const result=await pool.query('SELECT * FROM product_versions ORDER BY sort_order,id'); res.json(result.rows); });
app.post('/api/admin/versions', isAdmin, async (req,res) => {
 const v=req.body||{};if(!String(v.slug||'').match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)||!String(v.name||'').trim())return res.status(400).json({error:'Informe nome e identificador válido.'});
 try{const r=await pool.query('INSERT INTO product_versions(slug,name,short_description,description,image,detail_image,gallery_images,sizes,active,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10) RETURNING *',[v.slug,v.name.trim(),v.short_description||'',v.description||'',v.image||'',v.detail_image||'',JSON.stringify(Array.isArray(v.gallery_images)?v.gallery_images:[]),JSON.stringify(Array.isArray(v.sizes)?v.sizes:[]),v.active!==false,Number(v.sort_order)||0]);res.status(201).json(r.rows[0]);}catch(e){if(e.code==='23505')return res.status(409).json({error:'Já existe uma versão com esse identificador.'});throw e}
});
app.put('/api/admin/versions/:id', isAdmin, async (req,res) => {
 const v=req.body||{};if(!String(v.slug||'').match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)||!String(v.name||'').trim())return res.status(400).json({error:'Informe nome e identificador válido.'});
 try{const r=await pool.query('UPDATE product_versions SET slug=$1,name=$2,short_description=$3,description=$4,image=$5,detail_image=$6,gallery_images=$7::jsonb,sizes=$8::jsonb,active=$9,sort_order=$10,updated_at=NOW() WHERE id=$11 RETURNING *',[v.slug,v.name.trim(),v.short_description||'',v.description||'',v.image||'',v.detail_image||'',JSON.stringify(Array.isArray(v.gallery_images)?v.gallery_images:[]),JSON.stringify(Array.isArray(v.sizes)?v.sizes:[]),v.active!==false,Number(v.sort_order)||0,req.params.id]);if(!r.rowCount)return res.status(404).json({error:'Versão não encontrada.'});res.json(r.rows[0]);}catch(e){if(e.code==='23505')return res.status(409).json({error:'Já existe uma versão com esse identificador.'});throw e}
});
app.delete('/api/admin/versions/:id', isAdmin, async (req,res) => {const r=await pool.query('DELETE FROM product_versions WHERE id=$1 RETURNING id',[req.params.id]);if(!r.rowCount)return res.status(404).json({error:'Versão não encontrada.'});res.status(204).end();});
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
    const result = await pool.query(`INSERT INTO products (slug,name,short_description,description,ingredients,image,images,category,nutrition,presentations,components,active,sort_order,integration_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12,$13,$14) RETURNING *`,
      [p.slug,p.name,p.short_description||'',p.description||'',p.ingredients||'',p.image||'',JSON.stringify(Array.isArray(p.images)?p.images:[]),p.category||'Cremosos',JSON.stringify(p.nutrition||{}),JSON.stringify(Array.isArray(p.presentations)?p.presentations:[]),JSON.stringify(p.components&&typeof p.components==='object'&&!Array.isArray(p.components)?p.components:{}),p.active!==false,Number(p.sort_order)||0,randomUUID()]);
    res.status(201).json(publicProduct(result.rows[0]));
  } catch (e) { if(e.code==='23505') return res.status(409).json({error:'Já existe um produto com esse identificador.'}); throw e; }
});
app.put('/api/admin/products/:id', isAdmin, async (req,res) => {
  const p = req.body || {};
  if (!String(p.slug||'').match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) || !String(p.name||'').trim()) return res.status(400).json({error:'Informe nome e identificador (slug) válido.'});
  try {
    const result = await pool.query(`UPDATE products SET slug=$1,name=$2,short_description=$3,description=$4,ingredients=$5,image=$6,images=COALESCE($7::jsonb,images),category=$8,nutrition=$9::jsonb,presentations=$10::jsonb,components=$11::jsonb,active=$12,sort_order=$13,updated_at=NOW()
      WHERE id=$14 RETURNING *`, [p.slug,p.name,p.short_description||'',p.description||'',p.ingredients||'',p.image||'',p.images === undefined ? null : JSON.stringify(Array.isArray(p.images)?p.images:[]),p.category||'Cremosos',JSON.stringify(p.nutrition||{}),JSON.stringify(Array.isArray(p.presentations)?p.presentations:[]),JSON.stringify(p.components&&typeof p.components==='object'&&!Array.isArray(p.components)?p.components:{}),p.active!==false,Number(p.sort_order)||0,req.params.id]);
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
