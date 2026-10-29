import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, X, Instagram } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/lmpudinsgourmet/';
const WHATSAPP_URL = 'https://wa.me/5567991173161';

function getProductImages(product) {
  const source = product.images || product.gallery || product.gallery_images;
  const list = Array.isArray(source) ? source : [];
  const normalized = list.map((item, index) => {
    if (typeof item === 'string') return { src: item, caption: '' };
    if (!item || typeof item !== 'object') return null;
    return {
      src: item.url || item.src || item.image || item.path || '',
      caption: item.description || item.caption || item.alt || item.title || ''
    };
  }).filter((item) => item && item.src);
  if (product.image && !normalized.some((item) => item.src === product.image)) {
    normalized.unshift({ src: product.image, caption: product.image_description || product.image_caption || '' });
  }
  return normalized.length ? normalized : [{ src: '/images/campanha/hero-pudim.jfif', caption: '' }];
}

export default function ProductPage() {
  const slug = decodeURIComponent(window.location.pathname.split('/').filter(Boolean)[1] || '');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  const images = useMemo(() => product ? getProductImages(product) : [], [product]);
  const moveImage = (step) => setActiveImage((current) => (current + step + images.length) % images.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft') moveImage(-1);
      if (event.key === 'ArrowRight') moveImage(1);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = ''; };
  }, [lightboxOpen, images.length]);

  if (loading) return <main style={styles.page}><p>Carregando informações do produto…</p></main>;
  if (error || !product) return <main style={styles.page}><a style={styles.back} href="/#sabores">← Voltar aos sabores</a><h1>Produto não encontrado</h1><p>Este endereço pode estar incorreto ou o produto não está publicado.</p></main>;

  const nutrition = product.nutrition || {};
  const nutrients = (() => {
    if (Array.isArray(nutrition.nutrientes)) return nutrition.nutrientes;
    if (typeof nutrition.nutrientes === 'string') {
      try { const parsed = JSON.parse(nutrition.nutrientes); return Array.isArray(parsed) ? parsed : []; }
      catch { return []; }
    }
    return [];
  })();
  const currentImage = images[activeImage] || images[0];
  const imageCaption = currentImage.caption || `Conheça de perto o sabor ${product.name} da LM Pudins.`;

  return <main style={styles.page}>
    <header className="product-page-header" style={styles.header}>
      <a href="/" aria-label="LM Pudins"><img src="/images/Logo%20horizontal.png" alt="LM Pudins" style={styles.logo}/></a>
      <nav style={styles.headerLinks}>
        <a href="/#sabores" style={styles.back}><ArrowLeft size={16}/> Todos os sabores</a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={styles.instagram}><Instagram size={17}/> Instagram <ArrowUpRight size={14}/></a>
      </nav>
    </header>
    <div style={styles.pageHeading}>
      <p style={styles.eyebrow}>COLEÇÃO LM PUDINS · {product.category || 'SABORES ARTESANAIS'}</p>
      <h1 style={styles.title}>{product.name}</h1>
      {product.short_description && <p style={styles.short}>{product.short_description}</p>}
    </div>

    <section style={styles.gallerySection} aria-label={`Galeria de imagens de ${product.name}`}>
      <div className="product-page-gallery" style={styles.gallery}>
        <button type="button" style={{...styles.galleryArrow,...styles.arrowLeft}} onClick={() => moveImage(-1)} aria-label="Imagem anterior" disabled={images.length < 2}><ChevronLeft size={27}/></button>
        <button type="button" style={styles.imageButton} onClick={() => setLightboxOpen(true)} aria-label="Ampliar imagem">
          <img key={currentImage.src} src={currentImage.src} alt={currentImage.caption || product.name} style={styles.galleryImage}/>
          <span style={styles.expandHint}>Ampliar imagem <ArrowUpRight size={15}/></span>
        </button>
        <button type="button" style={{...styles.galleryArrow,...styles.arrowRight}} onClick={() => moveImage(1)} aria-label="Próxima imagem" disabled={images.length < 2}><ChevronRight size={27}/></button>
        {images.length > 1 && <div style={styles.imageCounter}>{String(activeImage + 1).padStart(2,'0')} / {String(images.length).padStart(2,'0')}</div>}
        <div style={styles.captionBar}><span style={styles.captionMark}>✦</span><p style={styles.captionText}>{imageCaption}</p></div>
      </div>
      {images.length > 1 && <div style={styles.dots} aria-label="Selecionar imagem">{images.map((image, index) => <button key={image.src + index} type="button" onClick={() => setActiveImage(index)} aria-label={`Ver imagem ${index + 1}`} style={{...styles.dot, ...(index === activeImage ? styles.dotActive : {})}} />)}</div>}
    </section>

    <article style={styles.details}>
      <section style={styles.descriptionSection}>
        <p style={styles.sectionEyebrow}>A EXPERIÊNCIA</p>
        <h2>Um sabor para <em>guardar na memória.</em></h2>
        <p style={styles.description}>{product.description || product.short_description || 'Uma experiência especial da coleção LM Pudins.'}</p>
      </section>
      <div className="product-page-info-grid" style={styles.infoGrid}>
        <section style={styles.section}>
          <h2>Ingredientes</h2>
          <p>{product.ingredients || 'Consulte a embalagem para ver a lista de ingredientes.'}</p>
        </section>
        <section style={styles.section}>
          <h2>Informação nutricional</h2>
          <p style={styles.serving}>Porção: {nutrition.porcao || '140 g (1 unidade / pote)'}</p>
          {nutrients.length ? <div style={styles.tableWrap}><table style={styles.table}>
            <thead><tr><th style={styles.th}>Nutriente</th><th style={{...styles.th,textAlign:'right'}}>Quantidade</th><th style={{...styles.th,textAlign:'right'}}>%VD*</th></tr></thead>
            <tbody>{nutrients.map((item, index) => <tr key={`${item[0] || 'nutriente'}-${index}`}><th scope="row" style={styles.rowHead}>{item[0]}</th><td style={styles.cell}>{item[1] ?? '—'}</td><td style={styles.cell}>{item[2] ?? '—'}</td></tr>)}</tbody>
          </table></div> : <p>Informação nutricional não cadastrada.</p>}
          {nutrition.nota_vd && <p style={styles.note}>{nutrition.nota_vd}</p>}
        </section>
      </div>
      <section style={styles.warning}>
        <h2>Alérgicos e conservação</h2>
        <p>{nutrition.alergenicos || 'Consulte a embalagem para informações sobre alergênicos.'}</p>
        <p><strong>{nutrition.conservantes || 'Consulte as informações de conservação e validade na embalagem.'}</strong></p>
      </section>
      <div style={styles.bottomActions}>
        <a href={`${WHATSAPP_URL}?text=${encodeURIComponent(`Olá! Tenho interesse no produto ${product.name}. Poderia me passar informações sobre disponibilidade e pedido?`)}`} target="_blank" rel="noopener noreferrer" style={styles.cta}>Pedir pelo WhatsApp <ArrowUpRight size={17}/></a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={styles.instagramLarge}><Instagram size={19}/> Acompanhe no Instagram <ArrowUpRight size={16}/></a>
      </div>
      <p style={styles.footerNote}>Para pedidos e disponibilidade, entre em contato com a LM Pudins.</p>
    </article>
    <footer style={styles.footer}>© LM Pudins · Uma doce assinatura <span>·</span> <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram <ArrowUpRight size={12}/></a></footer>

    {lightboxOpen && <div style={styles.lightbox} role="dialog" aria-modal="true" aria-label={`Imagem ampliada de ${product.name}`} onClick={(event) => event.target === event.currentTarget && setLightboxOpen(false)}>
      <button type="button" style={styles.lightboxClose} onClick={() => setLightboxOpen(false)} aria-label="Fechar imagem"><X size={25}/></button>
      {images.length > 1 && <button type="button" style={{...styles.lightboxArrow,left:18}} onClick={() => moveImage(-1)} aria-label="Imagem anterior"><ChevronLeft size={34}/></button>}
      <figure style={styles.lightboxFigure}>
        <img src={currentImage.src} alt={currentImage.caption || product.name} style={styles.lightboxImage}/>
        <figcaption style={styles.lightboxCaption}>{imageCaption}</figcaption>
      </figure>
      {images.length > 1 && <button type="button" style={{...styles.lightboxArrow,right:18}} onClick={() => moveImage(1)} aria-label="Próxima imagem"><ChevronRight size={34}/></button>}
    </div>}
  </main>;
}

