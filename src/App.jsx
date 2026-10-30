import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, ArrowLeft, Check, Menu, X, Sparkles, Heart, Instagram, MessageCircle, ChevronDown } from 'lucide-react';
import { products as fallbackProducts } from './products.js';

function Logo({ compact = false }) {
  return <a className={`brand ${compact ? 'brand-compact' : ''}`} href="#inicio" aria-label="LM Pudins — início">
    <img className="brand-image" src="/images/Logo%20circular.png" alt="LM Pudins" />
  </a>;
}

function DessertVisual({ tone = 'classic', large = false, powdered = false }) {
  return <div className={`dessert-visual dessert-${tone} ${large ? 'dessert-large' : ''} ${powdered ? 'dessert-powdered' : ''}`} aria-hidden="true">
    <div className="dessert-glow" />
    <div className="sauce-pool" />
    <div className="pudding">
      <div className="pudding-top"><span className="pudding-hole" /></div>
      <i className="drip drip-one" /><i className="drip drip-two" /><i className="drip drip-three" />
      <div className="pudding-shine" />
    </div>
    {powdered && <div className="powder-dust" />}
    <div className="plate" />
    <span className="visual-spark spark-one">✦</span><span className="visual-spark spark-two">✧</span>
  </div>;
}

function ProductCard({ product, onOpen }) {
  return <article className="product-card reveal" style={{ '--accent': product.accent }}>
    <button className="product-image-button" onClick={() => onOpen(product)} aria-label={`Ver detalhes de ${product.name}`}>
      <div className={`product-art art-${product.tone}`}>
        <span className="art-number">{product.number}</span>
        <img className="product-real-image" src={product.image} alt={`Pudim de ${product.name}`} loading="lazy" />
        <span className="art-caption">{product.tag}</span>
      </div>
      <span className="round-arrow"><ArrowUpRight size={18} /></span>
    </button>
    <div className="product-info">
      <span className="eyebrow">COLEÇÃO LM · {product.number}</span>
      <h3>{product.name}</h3>
      <p>{product.short}</p>
      <button className="text-link" onClick={() => onOpen(product)}>Descobrir sabor <ArrowRight size={15} /></button>
    </div>
  </article>;
}

