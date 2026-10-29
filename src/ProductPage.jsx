import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

export default function ProductPage() {
  const slug = decodeURIComponent(window.location.pathname.split('/').filter(Boolean)[1] || '');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/products')
      .then((response) => { if (!response.ok) throw new Error('Não foi possível carregar o catálogo.'); return response.json(); })
      .then((items) => {
        if (cancelled) return;
        const found = items.find((item) => item.slug === slug && item.active !== false);
        setProduct(found || null);
        document.title = found ? found.name + ' | LM Pudins' : 'Produto não encontrado | LM Pudins';
        const description = found ? found.short_description : 'Conheça os sabores da LM Pudins.';
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
        meta.content = description;
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  const goBack = () => { window.location.href = '/#sabores'; };
  if (loading) return <main style={styles.page}><p>Carregando informações do produto…</p></main>;
  if (error || !product) return <main style={styles.page}><a style={styles.back} href="/#sabores">← Voltar aos sabores</a><h1>Produto não encontrado</h1><p>Este endereço pode estar incorreto ou o produto não está publicado.</p></main>;

  const nutrition = product.nutrition || {};
  const nutrients = (() => {
    if (Array.isArray(nutrition.nutrientes)) return nutrition.nutrientes;
    if (typeof nutrition.nutrientes === 'string') {
      try {
        const parsed = JSON.parse(nutrition.nutrientes);
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    }
    return [];
  })();
  return <main style={styles.page}>
    <header style={styles.header}>
      <a href="/" aria-label="LM Pudins"><img src="/images/Logo%20horizontal.png" alt="LM Pudins" style={styles.logo}/></a>
      <a href="/#sabores" style={styles.back}><ArrowLeft size={16}/> Todos os sabores</a>
    </header>
    <article style={styles.card}>
      <div style={styles.visual}><img src={product.image} alt={product.name} style={styles.photo}/></div>
      <div style={styles.content}>
        <p style={styles.eyebrow}>COLEÇÃO LM PUDINS · {product.category}</p>
        <h1 style={styles.title}>{product.name}</h1>
        <p style={styles.short}>{product.short_description}</p>
        <p style={styles.description}>{product.description}</p>
        <section style={styles.section}>
          <h2>Ingredientes</h2>
          <p>{product.ingredients}</p>
        </section>
        <section style={styles.section}>
          <h2>Informação nutricional</h2>
          <p style={styles.serving}>Porção: {nutrition.porcao || '140 g (1 unidade / pote)'}</p>
          {nutrients.length ? <table style={styles.table}>
            <thead><tr><th style={styles.th}>Quantidade por porção</th><th style={{...styles.th,textAlign:'right'}}>Quantidade</th><th style={{...styles.th,textAlign:'right'}}>%VD*</th></tr></thead>
            <tbody>{nutrients.map((item) => <tr key={item[0]}><th scope="row" style={styles.rowHead}>{item[0]}</th><td style={styles.cell}>{item[1]}</td><td style={styles.cell}>{item[2]}</td></tr>)}</tbody>
          </table> : <p>Informação nutricional não cadastrada.</p>}
          {nutrition.nota_vd && <p style={styles.note}>{nutrition.nota_vd}</p>}
        </section>
        <section style={styles.warning}>
          <h2>Alérgicos</h2>
          <p>{nutrition.alergenicos || 'Consulte a embalagem para informações sobre alergênicos.'}</p>
          <p><strong>{nutrition.conservantes || 'Consulte as informações da embalagem.'}</strong></p>
        </section>
        <a href="/#pedidos" style={styles.cta}>Tenho interesse neste sabor <ArrowUpRight size={17}/></a>
        <p style={styles.footerNote}>Para pedidos e disponibilidade, entre em contato com a LM Pudins.</p>
      </div>
    </article>
    <footer style={styles.footer}>© LM Pudins · Uma doce assinatura</footer>
  </main>;
}

const styles = {
  page:{minHeight:'100vh',padding:'24px clamp(16px,4vw,56px) 40px',background:'radial-gradient(ellipse at top right,#4a202e 0,transparent 45%),#1c1014',color:'#f9eee2',fontFamily:'Inter,system-ui,-apple-system,sans-serif'},
  header:{maxWidth:1180,margin:'0 auto 28px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:18,borderBottom:'1px solid #65434c',paddingBottom:18},
  logo:{width:155,maxWidth:'40vw',display:'block'},
  back:{display:'inline-flex',alignItems:'center',gap:8,color:'#e5c780',textDecoration:'none',fontSize:14},
  card:{maxWidth:1180,margin:'0 auto',display:'grid',gridTemplateColumns:'minmax(0,0.85fr) minmax(0,1.15fr)',background:'#2b1920',border:'1px solid #65434c',borderRadius:18,overflow:'hidden',boxShadow:'0 24px 80px #0003'},
  visual:{background:'#38212a',minHeight:420,display:'flex',alignItems:'center',justifyContent:'center',padding:20},
  photo:{width:'100%',height:'100%',maxHeight:660,objectFit:'contain',borderRadius:10},
  content:{padding:'clamp(22px,4vw,48px)',minWidth:0},
  eyebrow:{fontSize:11,letterSpacing:'.16em',color:'#d7b36a',textTransform:'uppercase'},
  title:{fontFamily:'Georgia,serif',fontSize:'clamp(34px,5vw,56px)',fontWeight:400,lineHeight:1.05,margin:'12px 0'},
  short:{fontSize:18,lineHeight:1.6,color:'#f0d99d'},
  description:{fontSize:15,lineHeight:1.8,color:'#d7c7c1'},
  section:{marginTop:28,paddingTop:22,borderTop:'1px solid #65434c'},
  warning:{marginTop:24,padding:18,border:'1px solid #8a6b50',borderRadius:12,background:'#211319'},
  table:{width:'100%',borderCollapse:'collapse',fontSize:15,marginTop:12,lineHeight:1.55},
  th:{textAlign:'left',padding:'12px 8px',borderBottom:'1px solid #76515b',color:'#e5c780',fontWeight:600},
  rowHead:{textAlign:'left',fontWeight:600,padding:'12px 8px',borderBottom:'1px solid #65434c'},
  cell:{textAlign:'right',padding:'12px 8px',borderBottom:'1px solid #65434c',whiteSpace:'nowrap'},
  serving:{color:'#d7c7c1',fontSize:13},
  note:{fontSize:12,lineHeight:1.6,color:'#cbb9b7',marginTop:12},
  cta:{display:'inline-flex',alignItems:'center',gap:10,marginTop:24,padding:'13px 18px',borderRadius:8,background:'linear-gradient(135deg,#f0d99d,#c99a49)',color:'#29171a',fontWeight:700,textDecoration:'none'},
  footerNote:{fontSize:12,color:'#cbb9b7',marginTop:14},
  footer:{maxWidth:1180,margin:'24px auto 0',color:'#cbb9b7',fontSize:12,textAlign:'center'}
};