const styles = {
  page:{minHeight:'100vh',padding:'24px clamp(16px,5vw,70px) 40px',background:'radial-gradient(ellipse at top right,#4a202e 0,transparent 45%),#1c1014',color:'#f9eee2',fontFamily:'Inter,system-ui,-apple-system,sans-serif'},
  header:{maxWidth:1180,margin:'0 auto 36px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:18,borderBottom:'1px solid #65434c',paddingBottom:18},
  logo:{width:155,maxWidth:'40vw',display:'block'},
  headerLinks:{display:'flex',alignItems:'center',gap:22,flexWrap:'wrap',justifyContent:'flex-end'},
  back:{display:'inline-flex',alignItems:'center',gap:8,color:'#e5c780',textDecoration:'none',fontSize:14},
  instagram:{display:'inline-flex',alignItems:'center',gap:7,color:'#f5dfad',textDecoration:'none',fontSize:14},
  pageHeading:{maxWidth:1180,margin:'0 auto 28px',textAlign:'center'},
  eyebrow:{fontSize:11,letterSpacing:'.19em',color:'#d7b36a',textTransform:'uppercase',margin:'0 0 12px'},
  title:{fontFamily:'Georgia,serif',fontSize:'clamp(38px,5vw,64px)',fontWeight:400,lineHeight:1.08,margin:'0 auto 12px',color:'#fff4e6'},
  short:{fontSize:18,lineHeight:1.7,color:'#e7cfa1',maxWidth:760,margin:'0 auto'},
  gallerySection:{maxWidth:1180,margin:'0 auto'},
  gallery:{position:'relative',height:'clamp(320px,55vw,610px)',background:'#2b1920',border:'1px solid #65434c',overflow:'hidden',boxShadow:'0 24px 80px #0003'},
  imageButton:{position:'absolute',inset:0,width:'100%',height:'100%',padding:0,border:0,background:'transparent',cursor:'zoom-in',display:'block'},
  galleryImage:{width:'100%',height:'100%',objectFit:'contain',display:'block',padding:'12px 70px 75px',boxSizing:'border-box'},
  galleryArrow:{position:'absolute',zIndex:3,top:'45%',display:'grid',placeItems:'center',width:48,height:58,border:'1px solid #d7b36a88',background:'#1c1014d9',color:'#f5dfad',cursor:'pointer',transition:'background .2s'},
  arrowLeft:{left:16},arrowRight:{right:16},
  imageCounter:{position:'absolute',zIndex:2,right:22,top:18,fontSize:11,letterSpacing:'.16em',color:'#f5dfad',background:'#1c1014b8',padding:'8px 10px',pointerEvents:'none'},
  expandHint:{position:'absolute',right:20,top:20,display:'inline-flex',alignItems:'center',gap:7,padding:'9px 12px',background:'#1c1014c9',color:'#f5dfad',fontSize:12,letterSpacing:'.03em'},
  captionBar:{position:'absolute',zIndex:2,left:0,right:0,bottom:0,display:'flex',alignItems:'center',gap:12,padding:'17px 24px',background:'linear-gradient(0deg,rgba(18,7,8,.96),rgba(18,7,8,.76))',borderTop:'1px solid #d7b36a55',pointerEvents:'none'},
  captionMark:{color:'#e5c780',fontSize:16,flex:'none'},
  captionText:{margin:0,fontSize:14,lineHeight:1.6,color:'#fff0dc'},
  dots:{display:'flex',justifyContent:'center',gap:9,padding:'18px 0 0'},
  dot:{width:8,height:8,borderRadius:20,border:0,background:'#8e7375',cursor:'pointer',padding:0},
  dotActive:{width:25,background:'#e5c780'},
  details:{maxWidth:1000,margin:'58px auto 0'},
  descriptionSection:{maxWidth:760,margin:'0 auto 42px',textAlign:'center'},
  sectionEyebrow:{fontSize:10,letterSpacing:'.2em',color:'#d7b36a',fontWeight:700},
  infoGrid:{display:'grid',gridTemplateColumns:'minmax(0,.8fr) minmax(0,1.2fr)',gap:44},
  section:{marginTop:16,paddingTop:22,borderTop:'1px solid #65434c',minWidth:0},
  warning:{marginTop:30,padding:22,border:'1px solid #8a6b50',borderRadius:12,background:'#211319'},
  tableWrap:{width:'100%',overflowX:'auto'},
  table:{width:'100%',borderCollapse:'collapse',fontSize:15,marginTop:12,lineHeight:1.55},
  th:{textAlign:'left',padding:'12px 8px',borderBottom:'1px solid #76515b',color:'#e5c780',fontWeight:600},
  rowHead:{textAlign:'left',fontWeight:600,padding:'12px 8px',borderBottom:'1px solid #65434c'},
  cell:{textAlign:'right',padding:'12px 8px',borderBottom:'1px solid #65434c',whiteSpace:'nowrap'},
  serving:{color:'#d7c7c1',fontSize:13},
  note:{fontSize:12,lineHeight:1.6,color:'#cbb9b7',marginTop:12},
  cta:{display:'inline-flex',alignItems:'center',gap:10,padding:'14px 20px',borderRadius:8,background:'linear-gradient(135deg,#f0d99d,#c99a49)',color:'#29171a',fontWeight:700,textDecoration:'none'},
  instagramLarge:{display:'inline-flex',alignItems:'center',gap:10,padding:'13px 18px',border:'1px solid #8a6b50',borderRadius:8,color:'#f5dfad',textDecoration:'none',fontWeight:600},
  bottomActions:{display:'flex',gap:14,flexWrap:'wrap',marginTop:30},
  description:{fontSize:17,lineHeight:1.9,color:'#d7c7c1',maxWidth:740,margin:'0 auto'},
  sectionTitle:{fontSize:25},
  footerNote:{fontSize:13,color:'#cbb9b7',marginTop:18},
  footer:{maxWidth:1180,margin:'45px auto 0',paddingTop:20,borderTop:'1px solid #65434c',color:'#cbb9b7',fontSize:12,textAlign:'center',display:'flex',justifyContent:'center',alignItems:'center',gap:8},
  lightbox:{position:'fixed',zIndex:1000,inset:0,background:'rgba(10,3,4,.94)',display:'flex',alignItems:'center',justifyContent:'center',padding:24},
  lightboxClose:{position:'absolute',zIndex:2,top:18,right:20,width:44,height:44,display:'grid',placeItems:'center',border:'1px solid #d7b36a88',background:'#241015',color:'#fff0dc',cursor:'pointer'},
  lightboxArrow:{position:'absolute',zIndex:2,top:'50%',transform:'translateY(-50%)',width:48,height:58,display:'grid',placeItems:'center',border:'1px solid #d7b36a88',background:'#241015dd',color:'#fff0dc',cursor:'pointer'},
  lightboxFigure:{margin:0,maxWidth:'min(1100px,85vw)',maxHeight:'90vh',display:'flex',flexDirection:'column',alignItems:'center',gap:14},
  lightboxImage:{maxWidth:'100%',maxHeight:'78vh',objectFit:'contain',display:'block'},
  lightboxCaption:{color:'#f4dfb2',fontSize:14,lineHeight:1.6,textAlign:'center',maxWidth:800}
};