function ProductModal({ product, onClose }) {
  useEffect(() => {
    if (!product) return;
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', closeOnEscape); document.body.style.overflow = ''; };
  }, [product, onClose]);
  if (!product) return null;
  const nutrition = product.nutrition || {};
  const parseNutrients = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string' || !value.trim()) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const nutrients = parseNutrients(nutrition.nutrientes);
  const otherNutrition = Object.entries(nutrition).filter(([key, value]) =>
    !['nutrientes', 'porcao', 'nota_vd', 'alergenicos', 'conservantes'].includes(key) &&
    value !== null && value !== '' && typeof value !== 'object'
  );
  const productUrl = `/produto/${product.slug || product.id}`;
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-controls">
        <a className="modal-open-page" href={productUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir ficha completa em outra página" title="Abrir em outra página"><ArrowUpRight size={20} /></a>
        <button className="modal-close" onClick={onClose} aria-label="Fechar detalhes"><X /></button>
      </div>
      <div className={`modal-art art-${product.tone}`}><img className="modal-real-image" src={product.image} alt={`Pudim de ${product.name}`} /></div>
      <div className="modal-copy">
        <span className="eyebrow">SABOR {product.number} · LM PUDINS</span>
        <h2 id="modal-title">{product.name}</h2>
        <p>{product.description}</p>
        <div className="ingredient-block"><span>INGREDIENTES DO CATÁLOGO</span><p>{product.ingredients}</p></div>
        {(nutrients.length > 0 || otherNutrition.length > 0) && <div className="ingredient-block nutrition-block"><span>INFORMAÇÃO NUTRICIONAL</span>
          <p className="nutrition-serving">Porção: {nutrition.porcao || '140 g (1 unidade / pote)'}</p>
          {nutrients.length > 0 ? <div className="nutrition-table-wrap"><table className="nutrition-table"><thead><tr><th>Quantidade por porção</th><th>Quantidade</th><th>%VD*</th></tr></thead><tbody>{nutrients.map((item, index) => <tr key={`${item[0] || 'nutriente'}-${index}`}><th scope="row">{item[0]}</th><td>{item[1] ?? '—'}</td><td>{item[2] ?? '—'}</td></tr>)}</tbody></table></div> : <table className="nutrition-table"><tbody>{otherNutrition.map(([key,value]) => <tr key={key}><th scope="row">{key.replaceAll('_',' ')}</th><td>{String(value)}</td></tr>)}</tbody></table>}
          {nutrition.nota_vd && <p className="nutrition-note">{nutrition.nota_vd}</p>}
        </div>}
        {nutrition.alergenicos && <div className="ingredient-block"><span>ALÉRGICOS</span><p>{nutrition.alergenicos}</p>{nutrition.conservantes && <p>{nutrition.conservantes}</p>}</div>}
        <a className="button button-gold" href="#pedidos" onClick={onClose}>Tenho interesse <ArrowRight size={16} /></a>
        <small>Consulte disponibilidade e informações do produto diretamente com a marca.</small>
      </div>
    </section>
  </div>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState(fallbackProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [scrolled, setScrolled] = useState(false);
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);\n  const [independentGallery, setIndependentGallery] = useState([]);
  const filters = ['Todos', 'Frutados', 'Intensos', 'Cremosos'];
  useEffect(() => {
    let cancelled = false;
    fetch('/api/products').then((response) => { if (!response.ok) throw new Error('API indisponível'); return response.json(); }).then((items) => {
      if (cancelled || !Array.isArray(items) || !items.length) return;
      const tones = { 'frutas-vermelhas':'berry', laranja:'orange', 'chocolate-cafe':'coffee', 'caldo-de-cana':'cane', maracuja:'passion', 'quatro-leites':'cream', 'romeu-julieta':'guava' };
      const accents = { berry:'#c52e50', orange:'#f28a28', coffee:'#6f3025', cane:'#bd8a36', passion:'#e9b52c', cream:'#e8d4a2', guava:'#b72b42' };
      const mapped = items.map((p, i) => { const tone = tones[p.slug] || (p.category === 'Frutados' ? 'berry' : p.category === 'Intensos' ? 'coffee' : 'cream'); return { ...p, id:p.slug, number:String(i+1).padStart(2,'0'), short:p.short_description || '', tone, accent:accents[tone] || '#bd8a36', tag:p.category || 'Coleção LM' }; });
      setCatalogProducts(mapped);
    }).catch(() => {}).finally(() => {});
    return () => { cancelled = true; };
  }, []);
  useEffect(() => { fetch('/api/gallery').then(r=>r.ok?r.json():[]).then(items=>setIndependentGallery(Array.isArray(items)?items:[])).catch(()=>{}); }, []);\n  const galleryItems = [...independentGallery.map(item=>({src:item.url,caption:item.description||item.category||'LM Pudins',product:null,key:'library-'+item.id})), ...catalogProducts.flatMap((product) => {
    const extraImages = Array.isArray(product.images) ? product.images : Array.isArray(product.gallery) ? product.gallery : [];
    const normalized = extraImages.map((item) => typeof item === 'string' ? { src: item, caption: '' } : {
      src: item?.url || item?.src || item?.image || item?.path || '',
      caption: item?.description || item?.caption || item?.alt || item?.title || ''
    }).filter((item) => item.src);
    if (product.image && !normalized.some((item) => item.src === product.image)) {
      normalized.unshift({ src: product.image, caption: product.name });
    }
    return normalized.map((item, index) => ({ ...item, product, key: `${product.slug || product.id}-${item.src}-${index}` }));
  })];
  const moveGallery = (step) => setGalleryIndex((current) => galleryItems.length ? (current + step + galleryItems.length) % galleryItems.length : 0);
  const visibleGalleryItem = galleryItems.length ? galleryItems[galleryIndex % galleryItems.length] : null;
  const visibleProducts = catalogProducts.filter((p) => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Frutados') return p.category === 'Frutados' || ['berry','orange','passion','guava'].includes(p.tone);
    if (activeFilter === 'Intensos') return p.category === 'Intensos' || ['coffee','cane'].includes(p.tone);
    return p.category === 'Cremosos' || ['cream'].includes(p.tone);
  });
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', onScroll, { passive: true });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => { window.removeEventListener('scroll', onScroll); observer.disconnect(); };
  }, [activeFilter]);
  const closeMenu = () => setMenuOpen(false);
  const handleContact = (event) => {
    event.preventDefault();
    const message = encodeURIComponent(`Olá! Conheci a LM Pudins pelo site e gostaria de saber mais sobre os sabores. Meu contato: ${contact}`);
    const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER || '5567991173161';
    if (whatsapp) window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank', 'noopener,noreferrer');
    else setSubmitted(true);
  };
  return <>
    <header className={`site-header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-inner"><Logo />
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        <nav className={menuOpen ? 'nav nav-open' : 'nav'} aria-label="Navegação principal">
          <a href="#inicio" onClick={closeMenu}>Início</a><a href="#sabores" onClick={closeMenu}>Sabores</a><a href="#quem-somos" onClick={closeMenu}>Quem somos</a><a href="#galeria" onClick={closeMenu}>Galeria</a><a href="#pedidos" onClick={closeMenu}>Pedidos</a><a href="#contato" onClick={closeMenu}>Contato</a>
          <a className="nav-cta" href="https://www.ifood.com.br/delivery/campo-grande-ms/lm-pudins-nova-lima" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Peça pelo iFood <ArrowUpRight size={15} /></a>
        </nav>
      </div>
    </header>

    <main>
      <section className="hero" id="inicio">
        <div className="hero-grain" />
        <div className="hero-copy">
          <span className="eyebrow eyebrow-gold"><span className="eyebrow-line" /> PUDINS ARTESANAIS</span>
          <h1>Mais que uma sobremesa,<br /><em>é uma experiência!</em></h1>
          <p>Na LM Pudins, cada sabor é cuidadosamente preparado para despertar o melhor dos seus momentos. Cremosos, irresistíveis e feitos com ingredientes selecionados.</p>
          <div className="hero-actions"><a className="button button-gold" href="https://www.ifood.com.br/delivery/campo-grande-ms/lm-pudins-nova-lima" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🛵</span> Peça pelo iFood <ArrowUpRight size={17} /></a><a className="button button-quiet" href="#sabores">Conheça nossos sabores <ArrowRight size={17} /></a></div>
          
        </div>
        <div className="hero-stage">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="hero-stamp"><span>FEITO COM</span><Heart size={17} fill="currentColor" /><span>CARINHO</span></div>
          <img className="hero-photo" src="/images/campanha/hero-pudim.jfif" alt="Pudim clássico com calda de caramelo da LM Pudins" fetchPriority="high" />
          <div className="hero-note"><span className="note-rule" /><span>CREMOSIDADE<br /><strong>INESQUECÍVEL</strong></span></div>
          <div className="hero-floating floating-top">doce<br /><em>perfeição</em></div>
          <div className="hero-floating floating-bottom">LM <span>✦</span> PUDINS</div>
        </div>
        <a href="#sabores" className="scroll-cue"><span>ROLE PARA DESCOBRIR</span><span className="scroll-line" /></a>
      </section>

      <section className="intro-section" id="essencia">
        <div className="intro-mark"><img src="/images/Logo%20circular.png" alt="Logo circular da LM Pudins" /></div>
        <div className="intro-copy reveal"><span className="eyebrow">O PRAZER ESTÁ NOS DETALHES</span><h2>Não é só sobremesa.<br /><em>É o momento todo.</em></h2></div>
        <p className="intro-description reveal">Do brilho delicado do caramelo à textura macia de cada fatia, cada pudim é um convite para desacelerar e saborear o que realmente importa.</p>
      </section>

      <section className="catalog-section" id="sabores">
        <div className="section-heading reveal"><div><span className="eyebrow eyebrow-gold">NOSSO CATÁLOGO</span><h2>{catalogProducts.length} {catalogProducts.length === 1 ? "Sabor Incrível" : "Sabores Incríveis"}</h2></div><p>Sete personalidades, uma mesma paixão por sobremesas que ficam na memória.</p></div>
        <div className="catalog-toolbar"><span className="catalog-count" aria-live="polite">{String(visibleProducts.length).padStart(2, '0')} {visibleProducts.length === 1 ? 'SABOR DISPONÍVEL' : 'SABORES PARA DESCOBRIR'}</span><div className="filter-list" role="group" aria-label="Filtrar sabores">{filters.map((filter) => <button type="button" key={filter} aria-pressed={activeFilter === filter} className={activeFilter === filter ? 'filter-button filter-active' : 'filter-button'} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div></div>
        <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} onOpen={setSelectedProduct} />)}</div>
      </section>

      <section className="feature-section" id="essencia">
        <div className="feature-art"><div className="feature-frame"><img className="feature-real-image" src="/images/campanha/detalhe-caramelo.jfif" alt="Detalhe da calda de caramelo sobre pudim" loading="lazy" /><span className="feature-vertical">UMA EXPERIÊNCIA SENSORIAL</span></div><span className="feature-number">01 <i>/ 03</i></span></div>
        <div className="feature-copy reveal"><span className="eyebrow eyebrow-gold">NOSSA ESSÊNCIA</span><h2>Tradição e Qualidade<br /><em>em Cada Receita</em></h2><p>A LM Pudins nasceu da paixão por doces e do desejo de transformar ingredientes simples em momentos extraordinários. Cada pudim é feito com carinho, seguindo receitas que valorizam o sabor, a textura e a qualidade.</p><div className="feature-points"><div><span><Check size={15} /></span><p><strong>Ingredientes</strong><small>selecionados</small></p></div><div><span><Check size={15} /></span><p><strong>Produção</strong><small>artesanal</small></p></div><div><span><Check size={15} /></span><p><strong>Sabor</strong><small>incomparável</small></p></div><div><span><Heart size={15} /></span><p><strong>Feito com</strong><small>muito carinho</small></p></div></div><a className="text-link text-link-light" href="#sabores">Explore a coleção <ArrowRight size={15} /></a></div>
      </section>

      <section className="gallery-section" id="galeria">
        <div className="gallery-intro"><span className="eyebrow eyebrow-gold">GALERIA GASTRONÔMICA</span><h2>Beleza que<br /><em>se saboreia</em></h2><p>Conheça a LM Pudins por meio de nossos produtos, embalagens, loja e bastidores.</p><div className="gallery-counter">{galleryItems.length ? String(galleryIndex + 1).padStart(2,'0') : '00'} / {String(galleryItems.length).padStart(2,'0')}</div><a className="button button-quiet" href="#sabores">Ver nossos sabores <ArrowRight size={16}/></a></div>
        <div className="gallery-carousel" aria-live="polite">
          <button className="gallery-arrow" type="button" onClick={() => moveGallery(-1)} aria-label="Imagem anterior" disabled={galleryItems.length < 2}><ArrowLeft size={22}/></button>
          {visibleGalleryItem ? <button type="button" className="gallery-photo gallery-photo-main" key={visibleGalleryItem.key} onClick={() => visibleGalleryItem.product && setSelectedProduct(visibleGalleryItem.product)} aria-label={visibleGalleryItem.caption || 'Imagem da LM Pudins'}><img src={visibleGalleryItem.src} alt={visibleGalleryItem.caption || visibleGalleryItem.product.name} loading="lazy"/><span>{visibleGalleryItem.caption || visibleGalleryItem.product.name}</span></button> : <p className="gallery-empty">As imagens dos produtos aparecerão aqui quando o catálogo estiver disponível.</p>}
          <button className="gallery-arrow" type="button" onClick={() => moveGallery(1)} aria-label="Próxima imagem" disabled={galleryItems.length < 2}><ArrowRight size={22}/></button>
        </div>
      </section>
      <section className="about-section" id="quem-somos">
        <div className="about-mark"><img src="/images/Logo%20circular.png" alt="Logo da LM Pudins" loading="lazy"/></div>
        <div className="about-copy"><span className="eyebrow eyebrow-gold">QUEM SOMOS</span><h2>Uma paixão que virou<br/><em>doce propósito.</em></h2><p>A LM Pudins surgiu do carinho pela confeitaria e da vontade de transformar receitas em momentos especiais. Acreditamos que uma sobremesa pode reunir pessoas, celebrar conquistas e tornar simples encontros em lembranças gostosas.</p><p>Nossa ideia é unir sabor, cuidado artesanal e ingredientes selecionados em pudins feitos com atenção a cada detalhe — do preparo à apresentação — para levar um pouco mais de doçura ao dia de cada cliente.</p><a className="button button-quiet" href="#sabores">Conheça nossos sabores <ArrowRight size={16}/></a></div>
      </section>

      <section className="contact-section" id="pedidos">
        <div className="contact-orb"><DessertVisual tone="classic" large /></div>
        <div className="contact-copy reveal"><span className="eyebrow eyebrow-gold">PRONTO PARA ADOÇAR SEU DIA?</span><h2>Faça seu <em>pedido!</em></h2><p>Escolha seu sabor favorito e garanta essa experiência.</p>
          <form className="contact-form" id="contato" onSubmit={handleContact}><label htmlFor="contact-input">Seu WhatsApp ou e-mail</label><div className="contact-input-row"><input id="contact-input" value={contact} onChange={(e) => { setContact(e.target.value); setSubmitted(false); }} placeholder="Como podemos falar com você?" required /><button type="submit" aria-label="Enviar consulta"><ArrowRight /></button></div><small>Usaremos o contato apenas para encaminhar sua consulta. Configure o canal oficial antes da publicação.</small>{submitted && <p className="form-feedback" role="status">O formulário visual está pronto. Para receber consultas, configure VITE_WHATSAPP_NUMBER no ambiente de publicação.</p>}</form>
        </div>
      </section>
    </main>

    <footer className="site-footer"><div className="footer-top"><Logo compact /><p>LM Pudins<br />A sobremesa perfeita para adoçar sua vida!</p><a className="footer-back" href="https://www.ifood.com.br/delivery/campo-grande-ms/lm-pudins-nova-lima" target="_blank" rel="noopener noreferrer">Peça pelo iFood ↗</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} LM Pudins. Todos os direitos reservados.</span><span>FEITO PARA SER SABOREADO <i>✦</i></span><span className="footer-social"><a href="https://wa.me/5567991173161" target="_blank" rel="noopener noreferrer" aria-label="Fale com a LM Pudins pelo WhatsApp"><MessageCircle size={16} /></a><a href="https://www.instagram.com/lmpudinsgourmet/" target="_blank" rel="noopener noreferrer" aria-label="Instagram da LM Pudins"><Instagram size={16} /></a></span></div></footer>
    <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
  </>;
}

export default App;