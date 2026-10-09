import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Menu, X, Sparkles, Heart, Instagram, MessageCircle, ChevronDown } from 'lucide-react';
import { products } from './products.js';

function Logo({ compact = false }) {
  return <a className={`brand ${compact ? 'brand-compact' : ''}`} href="#inicio" aria-label="LM Pudins — início">
    <span className="brand-monogram">LM</span>
    <span className="brand-name">Pudins<span>ARTESANAIS</span></span>
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
        <DessertVisual tone={product.tone} powdered={product.tone === 'cream'} />
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
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="modal-close" onClick={onClose} aria-label="Fechar detalhes"><X /></button>
      <div className={`modal-art art-${product.tone}`}><DessertVisual tone={product.tone} large powdered={product.tone === 'cream'} /></div>
      <div className="modal-copy">
        <span className="eyebrow">SABOR {product.number} · LM PUDINS</span>
        <h2 id="modal-title">{product.name}</h2>
        <p>{product.description}</p>
        <div className="ingredient-block"><span>INGREDIENTES DO CATÁLOGO</span><p>{product.ingredients}</p></div>
        <a className="button button-gold" href="#pedidos" onClick={onClose}>Tenho interesse <ArrowRight size={16} /></a>
        <small>Consulte disponibilidade e informações do produto diretamente com a marca.</small>
      </div>
    </section>
  </div>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [scrolled, setScrolled] = useState(false);
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const filters = ['Todos', 'Frutados', 'Intensos', 'Cremosos'];
  const visibleProducts = products.filter((p) => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Frutados') return ['berry','orange','passion','guava'].includes(p.tone);
    if (activeFilter === 'Intensos') return ['coffee','cane'].includes(p.tone);
    return ['cream'].includes(p.tone);
  });
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', onScroll, { passive: true });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => { window.removeEventListener('scroll', onScroll); observer.disconnect(); };
  }, []);
  const closeMenu = () => setMenuOpen(false);
  const handleContact = (event) => {
    event.preventDefault();
    const message = encodeURIComponent(`Olá! Conheci a LM Pudins pelo site e gostaria de saber mais sobre os sabores. Meu contato: ${contact}`);
    const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER;
    if (whatsapp) window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank', 'noopener,noreferrer');
    else setSubmitted(true);
  };
  return <>
    <header className={`site-header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-inner"><Logo />
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        <nav className={menuOpen ? 'nav nav-open' : 'nav'} aria-label="Navegação principal">
          <a href="#sabores" onClick={closeMenu}>Sabores</a><a href="#essencia" onClick={closeMenu}>Nossa essência</a><a href="#experiencia" onClick={closeMenu}>Experiência</a>
          <a className="nav-cta" href="#pedidos" onClick={closeMenu}>Faça sua consulta <ArrowUpRight size={15} /></a>
        </nav>
      </div>
    </header>

    <main>
      <section className="hero" id="inicio">
        <div className="hero-grain" />
        <div className="hero-copy">
          <span className="eyebrow eyebrow-gold"><span className="eyebrow-line" /> UMA DOCE ASSINATURA</span>
          <h1>Pequenos momentos.<br /><em>Grandes sabores.</em></h1>
          <p>Uma experiência cremosa, feita para despertar os sentidos e transformar qualquer ocasião em algo especial.</p>
          <div className="hero-actions"><a className="button button-gold" href="#sabores">Explore os sabores <ArrowRight size={17} /></a><a className="button button-quiet" href="#essencia">Conheça a LM <ArrowDown size={15} /></a></div>
          <div className="hero-proof"><span className="proof-icon"><Sparkles size={16} /></span><span>Uma coleção de sabores<br /><strong>para se apaixonar</strong></span></div>
        </div>
        <div className="hero-stage">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="hero-stamp"><span>FEITO COM</span><Heart size={17} fill="currentColor" /><span>CARINHO</span></div>
          <DessertVisual tone="classic" large />
          <div className="hero-note"><span className="note-rule" /><span>CREMOSIDADE<br /><strong>INESQUECÍVEL</strong></span></div>
          <div className="hero-floating floating-top">doce<br /><em>perfeição</em></div>
          <div className="hero-floating floating-bottom">LM <span>✦</span> PUDINS</div>
        </div>
        <a href="#sabores" className="scroll-cue"><span>ROLE PARA DESCOBRIR</span><span className="scroll-line" /></a>
      </section>

      <section className="intro-section" id="essencia">
        <div className="intro-mark">LM<span>✦</span></div>
        <div className="intro-copy reveal"><span className="eyebrow">O PRAZER ESTÁ NOS DETALHES</span><h2>Não é só sobremesa.<br /><em>É o momento todo.</em></h2></div>
        <p className="intro-description reveal">Do brilho delicado do caramelo à textura macia de cada fatia, cada pudim é um convite para desacelerar e saborear o que realmente importa.</p>
      </section>

      <section className="catalog-section" id="sabores">
        <div className="section-heading reveal"><div><span className="eyebrow eyebrow-gold">A COLEÇÃO LM</span><h2>Encontre seu <em>favorito.</em></h2></div><p>Sete personalidades, uma mesma paixão por sobremesas que ficam na memória.</p></div>
        <div className="catalog-toolbar"><span className="catalog-count">07 SABORES PARA DESCOBRIR</span><div className="filter-list" role="group" aria-label="Filtrar sabores">{filters.map((filter) => <button key={filter} className={activeFilter === filter ? 'filter-button filter-active' : 'filter-button'} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div></div>
        <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} onOpen={setSelectedProduct} />)}</div>
      </section>

      <section className="feature-section" id="experiencia">
        <div className="feature-art"><div className="feature-frame"><DessertVisual tone="berry" large /><span className="feature-vertical">UMA EXPERIÊNCIA SENSORIAL</span></div><span className="feature-number">01 <i>/ 03</i></span></div>
        <div className="feature-copy reveal"><span className="eyebrow eyebrow-gold">A PRIMEIRA IMPRESSÃO</span><h2>O brilho do caramelo.<br /><em>A arte do sabor.</em></h2><p>Uma calda brilhante que escorre suavemente, uma textura delicada e cores que convidam o olhar antes mesmo da primeira colherada.</p><div className="feature-points"><div><span><Check size={15} /></span><p><strong>Texturas que encantam</strong><small>Um visual tão especial quanto a experiência.</small></p></div><div><span><Check size={15} /></span><p><strong>Sabores com personalidade</strong><small>Do clássico às combinações mais vibrantes.</small></p></div></div><a className="text-link text-link-light" href="#sabores">Explore a coleção <ArrowRight size={15} /></a></div>
      </section>

      <section className="quote-section"><span className="quote-mark">“</span><p>Tem coisas que a gente prova.<br /><em>E tem coisas que a gente sente.</em></p><span className="quote-signature">LM PUDINS <i>✦</i></span></section>

      <section className="contact-section" id="pedidos">
        <div className="contact-orb"><DessertVisual tone="classic" large /></div>
        <div className="contact-copy reveal"><span className="eyebrow eyebrow-gold">SEU PRÓXIMO MOMENTO ESPECIAL</span><h2>Vamos adoçar<br /><em>seu dia?</em></h2><p>Conte pra gente como podemos fazer parte do seu momento. Consulte os sabores e a disponibilidade diretamente com a LM Pudins.</p>
          <form className="contact-form" onSubmit={handleContact}><label htmlFor="contact-input">Seu WhatsApp ou e-mail</label><div className="contact-input-row"><input id="contact-input" value={contact} onChange={(e) => { setContact(e.target.value); setSubmitted(false); }} placeholder="Como podemos falar com você?" required /><button type="submit" aria-label="Enviar consulta"><ArrowRight /></button></div><small>Usaremos o contato apenas para encaminhar sua consulta. Configure o canal oficial antes da publicação.</small>{submitted && <p className="form-feedback" role="status">O formulário visual está pronto. Para receber consultas, configure VITE_WHATSAPP_NUMBER no ambiente de publicação.</p>}</form>
        </div>
      </section>
    </main>

    <footer className="site-footer"><div className="footer-top"><Logo compact /><p>Uma doce assinatura<br />para momentos especiais.</p><a className="footer-back" href="#inicio">Voltar ao topo ↑</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} LM Pudins. Todos os direitos reservados.</span><span>FEITO PARA SER SABOREADO <i>✦</i></span><span className="footer-social"><a href="#pedidos" aria-label="Contato"><MessageCircle size={16} /></a><a href="#pedidos" aria-label="Instagram — configure o link oficial"><Instagram size={16} /></a></span></div></footer>
    <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
  </>;
}

export default App;